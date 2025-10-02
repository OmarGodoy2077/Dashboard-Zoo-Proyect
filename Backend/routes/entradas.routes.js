const express = require('express');
const router = express.Router();
const entradaController = require('../controllers/entrada.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateEntrada } = require('../middleware/validation');
const { logger } = require('../middleware/logger');

// Rutas para entradas
router.get('/estadisticas', auth, authorize('admin', 'contador', 'empleado'), entradaController.getEstadisticas);
router.get('/', auth, authorize('admin', 'contador', 'empleado'), entradaController.getAllEntradas);
router.post('/', auth, authorize('admin'), validateEntrada, entradaController.createEntrada);
router.get('/:id', auth, authorize('admin', 'contador', 'empleado'), entradaController.getEntradaById);
router.put('/:id', auth, authorize('admin'), validateEntrada, entradaController.updateEntrada);
router.delete('/:id', auth, authorize('admin'), entradaController.deleteEntrada);

module.exports = router;