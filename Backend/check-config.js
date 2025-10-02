const dotenv = require('dotenv');
dotenv.config();

console.log('🔍 Verificando configuración del sistema...\n');

// Variables requeridas
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET'
];

const optionalVars = [
  'SUPABASE_ANON_KEY',
  'NODE_ENV',
  'PORT',
  'ALLOWED_ORIGINS',
  'BCRYPT_SALT_ROUNDS'
];

console.log('📋 Variables de entorno requeridas:');
let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('KEY') || varName.includes('SECRET') ? '***OCULTO***' : value}`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allGood = false;
  }
});

console.log('\n📋 Variables de entorno opcionales:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('KEY') || varName.includes('SECRET') ? '***OCULTO***' : value}`);
  } else {
    console.log(`⚠️  ${varName}: Usando valor por defecto`);
  }
});

if (!allGood) {
  console.log('\n❌ CONFIGURACIÓN INCOMPLETA');
  console.log('\n📝 Para solucionar este problema:');
  console.log('1. Crea un archivo .env en la raíz del proyecto Backend/');
  console.log('2. Copia el contenido de .env.example');
  console.log('3. Completa con tus credenciales de Supabase');
  console.log('4. Ejecuta el servidor nuevamente');
  console.log('\n🔗 Si no tienes un proyecto Supabase:');
  console.log('1. Ve a https://supabase.com');
  console.log('2. Crea una cuenta gratuita');
  console.log('3. Crea un nuevo proyecto');
  console.log('4. En Settings > API obtén las claves');
  console.log('5. En SQL Editor ejecuta el archivo schema_supabase.sql');
  process.exit(1);
} else {
  console.log('\n✅ CONFIGURACIÓN CORRECTA');
  console.log('🚀 Puedes iniciar el servidor con: npm run dev');
}

// Test de conexión básico si todo está configurado
if (allGood && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('\n🔌 Probando conexión a Supabase...');
  
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  supabase
    .from('usuarios')
    .select('count', { count: 'exact', head: true })
    .then(({ data, error, count }) => {
      if (error) {
        console.log('❌ Error de conexión:', error.message);
        console.log('\n💡 Posibles soluciones:');
        console.log('1. Verifica que las credenciales de Supabase sean correctas');
        console.log('2. Ejecuta el esquema SQL en tu proyecto Supabase');
        console.log('3. Verifica que la tabla "usuarios" existe');
      } else {
        console.log(`✅ Conexión exitosa! Usuarios en BD: ${count || 0}`);
        console.log('🎉 Todo listo para usar la API!');
      }
    })
    .catch(err => {
      console.log('❌ Error inesperado:', err.message);
    });
}