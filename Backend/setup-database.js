// Script para crear las tablas en Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
  console.log('🏗️ Configurando base de datos de Jungle Planet Zoo...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Faltan credenciales de Supabase');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log('📖 Leyendo schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('✅ Schema leído exitosamente');
    console.log(`📏 Tamaño: ${(schema.length / 1024).toFixed(2)} KB`);
    
    // Dividir el schema en declaraciones individuales
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`\n🔨 Ejecutando ${statements.length} declaraciones SQL...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (!statement || statement.length < 10) continue;
      
      try {
        console.log(`⚙️ Ejecutando declaración ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          console.log(`⚠️ Error en declaración ${i + 1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
        
      } catch (err) {
        console.log(`❌ Error ejecutando declaración ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Resumen de ejecución:`);
    console.log(`✅ Exitosas: ${successCount}`);
    console.log(`❌ Con errores: ${errorCount}`);
    
    // Verificar que las tablas se crearon
    console.log('\n🔍 Verificando tablas creadas...');
    
    const tables = ['usuarios', 'empleados', 'animales', 'visitantes', 'cuidados'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(0);
        
        if (error) {
          console.log(`❌ Tabla ${table}: No existe o error`);
        } else {
          console.log(`✅ Tabla ${table}: Creada correctamente`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error al verificar`);
      }
    }
    
    console.log('\n🎉 ¡Configuración de base de datos completada!');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  }
}

setupDatabase();