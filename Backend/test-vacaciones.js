// Script de prueba para la funcionalidad de actualización automática de estado de empleados por vacaciones
const rrhhService = require('./services/rrhhService');

async function testVacacionesFunctionality() {
  console.log('🧪 Probando funcionalidad de actualización automática de estado de empleados por vacaciones...\n');

  try {
    // Ejecutar la función de actualización
    console.log('⏳ Ejecutando actualización de estado de empleados...');
    const resultado = await rrhhService.actualizarEstadoEmpleadosVacaciones();

    console.log('✅ Resultado:', resultado);
    console.log('\n🎉 Prueba completada exitosamente!');
    console.log('💡 La función se ejecutará automáticamente todos los días a las 6:00 AM');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    process.exit(1);
  }
}

// Ejecutar la prueba
testVacacionesFunctionality();