const socketIo = require('socket.io');
const { logger } = require('../middleware/logger');
const dashboardService = require('../services/dashboardService');
const { checkTareasVencidas } = require('./limpiezaService');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedClients = new Map();
    this.updateInterval = null;
    this.limpiezaCheckInterval = null;
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    this.startRealTimeUpdates();
    this.startLimpiezaChecks(); // Iniciar verificación de tareas de limpieza vencidas
    
    logger.info('WebSocket service initialized');
    return this.io;
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Client connected to WebSocket', {
        socketId: socket.id,
        userAgent: socket.handshake.headers['user-agent'],
        ip: socket.handshake.address
      });

      // Guardar información del cliente
      this.connectedClients.set(socket.id, {
        connectedAt: new Date(),
        lastActivity: new Date(),
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      });

      // Enviar datos iniciales al cliente
      this.sendInitialData(socket);

      // Manejar solicitud de datos específicos
      socket.on('request-dashboard-data', async () => {
        try {
          const data = await dashboardService.getRealTimeData();
          socket.emit('dashboard-update', data);
        } catch (error) {
          logger.error('Error sending dashboard data to client', {
            socketId: socket.id,
            error: error.message
          });
          socket.emit('error', { message: 'Error obteniendo datos del dashboard' });
        }
      });

      // Manejar solicitud de gráficas específicas
      socket.on('request-chart-data', async (chartType) => {
        try {
          let chartData;
          
          switch (chartType) {
            case 'visitantes':
              chartData = await dashboardService.getVisitantesChart();
              break;
            case 'animales-salud':
              chartData = await dashboardService.getAnimalesSaludChart();
              break;
            case 'consumo-alimentos':
              chartData = await dashboardService.getConsumoAlimentosChart();
              break;
            case 'empleados-departamento':
              chartData = await dashboardService.getEmpleadosPorDepartamento();
              break;
            default:
              throw new Error('Tipo de gráfica no válido');
          }
          
          socket.emit('chart-update', { type: chartType, data: chartData });
        } catch (error) {
          logger.error('Error sending chart data to client', {
            socketId: socket.id,
            chartType,
            error: error.message
          });
          socket.emit('error', { message: 'Error obteniendo datos de gráfica' });
        }
      });

      // Manejar ping de cliente para mantener conexión
      socket.on('ping', () => {
        this.connectedClients.get(socket.id).lastActivity = new Date();
        socket.emit('pong');
      });

      // Manejar desconexión
      socket.on('disconnect', (reason) => {
        logger.info('Client disconnected from WebSocket', {
          socketId: socket.id,
          reason,
          duration: Date.now() - this.connectedClients.get(socket.id)?.connectedAt
        });
        
        this.connectedClients.delete(socket.id);
      });

      // Manejar errores de socket
      socket.on('error', (error) => {
        logger.error('WebSocket error', {
          socketId: socket.id,
          error: error.message
        });
      });
    });
  }

  async sendInitialData(socket) {
    try {
      const data = await dashboardService.generateFullReport();
      socket.emit('dashboard-update', data);
    } catch (error) {
      logger.error('Error sending initial data to client', {
        socketId: socket.id,
        error: error.message
      });
    }
  }

  startRealTimeUpdates() {
    // Actualizar datos cada 30 segundos
    this.updateInterval = setInterval(async () => {
      try {
        if (this.connectedClients.size === 0) {
          return; // No hay clientes conectados
        }

        const data = await dashboardService.getRealTimeData();
        
        // Asegurarse de que los datos tienen la estructura correcta
        if (data && data.stats) {
          // Enviar actualización a todos los clientes conectados
          this.io.emit('dashboard-update', data);
          
          logger.debug('Real-time data sent to clients', {
            connectedClients: this.connectedClients.size,
            stats: data.stats
          });
        } else {
          logger.warn('Invalid data structure from getRealTimeData', { data });
        }
      } catch (error) {
        logger.error('Error in real-time update', { error: error.message });
      }
    }, 30000); // 30 segundos

    // Actualizar gráficas cada 5 minutos
    setInterval(async () => {
      try {
        if (this.connectedClients.size === 0) {
          return;
        }

        const [visitantes, animalesSalud, empleados] = await Promise.all([
          dashboardService.getVisitantesChart(),
          dashboardService.getAnimalesSaludChart(),
          dashboardService.getEmpleadosPorDepartamento()
        ]);

        this.io.emit('charts-update', {
          visitantes,
          animales_salud: animalesSalud,
          empleados_departamento: empleados
        });

        logger.debug('Charts data updated for all clients');
      } catch (error) {
        logger.error('Error updating charts data', { error: error.message });
      }
    }, 30000); // 5 minutos
  }

  // Iniciar verificación periódica de tareas de limpieza vencidas
  startLimpiezaChecks() {
    // Verificar tareas vencidas cada hora
    this.limpiezaCheckInterval = setInterval(async () => {
      try {
        const tareasVencidas = await checkTareasVencidas();
        
        if (tareasVencidas.length > 0) {
          logger.warn('Tareas de limpieza vencidas detectadas', { count: tareasVencidas.length, tareas: tareasVencidas });
          
          // Emitir alerta a través de WebSocket
          this.broadcastAlert({
            type: 'warning',
            title: 'Tareas de Limpieza Vencidas',
            message: `Hay ${tareasVencidas.length} tareas de limpieza pendientes de atención`,
            tareas: tareasVencidas.map(t => ({
              id: t.id,
              area: t.area,
              proxima_fecha: t.proxima_fecha,
              encargado_id: t.encargado_id
            })),
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logger.error('Error en la verificación de tareas vencidas', { error: error.message });
      }
    }, 60 * 60 * 1000); // Cada hora
  }

  // Enviar actualización específica a todos los clientes
  async broadcastUpdate(eventName, data) {
    if (this.io && this.connectedClients.size > 0) {
      this.io.emit(eventName, data);
      logger.debug('Broadcast update sent', {
        eventName,
        connectedClients: this.connectedClients.size
      });
    }
  }

  // Enviar notificación de alerta
  async broadcastAlert(alert) {
    if (this.io && this.connectedClients.size > 0) {
      this.io.emit('system-alert', {
        timestamp: new Date().toISOString(),
        ...alert
      });
      logger.info('Alert broadcasted to clients', { alert });
    }
  }

  // Obtener estadísticas de WebSocket
  getStats() {
    const now = new Date();
    const clientStats = Array.from(this.connectedClients.values()).map(client => ({
      connectedDuration: now - client.connectedAt,
      lastActivity: now - client.lastActivity,
      ip: client.ip
    }));

    return {
      connectedClients: this.connectedClients.size,
      totalConnections: clientStats.length,
      averageConnectionTime: clientStats.reduce((acc, client) => acc + client.connectedDuration, 0) / clientStats.length || 0,
      clients: clientStats
    };
  }

  // Limpiar recursos al cerrar
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.limpiezaCheckInterval) {
      clearInterval(this.limpiezaCheckInterval);
      this.limpiezaCheckInterval = null;
    }

    if (this.io) {
      this.io.close();
      this.io = null;
    }

    this.connectedClients.clear();
    logger.info('WebSocket service cleaned up');
  }
}

module.exports = new WebSocketService();