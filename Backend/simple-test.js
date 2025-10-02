// Script simple para probar conexión con cliente Supabase
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

async function testSupabaseConnection() {
  console.log('🧪 Prueba simple de Supabase...\n');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Configuración:');
  console.log(`- URL: ${supabaseUrl}`);
  console.log(`- Service Role Key: ${serviceRoleKey ? 'Configurada ✅' : 'Faltante ❌'}`);
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Faltan credenciales de Supabase');
    return;
  }
  
  try {
    console.log('\n🔄 Creando cliente de Supabase...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('✅ Cliente creado exitosamente');
    
    console.log('\n🔄 Probando consulta simple...');
    
    // Probar una consulta muy básica
    const { data, error } = await supabase
      .from('animales')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Error en consulta:', error.message);
      console.log('📊 Código de error:', error.code);
      console.log('📝 Details:', error.details);
      
      if (error.code === 'PGRST116') {
        console.log('\n💡 La tabla "animales" no existe todavía.');
        console.log('🔧 Necesitas ejecutar el script schema.sql en Supabase');
      }
    } else {
      console.log('✅ Consulta exitosa!');
      console.log('📊 Datos encontrados:', data ? data.length : 0);
    }
    
  } catch (err) {
    console.error('❌ Error inesperado:', err.message);
  }
}

testSupabaseConnection();