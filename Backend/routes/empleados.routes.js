const express = require('express');
const router = express.Router();

const empleadoController = require('../controllers/empleado.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateEmpleado, validateId, validatePagination } = require('../middleware/validation');
const { createLimiter } = require('../middleware/rateLimiter');

// Rutas de lectura
router.get('/', 
  auth, 
  // Permitir a todos los roles autenticados ver la lista de empleados para seleccionarlos
  // authorize('admin', 'contador'),
  validatePagination,
  empleadoController.getAllEmpleados
);

router.get('/estadisticas', 
  auth, 
  authorize('admin', 'contador'),
  empleadoController.getEstadisticasEmpleados
);

router.get('/:id', 
  auth, 
  authorize('admin', 'contador'),
  validateId,
  empleadoController.getEmpleadoById
);

// Rutas de escritura
router.post('/', 
  auth, 
  authorize('admin'),
  createLimiter,
  validateEmpleado,
  empleadoController.createEmpleado
);

router.put('/:id', 
  auth, 
  authorize('admin'),
  validateId,
  validateEmpleado,
  empleadoController.updateEmpleado
);

router.delete('/:id', 
  auth, 
  authorize('admin'),
  validateId,
  empleadoController.deleteEmpleado
);

module.exports = router;