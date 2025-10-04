const express = require('express');
const router = express.Router();
const limpiezaController = require('../controllers/limpieza.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateLimpieza } = require('../middleware/validation');
const { checkTareasVencidas } = require('../services/limpiezaService');
const { logger } = require('../middleware/logger');
const websocketService = require('../services/websocketService');

// Verificar tareas vencidas periódicamente y emitir alertas
const cron = require('node-cron');

// Programar verificación diaria de tareas vencidas a las 8:00 AM
cron.schedule('0 8 * * *', async () => {
  try {
    logger.info('Iniciando verificación diaria de tareas de limpieza vencidas');
    const tareasVencidas = await checkTareasVencidas();
    
    if (tareasVencidas.length > 0) {
      logger.warn('Se encontraron tareas de limpieza vencidas', { count: tareasVencidas.length });
      
      // Emitir alerta a través de WebSocket
      websocketService.broadcastAlert({
        type: 'warning',
        title: 'Tareas de Limpieza Vencidas',
        message: `Hay ${tareasVencidas.length} tareas de limpieza pendientes de atención`,
        tareas: tareasVencidas.map(t => ({
          id: t.id,
          area: t.area,
          proxima_fecha: t.proxima_fecha,
          encargado_id: t.encargado_id
        })),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error en la verificación diaria de tareas vencidas', { error: error.message });
  }
});

// Rutas para tareas de limpieza
router.get('/', auth, limpiezaController.getAllTareas);
router.post('/', auth, validateLimpieza, limpiezaController.createTarea);
router.get('/:id', auth, limpiezaController.getTareaById);
router.put('/:id', auth, validateLimpieza, limpiezaController.updateTarea);
router.delete('/:id', auth, authorize('admin'), limpiezaController.deleteTarea);

// Ruta para obtener empleados disponibles para tareas de limpieza
router.get('/empleados/disponibles', auth, limpiezaController.getEmpleadosDisponibles);

module.exports = router;