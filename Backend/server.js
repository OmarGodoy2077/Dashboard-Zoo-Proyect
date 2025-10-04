const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Cargar variables de entorno
dotenv.config();

// Importar middlewares
const { requestLogger, logger } = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { validateContentType, bodyParserErrorHandler, logRequestBody } = require('./middleware/bodyParser');

// Importar servicios
const { testConnection } = require('./config/database');
const websocketService = require('./services/websocketService');
const rrhhService = require('./services/rrhhService');
const dietaScheduler = require('./services/dietaScheduler.service');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const animalRoutes = require('./routes/animales.routes');
const alimentoRoutes = require('./routes/alimentos.routes');
const dietaRoutes = require('./routes/dieta.routes');
const empleadoRoutes = require('./routes/empleados.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Importar rutas
const limpiezaRoutes = require('./routes/limpieza.routes');
const clinicoRoutes = require('./routes/clinico.routes');
const nominaRoutes = require('./routes/nominas.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const entradaRoutes = require('./routes/entradas.routes');
const promocionRoutes = require('./routes/promociones.routes');
const rrhhRoutes = require('./routes/rrhh.routes');

const app = express();
const server = http.createServer(app);

// Inicializar WebSocket
const io = websocketService.initialize(server);

// Configurar confianza en proxy (importante para rate limiting)
app.set('trust proxy', 1);

// Middleware de seguridad y optimización
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.socket.io"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// Compresión de respuestas
app.use(compression());

// Rate limiting general
app.use(generalLimiter);

// Configuración CORS más detallada
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:8080','https://dashboard-zoo-proyect-production.up.railway.app','http://dashboard-zoo-proyect-copy-production.up.railway.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control'],
  credentials: true,
  maxAge: 86400 // Cache preflight por 24 horas
};
app.use(cors(corsOptions));

// Middleware para logging personalizado
app.use(requestLogger);

// Middleware para validar Content-Type antes de parsear el body
app.use(validateContentType);

// Middleware para parsear JSON con límite de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para capturar errores de parsing de body
app.use(bodyParserErrorHandler);

// Middleware para registrar el body en desarrollo (después de parsear)
app.use(logRequestBody);

// Middleware para agregar información de WebSocket a las requests
app.use((req, res, next) => {
  req.io = io;
  req.websocketStats = websocketService.getStats();
  next();
});

// Health check endpoint mejorado
app.get('/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const wsStats = websocketService.getStats();
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100
    },
    websocket: {
      connectedClients: wsStats.connectedClients,
      totalConnections: wsStats.totalConnections
    }
  });
});

// Status monitor endpoint
app.get('/status', require('express-status-monitor')());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/alimentos', alimentoRoutes);
app.use('/api/dietas', dietaRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rutas adicionales para módulos
app.use('/api/limpieza', limpiezaRoutes);
app.use('/api/clinico', clinicoRoutes);
app.use('/api/nominas', nominaRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/entradas', entradaRoutes);
app.use('/api/promociones', promocionRoutes);
app.use('/api/rrhh', rrhhRoutes);

// Ruta para acceso directo al dashboard
app.get('/dashboard', (req, res) => {
  res.redirect('/api/dashboard');
});

// Swagger Documentation (se agregará cuando esté configurado)
// const swaggerSetup = require('./config/swagger');
// app.use('/api-docs', swaggerSetup.swaggerUi.serve, swaggerSetup.swaggerUi.setup(swaggerSetup.specs));

// Ruta raíz con información de la API
app.get('/', (req, res) => {
  res.json({ 
    message: '🦁 API del Sistema de Gestión del Zoológico Jungle Planet',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: [
      '🔐 Autenticación JWT con roles',
      '📊 Dashboard en tiempo real con WebSocket',
      '🦁 Gestión completa de animales',
      '🥘 Control de alimentos y stock',
      '👥 Gestión de empleados',
      '📈 Reportes y estadísticas',
      '🛡️ Seguridad avanzada con rate limiting',
      '📝 Logging completo y monitoreo'
    ],
    endpoints: {
      health: '/health',
      status: '/status',
      dashboard: '/dashboard',
      auth: '/api/auth',
      animales: '/api/animales',
      alimentos: '/api/alimentos',
      empleados: '/api/empleados',
      dashboard_api: '/api/dashboard',
      limpieza: '/api/limpieza',
      clinico: '/api/clinico',
      nominas: '/api/nominas',
      inventario: '/api/inventario',
      entradas: '/api/entradas',
      promociones: '/api/promociones'
    },
    websocket: {
      enabled: true,
      connectedClients: req.websocketStats.connectedClients,
      events: [
        'dashboard-update',
        'charts-update',
        'system-alert'
      ]
    },
    documentation: {
      swagger: '/api-docs',
      readme: 'https://github.com/tu-repo/jungle-planet-zoo/blob/main/README.md'
    }
  });
});

// Middleware para rutas no encontradas
app.use('*', notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Función para iniciar el servidor con manejo de errores
const startServer = () => {
  server.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en el puerto ${PORT}`);
    logger.info(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 URL: http://localhost:${PORT}`);
    logger.info(`💚 Health check: http://localhost:${PORT}/health`);
    logger.info(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    logger.info(`📈 Status Monitor: http://localhost:${PORT}/status`);
    logger.info(`🔌 WebSocket habilitado para tiempo real`);
  });

  // Programar actualización diaria de estado de empleados por vacaciones a las 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    try {
      logger.info('⏰ Iniciando actualización automática diaria de estado de empleados por vacaciones');
      const resultado = await rrhhService.actualizarEstadoEmpleadosVacaciones();
      logger.info('✅ Actualización automática completada', resultado);
    } catch (error) {
      logger.error('❌ Error en actualización automática de estado de empleados por vacaciones', error);
    }
  });

  // Programar procesamiento automático de alimentaciones cada 5 minutos
  cron.schedule('*/5 * * * *', async () => {
    try {
      logger.info('⏰ Iniciando procesamiento automático de alimentaciones programadas');
      const resultados = await dietaScheduler.procesarAlimentacionesPendientes();
      const exitosas = resultados.filter(r => r.success).length;
      const fallidas = resultados.filter(r => !r.success).length;
      logger.info(`✅ Procesamiento automático completado: ${exitosas} exitosas, ${fallidas} fallidas`);
    } catch (error) {
      logger.error('❌ Error en procesamiento automático de alimentaciones', error);
    }
  });

  // Manejo graceful de cierre del servidor
  const gracefulShutdown = (signal) => {
    logger.info(`${signal} recibido. Cerrando servidor gracefully...`);
    
    // Cerrar WebSocket service
    websocketService.cleanup();
    
    server.close(() => {
      logger.info('Servidor cerrado exitosamente');
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      logger.error('Forzando cierre del servidor...');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

// Verificar conexión a base de datos antes de iniciar
if (process.env.NODE_ENV !== 'test') {
  testConnection()
    .then(() => {
      logger.info('✅ Conexión a base de datos exitosa');
      startServer();
    })
    .catch((error) => {
      logger.error('❌ Error conectando a la base de datos:', error);
      process.exit(1);
    });
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;