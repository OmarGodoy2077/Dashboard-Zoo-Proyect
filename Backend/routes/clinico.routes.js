const express = require('express');
const router = express.Router();
const clinicoController = require('../controllers/clinico.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateClinico } = require('../middleware/validation');
const { logger } = require('../middleware/logger');

// Rutas para tratamientos (principal)
router.get('/tratamientos/estadisticas', auth, clinicoController.getEstadisticasTratamientos);
router.get('/tratamientos', auth, clinicoController.getAllTratamientos);
router.post('/tratamientos', auth, clinicoController.createTratamiento);
router.get('/tratamientos/:id', auth, clinicoController.getTratamientoById);
router.put('/tratamientos/:id', auth, clinicoController.updateTratamiento);
router.delete('/tratamientos/:id', auth, authorize('admin', 'veterinario'), clinicoController.deleteTratamiento);

// Rutas para registros clínicos (compatibilidad)
router.get('/', auth, clinicoController.getAllRegistros);
router.post('/', auth, clinicoController.createRegistro);
router.get('/:id', auth, clinicoController.getRegistroById);
router.put('/:id', auth, clinicoController.updateRegistro);
router.delete('/:id', auth, authorize('admin'), clinicoController.deleteRegistro);

module.exports = router;