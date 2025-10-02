const dashboardService = require('../services/dashboardService');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../middleware/logger');

const getGeneralStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getGeneralStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas generales obtenidas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getVisitantesChart = async (req, res, next) => {
  try {
    const dias = parseInt(req.query.dias) || 30;
    
    if (dias < 1 || dias > 365) {
      return next(new AppError('El parámetro dias debe estar entre 1 y 365', 400));
    }
    
    const chartData = await dashboardService.getVisitantesChart(dias);
    
    res.json({
      success: true,
      data: chartData,
      message: 'Datos de visitantes obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getAnimalesSaludChart = async (req, res, next) => {
  try {
    const chartData = await dashboardService.getAnimalesSaludChart();
    
    res.json({
      success: true,
      data: chartData,
      message: 'Datos de salud de animales obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getConsumoAlimentosChart = async (req, res, next) => {
  try {
    const semanas = parseInt(req.query.semanas) || 8;
    
    if (semanas < 1 || semanas > 52) {
      return next(new AppError('El parámetro semanas debe estar entre 1 y 52', 400));
    }
    
    const chartData = await dashboardService.getConsumoAlimentosChart(semanas);
    
    res.json({
      success: true,
      data: chartData,
      message: 'Datos de consumo de alimentos obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getEmpleadosPorDepartamento = async (req, res, next) => {
  try {
    const data = await dashboardService.getEmpleadosPorDepartamento();
    
    res.json({
      success: true,
      data: data,
      message: 'Datos de empleados por departamento obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getAlertas = async (req, res, next) => {
  try {
    const alertas = await dashboardService.getAlertas();
    
    res.json({
      success: true,
      data: alertas,
      message: 'Alertas del sistema obtenidas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getRealTimeData = async (req, res, next) => {
  try {
    const data = await dashboardService.getRealTimeData();
    
    res.json({
      success: true,
      data: data,
      message: 'Datos en tiempo real obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getSystemMetrics = async (req, res, next) => {
  try {
    const metrics = await dashboardService.getSystemMetrics();
    
    res.json({
      success: true,
      data: metrics,
      message: 'Métricas del sistema obtenidas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getFullReport = async (req, res, next) => {
  try {
    const report = await dashboardService.generateFullReport();
    
    res.json({
      success: true,
      data: report,
      message: 'Reporte completo generado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Endpoint para obtener datos generales del dashboard
const getDashboardData = async (req, res, next) => {
  try {
    logger.info('Fetching dashboard data');
    
    // Obtener estadísticas generales
    const stats = await dashboardService.getGeneralStats();
    logger.info('Stats fetched successfully', { stats });
    
    // Mapear las estadísticas al formato que espera el frontend
    // CORREGIDO: usar los nombres correctos de la respuesta del servicio
    const frontendStats = {
      totalAnimales: stats.animales?.total || 0,
      totalEmpleados: stats.empleados?.total || 0,
      visitantesHoy: stats.visitantes?.hoy || 0,
      alertasMedicas: stats.animales?.enfermos || 0,
      totalAlimentos: stats.alimentos?.total || 0,
      tareasLimpiezaActivas: stats.limpiezas?.activas || 0
    };
    
    // Obtener datos de gráficas
    logger.info('Fetching chart data');
    const visitantesChart = await dashboardService.getVisitantesChart(7); // Últimos 7 días
    const alimentosChart = await dashboardService.getConsumoAlimentosChart(4); // Últimas 4 semanas
    logger.info('Chart data fetched', { visitantesCount: visitantesChart.length });
    
    // Formatear datos para el frontend
    const formattedVisitantesData = {
      labels: visitantesChart.map(item => {
        const date = new Date(item.dia);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [{
        label: 'Visitantes',
        data: visitantesChart.map(item => item.visitantes),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }]
    };
    
    const formattedAlimentosData = {
      labels: ['Proteínas', 'Vegetales', 'Frutas', 'Otros'], // Ejemplo, esto debería venir de la base de datos
      datasets: [{
        label: 'Alimentos',
        data: [30, 25, 20, 25], // Datos de ejemplo
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }]
    };
    
    logger.info('Sending dashboard response', { frontendStats });
    res.json({
      success: true,
      data: {
        stats: frontendStats,
        visitantesChart: formattedVisitantesData,
        alimentosChart: formattedAlimentosData
      },
      message: 'Datos del dashboard obtenidos exitosamente'
    });
  } catch (error) {
    logger.error('Error in getDashboardData', { error: error.message, stack: error.stack });
    // Enviar respuesta con valores por defecto en caso de error
    res.status(500).json({
      success: false,
      message: 'Error al obtener datos del dashboard',
      error: error.message,
      data: {
        stats: {
          totalAnimales: 0,
          totalEmpleados: 0,
          visitantesHoy: 0,
          alertasMedicas: 0,
          totalAlimentos: 0
        },
        visitantesChart: null,
        alimentosChart: null
      }
    });
  }
};

// Endpoint para servir el dashboard HTML
const getDashboardPage = (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🦁 Jungle Planet Zoo - Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 1rem 2rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            color: #2c5234;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card h3 {
            color: #2c5234;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: #4a90e2;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        
        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .chart-container h3 {
            color: #2c5234;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .alerts-section {
            background: rgba(255, 255, 255, 0.95);
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        
        .alert-item {
            padding: 0.5rem 0;
            border-bottom: 1px solid #eee;
        }
        
        .alert-item:last-child {
            border-bottom: none;
        }
        
        .status-indicator {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 10px;
        }
        
        .status-online {
            background-color: #28a745;
        }
        
        .status-warning {
            background-color: #ffc107;
        }
        
        .status-error {
            background-color: #dc3545;
        }
        
        .real-time-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🦁 Jungle Planet Zoo - Dashboard en Tiempo Real</h1>
    </div>
    
    <div class="real-time-indicator">
        <span class="status-indicator status-online"></span>
        Conectado - Actualizaciones en vivo
    </div>
    
    <div class="container">
        <!-- Estadísticas Generales -->
        <div class="stats-grid" id="statsGrid">
            <div class="loading">Cargando estadísticas...</div>
        </div>
        
        <!-- Gráficas -->
        <div class="charts-grid">
            <div class="chart-container">
                <h3>📊 Visitantes por Mes</h3>
                <canvas id="visitantesChart"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>🏥 Estado de Salud de Animales</h3>
                <canvas id="saludChart"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>🥘 Consumo de Alimentos</h3>
                <canvas id="alimentosChart"></canvas>
            </div>
            
            <div class="chart-container">
                <h3>👥 Empleados por Departamento</h3>
                <canvas id="empleadosChart"></canvas>
            </div>
        </div>
        
        <!-- Alertas -->
        <div class="alerts-section">
            <h3>🚨 Alertas del Sistema</h3>
            <div id="alertsContainer">
                <div class="loading">Cargando alertas...</div>
            </div>
        </div>
    </div>

    <script>
        // Configuración global de Chart.js
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Variables globales
        let socket;
        let charts = {};
        
        // Conectar a WebSocket
        function connectWebSocket() {
            socket = io();
            
            socket.on('connect', () => {
                console.log('Conectado a WebSocket');
                document.querySelector('.real-time-indicator .status-indicator').className = 'status-indicator status-online';
            });
            
            socket.on('disconnect', () => {
                console.log('Desconectado de WebSocket');
                document.querySelector('.real-time-indicator .status-indicator').className = 'status-indicator status-error';
            });
            
            socket.on('dashboard-update', (data) => {
                updateDashboard(data);
            });
        }
        
        // Cargar datos iniciales
        async function loadInitialData() {
            try {
                const response = await fetch('/api/dashboard/full-report');
                const result = await response.json();
                
                if (result.success) {
                    updateDashboard(result.data);
                    initializeCharts(result.data.charts);
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        }
        
        // Actualizar dashboard
        function updateDashboard(data) {
            updateStats(data.general_stats || data.stats);
            updateAlerts(data.alertas);
            
            if (data.charts) {
                updateCharts(data.charts);
            }
        }
        
        // Actualizar estadísticas
        function updateStats(stats) {
            const statsGrid = document.getElementById('statsGrid');
            statsGrid.innerHTML = \`
                <div class="stat-card">
                    <h3>🦁 Animales Totales</h3>
                    <div class="stat-value">\${stats.animales.total}</div>
                    <small>\${stats.animales.enfermos} enfermos, \${stats.animales.sanos} sanos</small>
                </div>
                <div class="stat-card">
                    <h3>👥 Empleados</h3>
                    <div class="stat-value">\${stats.empleados.total}</div>
                    <small>\${stats.empleados.activos} activos</small>
                </div>
                <div class="stat-card">
                    <h3>🎫 Visitantes Hoy</h3>
                    <div class="stat-value">\${stats.visitantes.hoy}</div>
                    <small>$\${stats.visitantes.ingresos_hoy.toFixed(2)} ingresos</small>
                </div>
                <div class="stat-card">
                    <h3>🥘 Alimentos</h3>
                    <div class="stat-value">\${stats.alimentos.total}</div>
                    <small>\${stats.alimentos.bajo_stock} bajo stock</small>
                </div>
                <div class="stat-card">
                    <h3>🏥 Tratamientos</h3>
                    <div class="stat-value">\${stats.tratamientos.total}</div>
                    <small>\${stats.tratamientos.activos} activos</small>
                </div>
            \`;
        }
        
        // Inicializar gráficas
        function initializeCharts(chartsData) {
            // Gráfica de visitantes
            const visitantesCtx = document.getElementById('visitantesChart').getContext('2d');
            charts.visitantes = new Chart(visitantesCtx, {
                type: 'line',
                data: {
                    labels: chartsData.visitantes.map(d => d.mes),
                    datasets: [{
                        label: 'Visitantes',
                        data: chartsData.visitantes.map(d => d.visitantes),
                        borderColor: '#4a90e2',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Gráfica de salud de animales
            const saludCtx = document.getElementById('saludChart').getContext('2d');
            charts.salud = new Chart(saludCtx, {
                type: 'doughnut',
                data: {
                    labels: chartsData.animales_salud.map(d => d.estado),
                    datasets: [{
                        data: chartsData.animales_salud.map(d => d.cantidad),
                        backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            
            // Gráfica de empleados
            const empleadosCtx = document.getElementById('empleadosChart').getContext('2d');
            charts.empleados = new Chart(empleadosCtx, {
                type: 'bar',
                data: {
                    labels: chartsData.empleados_departamento.map(d => d.departamento),
                    datasets: [{
                        label: 'Total',
                        data: chartsData.empleados_departamento.map(d => d.total),
                        backgroundColor: '#4a90e2'
                    }, {
                        label: 'Activos',
                        data: chartsData.empleados_departamento.map(d => d.activos),
                        backgroundColor: '#28a745'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Actualizar gráficas
        function updateCharts(chartsData) {
            if (charts.visitantes && chartsData.visitantes) {
                charts.visitantes.data.labels = chartsData.visitantes.map(d => d.mes);
                charts.visitantes.data.datasets[0].data = chartsData.visitantes.map(d => d.visitantes);
                charts.visitantes.update();
            }
            
            if (charts.salud && chartsData.animales_salud) {
                charts.salud.data.labels = chartsData.animales_salud.map(d => d.estado);
                charts.salud.data.datasets[0].data = chartsData.animales_salud.map(d => d.cantidad);
                charts.salud.update();
            }
        }
        
        // Actualizar alertas
        function updateAlerts(alertas) {
            const alertsContainer = document.getElementById('alertsContainer');
            let html = '';
            
            if (alertas.alimentos_bajo_stock && alertas.alimentos_bajo_stock.length > 0) {
                html += '<h4>⚠️ Alimentos con Stock Bajo:</h4>';
                alertas.alimentos_bajo_stock.forEach(item => {
                    html += \`<div class="alert-item">
                        <span class="status-indicator status-warning"></span>
                        \${item.nombre}: \${item.stock_actual}/\${item.stock_minimo}
                    </div>\`;
                });
            }
            
            if (alertas.animales_enfermos && alertas.animales_enfermos.length > 0) {
                html += '<h4>🏥 Animales que requieren atención:</h4>';
                alertas.animales_enfermos.forEach(item => {
                    html += \`<div class="alert-item">
                        <span class="status-indicator status-error"></span>
                        \${item.nombre} (\${item.especie}): \${item.estado_salud}
                    </div>\`;
                });
            }
            
            if (html === '') {
                html = '<div class="alert-item"><span class="status-indicator status-online"></span>Todo en orden</div>';
            }
            
            alertsContainer.innerHTML = html;
        }
        
        // Inicializar aplicación
        document.addEventListener('DOMContentLoaded', () => {
            loadInitialData();
            connectWebSocket();
        });
    </script>
</body>
</html>
  `);
};

module.exports = {
  getGeneralStats,
  getVisitantesChart,
  getAnimalesSaludChart,
  getConsumoAlimentosChart,
  getEmpleadosPorDepartamento,
  getAlertas,
  getRealTimeData,
  getSystemMetrics,
  getFullReport,
  getDashboardData,
  getDashboardPage
};