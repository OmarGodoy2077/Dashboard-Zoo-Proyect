const express = require('express');
const router = express.Router();
const promocionController = require('../controllers/promocion.controller');
const { auth, authorize } = require('../middleware/auth');
const { validatePromocion } = require('../middleware/validation');
const { logger } = require('../middleware/logger');

// Rutas para promociones
router.get('/', auth, promocionController.getAllPromociones);
router.post('/', auth, validatePromocion, promocionController.createPromocion);
router.get('/:id', auth, promocionController.getPromocionById);
router.put('/:id', auth, validatePromocion, promocionController.updatePromocion);
router.delete('/:id', auth, authorize('admin'), promocionController.deletePromocion);

module.exports = router;