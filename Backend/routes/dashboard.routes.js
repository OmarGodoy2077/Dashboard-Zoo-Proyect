const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { auth, authorize } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Obtener página del dashboard
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Página HTML del dashboard
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
router.get('/', dashboardController.getDashboardPage);

/**
 * @swagger
 * /api/dashboard/data:
 *   get:
 *     summary: Obtener datos generales del dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos generales del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalAnimales:
 *                           type: integer
 *                         totalEmpleados:
 *                           type: integer
 *                         visitantesHoy:
 *                           type: integer
 *                         alertasMedicas:
 *                           type: integer
 *                     visitantesChart:
 *                       type: object
 *                     alimentosChart:
 *                       type: object
 */
router.get('/data',
  auth,
  dashboardController.getDashboardData
);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales del zoológico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     animales:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         enfermos:
 *                           type: integer
 *                         sanos:
 *                           type: integer
 *                     empleados:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         activos:
 *                           type: integer
 */
router.get('/stats', 
  auth, 
  dashboardController.getGeneralStats
);

/**
 * @swagger
 * /api/dashboard/charts/visitantes:
 *   get:
 *     summary: Obtener datos para gráfica de visitantes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: meses
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 12
 *         description: Número de meses hacia atrás
 *     responses:
 *       200:
 *         description: Datos de visitantes por mes
 */
router.get('/charts/visitantes', 
  auth, 
  authorize('admin', 'contador'),
  dashboardController.getVisitantesChart
);

/**
 * @swagger
 * /api/dashboard/charts/animales-salud:
 *   get:
 *     summary: Obtener datos para gráfica de salud de animales
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distribución del estado de salud de animales
 */
router.get('/charts/animales-salud', 
  auth, 
  authorize('admin', 'veterinario'),
  dashboardController.getAnimalesSaludChart
);

/**
 * @swagger
 * /api/dashboard/charts/consumo-alimentos:
 *   get:
 *     summary: Obtener datos para gráfica de consumo de alimentos
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: semanas
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 52
 *           default: 8
 *         description: Número de semanas hacia atrás
 *     responses:
 *       200:
 *         description: Datos de consumo de alimentos por semana
 */
router.get('/charts/consumo-alimentos', 
  auth, 
  authorize('admin', 'contador', 'empleado'),
  dashboardController.getConsumoAlimentosChart
);

/**
 * @swagger
 * /api/dashboard/charts/empleados-departamento:
 *   get:
 *     summary: Obtener datos de empleados por departamento
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distribución de empleados por departamento
 */
router.get('/charts/empleados-departamento', 
  auth, 
  authorize('admin', 'contador'),
  dashboardController.getEmpleadosPorDepartamento
);

/**
 * @swagger
 * /api/dashboard/alertas:
 *   get:
 *     summary: Obtener alertas del sistema
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alertas activas del sistema
 */
router.get('/alertas', 
  auth, 
  dashboardController.getAlertas
);

/**
 * @swagger
 * /api/dashboard/real-time:
 *   get:
 *     summary: Obtener datos en tiempo real
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos actualizados del sistema
 */
router.get('/real-time', 
  auth, 
  dashboardController.getRealTimeData
);

/**
 * @swagger
 * /api/dashboard/system-metrics:
 *   get:
 *     summary: Obtener métricas del sistema
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de rendimiento del servidor
 */
router.get('/system-metrics', 
  auth, 
  authorize('admin'),
  dashboardController.getSystemMetrics
);

/**
 * @swagger
 * /api/dashboard/full-report:
 *   get:
 *     summary: Obtener reporte completo del dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte completo con todas las estadísticas y gráficas
 */
router.get('/full-report', 
  auth, 
  dashboardController.getFullReport
);

module.exports = router;