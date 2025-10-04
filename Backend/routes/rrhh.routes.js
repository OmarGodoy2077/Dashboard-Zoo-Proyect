const express = require('express');
const router = express.Router();
const rrhhController = require('../controllers/rrhh.controller');
const { auth, authorize } = require('../middleware/auth');
const { validateVacaciones, validateInasistencias, validateDescuentos, validateBonos } = require('../middleware/validation');

// Rutas para vacaciones
router.get('/vacaciones', auth, rrhhController.getAllVacaciones);
router.post('/vacaciones', auth, authorize('admin'), validateVacaciones, rrhhController.createVacacion);
router.get('/vacaciones/:id', auth, rrhhController.getVacacionById);
router.put('/vacaciones/:id', auth, authorize('admin'), validateVacaciones, rrhhController.updateVacacion);
router.delete('/vacaciones/:id', auth, authorize('admin'), rrhhController.deleteVacacion);

// Rutas para inasistencias
router.get('/inasistencias', auth, rrhhController.getAllInasistencias);
router.post('/inasistencias', auth, authorize('admin'), validateInasistencias, rrhhController.createInasistencia);
router.get('/inasistencias/:id', auth, rrhhController.getInasistenciaById);
router.put('/inasistencias/:id', auth, authorize('admin'), validateInasistencias, rrhhController.updateInasistencia);
router.delete('/inasistencias/:id', auth, authorize('admin'), rrhhController.deleteInasistencia);

// Rutas para descuentos
router.get('/descuentos', auth, rrhhController.getAllDescuentos);
router.post('/descuentos', auth, authorize('admin'), validateDescuentos, rrhhController.createDescuento);
router.get('/descuentos/:id', auth, rrhhController.getDescuentoById);
router.put('/descuentos/:id', auth, authorize('admin'), validateDescuentos, rrhhController.updateDescuento);
router.delete('/descuentos/:id', auth, authorize('admin'), rrhhController.deleteDescuento);

// Rutas para bonos
router.get('/bonos', auth, rrhhController.getAllBonos);
router.post('/bonos', auth, authorize('admin'), validateBonos, rrhhController.createBono);
router.get('/bonos/:id', auth, rrhhController.getBonoById);
router.put('/bonos/:id', auth, authorize('admin'), validateBonos, rrhhController.updateBono);
router.delete('/bonos/:id', auth, authorize('admin'), rrhhController.deleteBono);

// Ruta para planilla mensual
router.get('/planilla/:mes/:anio', auth, rrhhController.getPlanillaMensual);

// Ruta para exportar planilla mensual a Excel
router.get('/planilla/:mes/:anio/excel', auth, rrhhController.exportPlanillaExcel);

// Ruta para actualizar estado de empleados por vacaciones
router.post('/actualizar-estado-vacaciones', auth, authorize('admin'), rrhhController.actualizarEstadoEmpleadosVacaciones);

module.exports = router;