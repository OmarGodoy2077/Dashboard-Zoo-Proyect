require('dotenv').config();
const { Pool } = require('pg');

console.log('🧪 Prueba de conexión a Supabase');
console.log('================================');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Faltante');
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Faltante');

if (process.env.SUPABASE_URL) {
  console.log('- URL de Supabase:', process.env.SUPABASE_URL);
} else {
  console.error('❌ SUPABASE_URL no está configurada en el .env');
  process.exit(1);
}

// Construir la URL de conexión desde las variables de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está configurada en el .env');
  process.exit(1);
}

// Extraer información de la URL de Supabase
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
console.log('- Referencia del proyecto:', projectRef);

// Construir la URL de conexión PostgreSQL para Supabase
const databaseUrl = `postgresql://postgres:${serviceRoleKey}@db.${projectRef}.supabase.co:5432/postgres`;

console.log('\n🔄 Intentando diferentes métodos de conexión...');

// Configuración simple para prueba
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  },
  max: 1,
  connectionTimeoutMillis: 15000, // 15 segundos
  idleTimeoutMillis: 10000,
  allowExitOnIdle: true
});

async function testConnection() {
  try {
    console.log('\n🔄 Método 1: Conexión directa con Pool...');
    
    const client = await pool.connect();
    console.log('✅ Conexión establecida exitosamente');
    
    const result = await client.query(`
      SELECT 
        NOW() as current_time,
        version() as postgres_version,
        current_database() as database_name,
        current_user as user_name
    `);
    
    console.log('\n📊 Información del servidor:');
    console.log('- Hora del servidor:', result.rows[0].current_time);
    console.log('- PostgreSQL:', result.rows[0].postgres_version.split(' ')[0]);
    console.log('- Base de datos:', result.rows[0].database_name);
    console.log('- Usuario conectado:', result.rows[0].user_name);
    
    // Probar si existen las tablas
    console.log('\n🔍 Verificando tablas existentes...');
    const tables = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tablas en la base de datos:');
    if (tables.rows.length > 0) {
      tables.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name} (${row.table_type})`);
      });
    } else {
      console.log('⚠️  No hay tablas públicas. Necesitas ejecutar el schema.sql');
      console.log('💡 Ejecuta: psql -d tu_database -f schema.sql');
    }
    
    // Verificar si existe alguna tabla específica del proyecto
    const specificTables = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('usuarios', 'animales', 'empleados', 'alimentos')
      ) as has_project_tables
    `);
    
    if (specificTables.rows[0].has_project_tables) {
      console.log('✅ Las tablas del proyecto están configuradas');
    } else {
      console.log('⚠️  Las tablas del proyecto no están configuradas');
      console.log('💡 Necesitas ejecutar el archivo schema.sql en Supabase');
    }
    
    client.release();
    console.log('\n✅ Prueba de conexión completada exitosamente');
    return true;
    
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message);
    console.error('🔍 Tipo de error:', error.code || 'UNKNOWN');
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 Problema de timeout - Posibles soluciones:');
      console.log('1. Verifica tu conexión a internet');
      console.log('2. Verifica que el proyecto Supabase esté activo');
      console.log('3. Verifica la URL en SUPABASE_URL');
      console.log('4. Intenta usar el Connection Pooler en lugar de Direct Connection');
    } else if (error.message.includes('authentication') || error.message.includes('password')) {
      console.log('\n💡 Problema de autenticación - Posibles soluciones:');
      console.log('1. Verifica SUPABASE_SERVICE_ROLE_KEY en el .env');
      console.log('2. Regenera las credenciales en Supabase > Settings > API');
      console.log('3. Asegúrate de usar service_role key, no anon key');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Problema de proyecto - Posibles soluciones:');
      console.log('1. Verifica que el proyecto Supabase existe');
      console.log('2. Verifica la URL del proyecto');
      console.log('3. Asegúrate de que el proyecto no esté pausado');
    } else {
      console.log('\n💡 Error desconocido - Información de diagnóstico:');
      console.log('- URL de conexión (censurada):', databaseUrl.replace(/:[^:@]*@/, ':***@'));
      console.log('- Error completo:', error);
    }
    
    return false;
  }
}

async function testAlternativeConnection() {
  console.log('\n🔄 Método 2: Conexión con configuración alternativa...');
  
  // Configuración alternativa usando pooler
  const poolerUrl = `postgresql://postgres.${projectRef}:${serviceRoleKey}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
  
  const altPool = new Pool({
    connectionString: poolerUrl,
    ssl: {
      rejectUnauthorized: false
    },
    max: 1,
    connectionTimeoutMillis: 20000, // 20 segundos
  });
  
  try {
    const client = await altPool.connect();
    console.log('✅ Conexión alternativa exitosa (usando pooler)');
    
    const result = await client.query('SELECT NOW() as time');
    console.log('⏰ Hora del servidor:', result.rows[0].time);
    
    client.release();
    await altPool.end();
    return true;
  } catch (error) {
    console.log('❌ Conexión alternativa falló:', error.message);
    await altPool.end();
    return false;
  }
}

async function runDiagnostics() {
  console.log('\n🚀 Iniciando diagnóstico de conexión...\n');
  
  try {
    // Probar conexión principal
    const primarySuccess = await testConnection();
    
    if (!primarySuccess) {
      // Si falla, probar método alternativo
      console.log('\n🔄 Probando método alternativo...');
      const altSuccess = await testAlternativeConnection();
      
      if (altSuccess) {
        console.log('\n💡 Recomendación: Actualiza tu configuración para usar el pooler');
      }
    }
    
  } catch (error) {
    console.error('\n💀 Error crítico en el diagnóstico:', error);
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // Ignorar errores al cerrar
    }
  }
}

// Información de ayuda
function printHelp() {
  console.log('\n📚 Guía rápida para solucionar problemas:');
  console.log('=====================================');
  console.log('');
  console.log('1. 🔑 Obtener credenciales correctas:');
  console.log('   - Ve a https://supabase.com');
  console.log('   - Abre tu proyecto');
  console.log('   - Settings > API');
  console.log('   - Copia "Project URL" y "service_role" key');
  console.log('');
  console.log('2. 🗄️ Configurar base de datos:');
  console.log('   - SQL Editor en Supabase');
  console.log('   - Ejecuta el contenido de schema.sql');
  console.log('');
  console.log('3. 🔧 Actualizar .env:');
  console.log('   SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key');
  console.log('');
  console.log('4. 🧪 Ejecutar esta prueba nuevamente:');
  console.log('   node test-connection.js');
}

// Ejecutar diagnóstico
runDiagnostics()
  .then(() => {
    console.log('\n🎉 Diagnóstico completado');
    printHelp();
    process.exit(0);
  })
  .catch((error) => {
    console.log('\n💀 Diagnóstico falló completamente');
    console.error(error);
    printHelp();
    process.exit(1);
  });