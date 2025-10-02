const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const animalController = require('../controllers/animal.controller');
const { auth, authorize } = require('../middleware/auth');

// Rutas públicas (si aplica)
// router.get('/', animalController.getAllAnimales);

// Rutas protegidas
router.get('/', auth, animalController.getAllAnimales);
router.get('/:id', auth, animalController.getAnimalById);
router.post('/', auth, authorize('admin', 'veterinario'), animalController.createAnimal);
router.put('/:id', auth, authorize('admin', 'veterinario'), animalController.updateAnimal);
router.delete('/:id', auth, authorize('admin', 'veterinario'), animalController.deleteAnimal);

// Rutas específicas para reportes
router.get('/reporte/animales-enfermos', auth, animalController.getAnimalesEnfermosRecientes);
router.get('/reporte/por-especie', auth, animalController.getAnimalesPorEspecie);

module.exports = router;