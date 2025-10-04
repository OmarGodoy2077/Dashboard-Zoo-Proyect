const express = require('express');
const router = express.Router();
const dietaController = require('../controllers/dieta.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

// Rutas para horarios de alimentación (dietas)
router.get('/', auth, dietaController.getAllHorarios);
router.get('/estadisticas', auth, authorize('admin', 'veterinario'), dietaController.getEstadisticasDietas);
router.get('/animal/:animalId', auth, dietaController.getHorariosByAnimal);
router.get('/:id', auth, validateId, dietaController.getHorarioById);

router.post('/', auth, authorize('admin', 'veterinario'), dietaController.createHorario);
router.put('/:id', auth, authorize('admin', 'veterinario'), validateId, dietaController.updateHorario);
router.delete('/:id', auth, authorize('admin', 'veterinario'), validateId, dietaController.deleteHorario);

module.exports = router;