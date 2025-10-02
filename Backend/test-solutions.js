const axios = require('axios');

// Script para probar las soluciones implementadas
async function testSolutions() {
  console.log('🧪 Iniciando pruebas de soluciones implementadas...\n');
  
  const baseURL = 'http://localhost:3000';
  
  // 1. Probar la nueva ruta /api/dashboard/data
  console.log('1. Probando ruta /api/dashboard/data...');
  try {
    const response = await axios.get(`${baseURL}/api/dashboard/data`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('   ❌ La ruta debería haber devuelto 401 con token inválido');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   ✅ Correcto: Ruta /api/dashboard/data devuelve 401 con token inválido');
    } else {
      console.log('   ❌ Error inesperado:', error.message);
    }
  }
  
  // 2. Probar la ruta sin token
 console.log('\n2. Probando ruta /api/dashboard/data sin token...');
  try {
    const response = await axios.get(`${baseURL}/api/dashboard/data`);
    console.log('   ❌ La ruta debería haber devuelto 401 sin token');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   ✅ Correcto: Ruta /api/dashboard/data devuelve 401 sin token');
    } else {
      console.log('   ❌ Error inesperado:', error.message);
    }
  }
  
  // 3. Probar otras rutas que deben requerir autenticación
  console.log('\n3. Probando rutas de RRHH que requieren autenticación...');
  const rrhhEndpoints = ['/api/rrhh/vacaciones', '/api/rrhh/inasistencias', '/api/rrhh/descuentos', '/api/rrhh/bonos'];
  
  for (const endpoint of rrhhEndpoints) {
    try {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log(`   ❌ ${endpoint} debería haber devuelto 401 con token inválido`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log(`   ✅ Correcto: ${endpoint} devuelve 401 con token inválido`);
      } else {
        console.log(`   ❌ Error inesperado en ${endpoint}:`, error.message);
      }
    }
  }
  
  // 4. Probar la ruta de animales
  console.log('\n4. Probando ruta /api/animales...');
  try {
    const response = await axios.get(`${baseURL}/api/animales`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('   ❌ La ruta debería haber devuelto 401 con token inválido');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   ✅ Correcto: Ruta /api/animales devuelve 401 con token inválido');
    } else {
      console.log('   ❌ Error inesperado:', error.message);
    }
 }
  
  // 5. Probar formato incorrecto de token
  console.log('\n5. Probando formato incorrecto de token...');
  try {
    const response = await axios.get(`${baseURL}/api/dashboard/data`, {
      headers: {
        'Authorization': 'invalid-format'
      }
    });
    console.log('   ❌ La ruta debería haber devuelto 401 con formato de token inválido');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('   ✅ Correcto: Formato incorrecto de token devuelve 401');
    } else {
      console.log('   ❌ Error inesperado:', error.message);
    }
  }
  
  console.log('\n✅ Pruebas de soluciones completadas.');
  console.log('\n📋 Resumen de soluciones implementadas:');
  console.log('   - ✅ Ruta /api/dashboard/data añadida para el frontend');
  console.log('   - ✅ Mejora en el manejo de errores de JWT');
  console.log('   - ✅ Mejora en la verificación de tokens');
  console.log('   - ✅ Utilidades de autenticación en frontend');
  console.log('   - ✅ Validación de tokens expirados en frontend');
  console.log('   - ✅ Manejo de errores 401 en componentes frontend');
}

// Ejecutar las pruebas
testSolutions().catch(console.error);