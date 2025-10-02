// Configuración de la base de datos para Supabase
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variable de entorno requerida faltante: ${envVar}`);
  }
}

// Obtener información de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extraer referencia del proyecto de la URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

console.log('=== Configurando conexión a Supabase...');
console.log('=== Proyecto:', projectRef);

// Configuración usando el cliente oficial de Supabase
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función para probar la conexión usando Supabase Client
const testConnection = async () => {
  try {
    console.log('=== Probando conexión con cliente Supabase...');
    
    // Probar con una consulta simple para verificar la conexión
    const { data, error } = await supabase
      .from('usuarios') // Usamos una tabla que debería existir en el sistema
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Error con cliente Supabase:', error.message);
      throw error;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    console.log('=== Cliente Supabase funcional');
    
    return true;
  } catch (err) {
    console.error('❌ Error al conectar a Supabase:', err.message);
    throw err;
  }
};

// Función para ejecutar consultas (para compatibilidad con el código existente)
const query = async (sql, params = []) => {
 try {
    // Esta función es un placeholder para mantener compatibilidad
    // En Supabase real, se usarían métodos como .from().select(), etc.
    throw new Error('Para Supabase, usa el cliente directamente con métodos como .from().select()/insert()/update()/delete()');
  } catch (err) {
    console.error('❌ Error en la consulta:', err.message);
    throw err;
  }
};

// Función auxiliar para obtener el cliente de Supabase
const getSupabaseClient = () => {
  return supabase;
};

module.exports = {
  supabase,
  testConnection,
  getSupabaseClient,
  query
};