const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/nomina.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateNomina } = require('../middleware/validation');
const { logger } = require('../middleware/logger');

// Rutas para nóminas
router.get('/', auth, nominaController.getAllNominas);
router.post('/', auth, validateNomina, nominaController.createNomina);
router.get('/:id', auth, nominaController.getNominaById);
router.put('/:id', auth, validateNomina, nominaController.updateNomina);
router.delete('/:id', auth, authorize('admin'), nominaController.deleteNomina);

module.exports = router;