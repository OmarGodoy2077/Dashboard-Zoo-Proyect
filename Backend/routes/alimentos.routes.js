const express = require('express');
const router = express.Router();

const alimentoController = require('../controllers/alimento.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateAlimento, validateId, validatePagination } = require('../middleware/validation');
const { createLimiter } = require('../middleware/rateLimiter');

// Rutas públicas (solo lectura para algunos roles)
router.get('/', 
  auth, 
  validatePagination,
  alimentoController.getAllAlimentos
);

router.get('/bajo-stock', 
  auth, 
  authorize('admin', 'contador', 'veterinario'),
  alimentoController.getAlimentosBajoStock
);

router.get('/estadisticas', 
  auth, 
  authorize('admin', 'contador'),
  alimentoController.getEstadisticasAlimentos
);

router.get('/:id', 
  auth, 
  validateId,
  alimentoController.getAlimentoById
);

// Rutas protegidas - solo admin y contador pueden modificar
router.post('/', 
  auth, 
  authorize('admin', 'contador'),
  createLimiter,
  validateAlimento,
  alimentoController.createAlimento
);

router.put('/:id', 
  auth, 
  authorize('admin', 'contador'),
  validateId,
  validateAlimento,
  alimentoController.updateAlimento
);

router.patch('/:id/stock', 
  auth, 
  authorize('admin', 'contador', 'empleado'),
  validateId,
  alimentoController.updateStock
);

router.delete('/:id', 
  auth, 
  authorize('admin'),
  validateId,
  alimentoController.deleteAlimento
);

module.exports = router;