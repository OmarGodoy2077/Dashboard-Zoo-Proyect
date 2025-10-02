const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateInventario } = require('../middleware/validation');
const { logger } = require('../middleware/logger');

// Rutas para inventario
router.get('/', auth, inventarioController.getAllItems);
router.post('/', auth, validateInventario, inventarioController.createItem);
router.get('/:id', auth, inventarioController.getItemById);
router.put('/:id', auth, validateInventario, inventarioController.updateItem);
router.delete('/:id', auth, authorize('admin'), inventarioController.deleteItem);

module.exports = router;