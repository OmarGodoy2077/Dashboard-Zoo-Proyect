# 📋 Documentación Técnica Completa - Jungle Planet Zoo Management System

## 🚀 Actualizado con Dashboard en Tiempo Real y WebSocket

**Versión**: 1.0.0  
**Fecha**: Enero 2024  
**Estado**: Producción Ready con Dashboard Interactivo

---

## 📊 Nuevas Características Implementadas

### 🔥 Dashboard en Tiempo Real
- **URL de acceso**: `http://localhost:3000/dashboard`
- **WebSocket**: Actualizaciones automáticas cada 30 segundos
- **Gráficos interactivos**: Chart.js con datos en vivo
- **Responsive**: Compatible con móviles y tablets
- **Alertas**: Sistema de notificaciones en tiempo real

### 📈 Sistema de Reportes Excel
- **Exportación automática**: Múltiples formatos de reporte
- **Reportes disponibles**: Animales, empleados, financiero, consolidado
- **Programación**: Reportes automáticos diarios/semanales
- **Formato profesional**: Gráficos incluidos en Excel

### ⚡ WebSocket Service
- **Conexiones múltiples**: Soporte para múltiples clientes simultáneos
- **Eventos en tiempo real**: Dashboard updates, alerts, charts
- **Gestión de conexiones**: Reconexión automática y manejo de errores
- **Estadísticas**: Monitoreo de clientes conectados

### 🧹 Módulo de Limpieza
- **Gestión de tareas de limpieza** por áreas del zoológico
- **Asignación de encargados** y seguimiento de cumplimiento
- **Alertas de tareas vencidas** mediante WebSocket
- **Frecuencias personalizadas** (diaria, semanal, quincenal, mensual)

### 👥 Módulo de Recursos Humanos
- **Gestión de vacaciones** de empleados
- **Control de inasistencias** con tipos y justificaciones
- **Sistema de descuentos** por faltas, anticipos, etc.
- **Bonos y recompensas** por productividad, cumpleaños, etc.
- **Planilla mensual completa** con salarios, bonos y descuentos

---

## 🏗️ Arquitectura del Sistema Actualizada

### Estructura de Directorios Completa
```
Backend/
├── 📁 config/
│   └── 📄 database.js              # Configuración Supabase optimizada
├── 📁 controllers/
│   ├── 📄 animal.controller.js     # CRUD animales
│   ├── 📄 auth.controller.js       # Autenticación JWT
│   ├── 📄 dashboard.controller.js  # 🆕 Dashboard con HTML embebido
│   ├── 📄 empleado.controller.js   # 🆕 Gestión de empleados
│   ├── 📄 alimento.controller.js   # 🆕 Control de alimentos
│   ├── 📄 limpieza.controller.js   # 🆕 Gestión de tareas de limpieza
│   └── 📄 rrhh.controller.js       # 🆕 Gestión de recursos humanos
├── 📁 docs/
│   ├── 📄 README.md               # Documentación principal
│   ├── 📄 README_UPDATED.md       # 🆕 README actualizado
│   └── 📄 DOCUMENTACION_BACKEND.md # Este archivo
├── 📁 middleware/
│   ├── 📄 auth.js                 # Middleware JWT
│   ├── 📄 errorHandler.js         # Manejo de errores
│   ├── 📄 logger.js               # Sistema Winston
│   ├── 📄 rateLimiter.js          # 🆕 Rate limiting avanzado
│   └── 📄 validation.js            # 🆕 Validaciones de entrada
├── 📁 models/
│   └── 📄 index.js                # Índice de modelos
├── 📁 routes/
│   ├── 📄 animales.routes.js      # Rutas animales
│   ├── 📄 auth.routes.js          # Rutas autenticación
│   ├── 📄 dashboard.routes.js     # 🆕 Rutas dashboard
│   ├── 📄 empleados.routes.js     # 🆕 Rutas empleados
│   ├── 📄 alimentos.routes.js     # 🆕 Rutas alimentos
│   ├── 📄 limpieza.routes.js      # 🆕 Rutas limpieza
│   └── 📄 rrhh.routes.js          # 🆕 Rutas recursos humanos
├── 📁 services/
│   ├── 📄 animalService.js        # Lógica animales
│   ├── 📄 authService.js          # Lógica autenticación
│   ├── 📄 dashboardService.js     # 🆕 Servicio dashboard
│   ├── 📄 empleadoService.js      # 🆕 Servicio empleados
│   ├── 📄 alimentoService.js      # 🆕 Servicio alimentos
│   ├── 📄 limpiezaService.js      # 🆕 Servicio limpieza
│   ├── 📄 rrhhService.js          # 🆕 Servicio recursos humanos
│   ├── 📄 websocketService.js     # 🆕 Servicio WebSocket
│   └── 📄 reportService.js        # 🆕 Servicio reportes Excel
├── 📁 utils/
│   ├── 📄 hashPassword.js         # Utilidades bcrypt
│   ├── 📄 jwtUtils.js             # Utilidades JWT
│   └── 📄 validation.js            # Utilidades de validación
├── 📄 server.js                   # 🆕 Servidor con Socket.IO
├── 📄 package.json                # 🆕 Dependencias actualizadas
└── 📄 schema.sql                  # Esquema BD completo
```

---

## 🔧 Tecnologías y Dependencias Actualizadas

### Core Backend
```json
{
  "express": "^4.18.2",
  "socket.io": "^4.7.5",        // 🆕 WebSocket
  "chart.js": "^4.4.0",         // 🆕 Gráficos
  "xlsx": "^0.18.5",            // 🆕 Reportes Excel
  "winston": "^3.11.0",         // 🆕 Logging avanzado
  "node-cron": "^3.0.3",        // 🆕 Tareas programadas
  "express-slow-down": "^1.6.0",  // 🆕 Rate limiting avanzado
  "express-validator": "^7.0.1",  // 🆕 Validación de entrada
  "uuid": "^9.0.1"              // 🆕 Generación de UUIDs
}
```

### Autenticación y Seguridad
```json
{
  "jsonwebtoken": "^9.0.0",
  "bcrypt": "^5.1.0",
  "helmet": "^7.0.0",
  "express-rate-limit": "^7.1.5"
}
```

### Base de Datos y Utilities
```json
{
  "pg": "^8.1.0",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5",
  "compression": "^1.7.4"
}
```

---

## 📊 Dashboard Service - Documentación Técnica

### Archivo: `services/dashboardService.js`

#### Funciones Principales

**`getGeneralStats()`**
```javascript
// Retorna estadísticas generales del zoológico
{
  totalAnimales: Number,
  totalEmpleados: Number,
  visitantesHoy: Number,
  ingresosDiarios: Number,
  alimentosStockBajo: Number,
 alertasMedicas: Number
}
```

**`getVisitantesChart()`**
```javascript
// Datos para gráfico de visitantes (últimos 7 días)
{
  labels: Array<String>,     // Fechas
  data: Array<Number>,       // Cantidad visitantes
  backgroundColor: String,   // Color del gráfico
  borderColor: String
}
```

**`getAlimentosChart()`**
```javascript
// Distribución de tipos de alimentos
{
  labels: Array<String>,     // Tipos de alimento
  data: Array<Number>,       // Cantidades
  backgroundColor: Array<String>
}
```

**`getRealTimeData()`**
```javascript
// Datos en tiempo real para WebSocket
{
  timestamp: String,
  animalesActivos: Number,
  empleadosEnTurno: Number,
  alertasActivas: Number,
  temperatura: Number,       // Simulada
  visitantesActuales: Number
}
```

**`generateFullReport()`**
```javascript
// Reporte consolidado completo
{
  fecha: String,
  estadisticasGenerales: Object,
 reporteAnimales: Array,
  reporteEmpleados: Array,
  reporteFinanciero: Object,
  alertas: Array,
  resumenOperativo: Object
}
```

### Integración con WebSocket
```javascript
// El dashboard service se integra automáticamente con WebSocket
const websocketService = require('./websocketService');

// Broadcast de actualizaciones cada 30 segundos
setInterval(async () => {
  const realTimeData = await getRealTimeData();
  websocketService.broadcastUpdate('dashboard-update', realTimeData);
}, 30000);
```

---

## 🌐 WebSocket Service - Documentación Técnica

### Archivo: `services/websocketService.js`

#### Funciones Principales

**`initialize(server)`**
```javascript
// Inicializa el servidor Socket.IO
// Parámetros: server (HTTP server instance)
// Retorna: io (Socket.IO instance)
```

**`broadcastUpdate(event, data)`**
```javascript
// Envía datos a todos los clientes conectados
// Parámetros:
//   - event: String (nombre del evento)
//   - data: Object (datos a enviar)
```

**`getStats()`**
```javascript
// Retorna estadísticas de conexiones WebSocket
{
  connectedClients: Number,
  totalConnections: Number,
  lastUpdate: String
}
```

#### Eventos WebSocket Disponibles

**Cliente -> Servidor:**
- `join-dashboard`: Cliente se une al dashboard
- `request-update`: Cliente solicita actualización

**Servidor -> Cliente:**
- `dashboard-update`: Actualización completa del dashboard
- `charts-update`: Actualización específica de gráficos
- `system-alert`: Alerta del sistema
- `connection-stats`: Estadísticas de conexión

#### Manejo de Conexiones
```javascript
io.on('connection', (socket) => {
  // Nuevo cliente conectado
  logger.info(`Cliente conectado: ${socket.id}`);
  
  socket.on('join-dashboard', () => {
    socket.join('dashboard-room');
  });
  
  socket.on('disconnect', () => {
    logger.info(`Cliente desconectado: ${socket.id}`);
  });
});
```

---

## 🧹 Limpieza Service - Documentación Técnica

### Archivo: `services/limpiezaService.js`

#### Funciones Principales

**`getAllTareasLimpieza(filters)`**
```javascript
// Retorna todas las tareas de limpieza con filtros
{
  area: String,          // 'jaulas', 'sanitarios', 'jardines', 'area_juegos', 'oficinas'
  estado: String,        // 'pendiente', 'en_progreso', 'completada'
  encargado_id: String,
  fecha_inicio: String,
  fecha_fin: String
}
```

**`getTareaLimpiezaById(id)`**
```javascript
// Retorna una tarea de limpieza específica
{
  id: String,
  area: String,
  encargado_id: String,
  frecuencia: String,    // 'diaria', 'semanal', 'quincenal', 'mensual'
  ultima_fecha: String,
  proxima_fecha: String,
  estado: String,
  notas: String,
  activo: Boolean,
  created_at: String,
  updated_at: String
}
```

**`createTareaLimpieza(tareaData)`**
```javascript
// Crea una nueva tarea de limpieza
{
  area: String,          // Requerido
  encargado_id: String,  // Opcional
 frecuencia: String,    // Opcional
  ultima_fecha: String,  // Opcional
  proxima_fecha: String, // Opcional
  estado: String,        // Opcional, por defecto 'pendiente'
  notas: String,         // Opcional
  activo: Boolean        // Opcional, por defecto true
}
```

**`checkTareasVencidas()`**
```javascript
// Verifica tareas de limpieza vencidas
// Retorna array de tareas vencidas
```

### Integración con WebSocket
```javascript
// El servicio de limpieza se integra con WebSocket para alertas
const websocketService = require('./websocketService');

// Programar verificación diaria de tareas vencidas
cron.schedule('0 8 * * *', async () => {
  const tareasVencidas = await checkTareasVencidas();
  
  if (tareasVencidas.length > 0) {
    websocketService.broadcastAlert({
      type: 'warning',
      title: 'Tareas de Limpieza Vencidas',
      message: `Hay ${tareasVencidas.length} tareas de limpieza pendientes de atención`,
      tareas: tareasVencidas.map(t => ({
        id: t.id,
        area: t.area,
        proxima_fecha: t.proxima_fecha,
        encargado_id: t.encargado_id
      }))
    });
  }
});
```

---

## 👥 RRHH Service - Documentación Técnica

### Archivo: `services/rrhhService.js`

#### Funciones Principales

**`getPlanillaMensual(mes, anio, filters)`**
```javascript
// Retorna la planilla mensual de empleados
{
  empleado_id: String,
 nombre: String,
  puesto: String,
  salario_base: Number,
  bonos_totales: Number,
  descuentos_totales: Number,
  total_a_pagar: Number,
  estado_pago: String,
  bonos_detalle: Array,
 descuentos_detalle: Array
}
```

**`getAllVacaciones(filters)`**
```javascript
// Retorna todas las vacaciones con filtros
{
  empleado_id: String,
  estado: String,        // 'solicitada', 'aprobada', 'rechazada', 'cancelada'
  fecha_inicio: String,
  fecha_fin: String
}
```

**`getAllInasistencias(filters)`**
```javascript
// Retorna todas las inasistencias con filtros
{
  empleado_id: String,
  tipo: String,          // 'justificada', 'injustificada', 'permiso', 'enfermedad'
  fecha: String,
  fecha_inicio: String,
  fecha_fin: String
}
```

**`getAllDescuentos(filters)`**
```javascript
// Retorna todos los descuentos con filtros
{
  empleado_id: String,
  tipo: String,          // 'falta', 'anticipo', 'otro'
  fecha_inicio: String,
  fecha_fin: String
}
```

**`getAllBonos(filters)`**
```javascript
// Retorna todos los bonos con filtros
{
  empleado_id: String,
  tipo: String,          // 'productividad', 'cumpleaños', 'extraordinario'
  fecha_inicio: String,
 fecha_fin: String
}
```

---

## 📈 Report Service - Documentación Técnica

### Archivo: `services/reportService.js`

#### Funciones de Reportes

**`getAnimalHealthReport()`**
```javascript
// Reporte de salud animal
{
  totalAnimales: Number,
  animalesSanos: Number,
  animalesEnfermos: Number,
  proximasVacunas: Array,
  detallesPorEspecie: Object
}
```

**`getFinancialReport(periodo)`**
```javascript
// Reporte financiero por período
{
  periodo: String,
  ingresosTotales: Number,
 gastosTotales: Number,
  beneficioNeto: Number,
 detalleIngresos: Object,
  detalleGastos: Object
}
```

**`generateExcelReport(tipo, datos)`**
```javascript
// Genera archivo Excel
// Parámetros:
//   - tipo: String ('animales', 'empleados', 'financiero', 'planilla')
//   - datos: Object (datos del reporte)
// Retorna: Buffer (archivo Excel)
```

#### Tipos de Reportes Excel Disponibles

1. **Reporte de Animales**
   - Lista completa con fotos
   - Estado de salud
   - Historial médico
   - Gráfico de distribución por especies

2. **Reporte de Empleados**
   - Información personal
   - Departamentos y roles
   - Horarios y asistencia
   - Gráfico de distribución departamental

3. **Reporte Financiero**
   - Ingresos y gastos
   - Análisis de rentabilidad
   - Proyecciones
   - Gráficos de tendencias

4. **Reporte de Planilla Mensual**
   - Salario base
   - Bonos totales
   - Descuentos totales
   - Total a pagar
   - Estado de pago
   - Gráfico de distribución de bonos vs descuentos

5. **Reporte Consolidado**
   - Resumen ejecutivo
   - KPIs principales
   - Alertas y recomendaciones
   - Dashboard completo en Excel

---

## 🔒 Seguridad Avanzada Implementada

### Rate Limiting Inteligente

#### Limitadores Configurados

**General Limiter**
```javascript
windowMs: 15 * 60 * 100,  // 15 minutos
max: 100,                  // 100 requests por ventana
```

**Auth Limiter**
```javascript
windowMs: 15 * 60 * 1000,  // 15 minutos
max: 5,                    // 5 intentos de login
skipSuccessfulRequests: true
```

**Dashboard Limiter**
```javascript
windowMs: 1 * 60 * 1000,   // 1 minuto
max: 30,                   // 30 requests al dashboard
```

**Sensitive Operations Limiter**
```javascript
windowMs: 5 * 60 * 1000,   // 5 minutos
max: 20,                   // 20 operaciones críticas
```

**Speed Limiter (Slow Down)**
```javascript
windowMs: 15 * 60 * 1000,  // 15 minutos
delayAfter: 50,            // 50 requests sin delay
delayMs: 500,              // 500ms delay incremental
maxDelayMs: 20000          // máximo 20 segundos delay
```

### Validación Exhaustiva

**Middleware de Validación**
```javascript
// Ejemplo para creación de tareas de limpieza
const limpiezaValidation = [
  body('area').notEmpty().isIn(['jaulas', 'sanitarios', 'jardines', 'area_juegos', 'oficinas']),
  body('encargado_id').optional().isString(),
  body('frecuencia').optional().isIn(['diaria', 'semanal', 'quincenal', 'mensual']),
  body('ultima_fecha').optional().isDate(),
  body('proxima_fecha').optional().isDate(),
  body('estado').optional().isIn(['pendiente', 'en_progreso', 'completada']),
  body('notas').optional().isString().isLength({ max: 500 }),
  body('activo').optional().isBoolean()
];
```

### Headers de Seguridad (Helmet)
```javascript
helmet({
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
})
```

---

## 📝 Sistema de Logging Avanzado (Winston)

### Configuración de Logs

**Archivo: `middleware/logger.js`**

#### Transportes Configurados

**1. Console Logger (Desarrollo)**
```javascript
new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
    })
  )
})
```

**2. File Logger (Producción)**
```javascript
new winston.transports.DailyRotateFile({
  filename: './logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
 maxFiles: '14d'
})
```

**3. Error Logger**
```javascript
new winston.transports.DailyRotateFile({
  filename: './logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d'
})
```

#### Niveles de Log Implementados

- **error**: Errores críticos del sistema
- **warn**: Advertencias (rate limits, validaciones fallidas)
- **info**: Información general (conexiones, operaciones exitosas)
- **debug**: Información detallada para desarrollo

#### Middleware de Request Logging
```javascript
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous'
    });
  });
  
  next();
};
```

---

## 🗄️ Base de Datos - Estructura Optimizada

### Tablas Principales

#### Tabla `animales`
```sql
CREATE TABLE animales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(10) NOT NULL,
    especie VARCHAR(100) NOT NULL,
    edad INTEGER CHECK (edad >= 0),
    peso DECIMAL(8,2) CHECK (peso > 0),
    habitat VARCHAR(100) NOT NULL,
    dieta TEXT,
    estado_salud VARCHAR(50) DEFAULT 'sano' CHECK (estado_salud IN ('sano', 'enfermo', 'en_tratamiento')),
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    observaciones TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES usuarios(id),
    updated_by UUID REFERENCES usuarios(id)
);
```

#### Tabla `empleados`
```sql
CREATE TABLE empleados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    salario DECIMAL(10,2) NOT NULL,
    fecha_contratacion DATE NOT NULL,
    fecha_nacimiento DATE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    vacaciones_disponibles INTEGER DEFAULT 0,
    inasistencias INTEGER DEFAULT 0,
    suspensiones INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'inactivo')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `tareas_limpieza` (Nueva)
```sql
CREATE TABLE tareas_limpieza (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area VARCHAR(100) NOT NULL, -- valores: 'jaulas', 'sanitarios', 'jardines', 'area_juegos', 'oficinas'
    encargado_id UUID REFERENCES empleados(id),
    frecuencia VARCHAR(20) CHECK (frecuencia IN ('diaria', 'semanal', 'quincenal', 'mensual')),
    ultima_fecha DATE,
    proxima_fecha DATE,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_progreso', 'completada')) DEFAULT 'pendiente',
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `vacaciones` (Nueva)
```sql
CREATE TABLE vacaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('solicitada', 'aprobada', 'rechazada', 'cancelada')) DEFAULT 'solicitada',
    comentarios TEXT,
    aprobado_por UUID REFERENCES empleados(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `inasistencias` (Nueva)
```sql
CREATE TABLE inasistencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    fecha DATE NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('justificada', 'injustificada', 'permiso', 'enfermedad')),
    motivo TEXT,
    evidencia_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `descuentos` (Nueva)
```sql
CREATE TABLE descuentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    concepto VARCHAR(100),
    monto DECIMAL(8,2),
    fecha_aplicacion DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('falta', 'anticipo', 'otro')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla `bonos` (Nueva)
```sql
CREATE TABLE bonos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    concepto VARCHAR(100),
    monto DECIMAL(8,2),
    fecha_otorgamiento DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('productividad', 'cumpleaños', 'extraordinario')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices Optimizados
```sql
-- Índices para mejorar performance
CREATE INDEX idx_animales_especie ON animales(especie);
CREATE INDEX idx_animales_estado_salud ON animales(estado_salud);
CREATE INDEX idx_animales_activo ON animales(activo);
CREATE INDEX idx_empleados_nombre ON empleados(nombre);
CREATE INDEX idx_empleados_puesto ON empleados(puesto);
CREATE INDEX idx_empleados_activo ON empleados(activo);
CREATE INDEX idx_tareas_limpieza_area ON tareas_limpieza(area);
CREATE INDEX idx_tareas_limpieza_encargado ON tareas_limpieza(encargado_id);
CREATE INDEX idx_tareas_limpieza_estado ON tareas_limpieza(estado);
CREATE INDEX idx_vacaciones_empleado ON vacaciones(empleado_id);
CREATE INDEX idx_vacaciones_estado ON vacaciones(estado);
CREATE INDEX idx_inasistencias_empleado ON inasistencias(empleado_id);
CREATE INDEX idx_inasistencias_fecha ON inasistencias(fecha);
CREATE INDEX idx_descuentos_empleado ON descuentos(empleado_id);
CREATE INDEX idx_bonos_empleado ON bonos(empleado_id);
CREATE INDEX idx_bonos_fecha ON bonos(fecha_otorgamiento);
```

### Triggers Automáticos
```sql
-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas principales
CREATE TRIGGER update_animales_updated_at BEFORE UPDATE ON animales 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tareas_limpieza_updated_at BEFORE UPDATE ON tareas_limpieza 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vaciones_updated_at BEFORE UPDATE ON vacaciones 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🚀 Server.js - Configuración Completa

### Nuevas Características Implementadas

#### Integración WebSocket
```javascript
const http = require('http');
const server = http.createServer(app);
const io = websocketService.initialize(server);

// Middleware para inyectar WebSocket en requests
app.use((req, res, next) => {
 req.io = io;
  req.websocketStats = websocketService.getStats();
  next();
});
```

#### Health Check Mejorado
```javascript
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
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 10) / 100,
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 10) / 100
    },
    websocket: {
      connectedClients: wsStats.connectedClients,
      totalConnections: wsStats.totalConnections
    }
  });
});
```

#### Rutas del Dashboard
```javascript
app.use('/api/dashboard', dashboardRoutes);
app.get('/dashboard', (req, res) => {
  res.redirect('/api/dashboard');
});

// Nuevas rutas para módulos
app.use('/api/limpieza', limpiezaRoutes);
app.use('/api/rrhh', rrhhRoutes);
```

#### Graceful Shutdown
```javascript
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
```

---

## 📊 Monitoreo y Performance

### Status Monitor
- **URL**: `http://localhost:3000/status`
- **Métricas**: CPU, memoria, response time, requests por segundo
- **Real-time**: Gráficos en tiempo real
- **Historial**: Datos de las últimas 24 horas

### Métricas WebSocket
```javascript
// Estadísticas disponibles
const wsStats = websocketService.getStats();
console.log(wsStats);
// {
//   connectedClients: 5,
//   totalConnections: 127,
//   lastUpdate: "2024-01-15T10:30:00.000Z"
// }
```

### Logging de Performance
```javascript
// Cada request HTTP es logged con:
{
  method: "GET",
  url: "/api/dashboard/data",
  statusCode: 200,
  duration: "45ms",
  ip: "192.168.100",
  userAgent: "Mozilla/5.0...",
  userId: "user-uuid-123"
}
```

---

## 🧪 Testing Actualizado

### Scripts de Testing
```bash
npm test              # Tests completos con Jest
npm run test:watch    # Tests en modo watch
npm run test:coverage # Tests con reporte de cobertura
```

### Tests Implementados

#### Unit Tests
- ✅ Auth Service (login, register, JWT)
- ✅ Animal Service (CRUD operations)
- ✅ Dashboard Service (stats, charts)
- ✅ WebSocket Service (connections, events)
- ✅ Report Service (Excel generation)
- ✅ Limpieza Service (CRUD operations)
- ✅ RRHH Service (CRUD operations)

#### Integration Tests
- ✅ API Endpoints completos
- ✅ Database operations
- ✅ WebSocket communication
- ✅ Rate limiting
- ✅ Error handling

#### Example Test (Dashboard Service)
```javascript
describe('Dashboard Service', () => {
  test('debería retornar estadísticas generales', async () => {
    const stats = await dashboardService.getGeneralStats();
    expect(stats).toHaveProperty('totalAnimales');
    expect(stats).toHaveProperty('totalEmpleados');
    expect(stats.totalAnimales).toBeGreaterThanOrEqual(0);
  });

  test('debería generar datos para gráfico de visitantes', async () => {
    const chartData = await dashboardService.getVisitantesChart();
    expect(chartData).toHaveProperty('labels');
    expect(chartData).toHaveProperty('data');
    expect(Array.isArray(chartData.labels)).toBe(true);
 });
});
```

---

## 🚀 Despliegue en Producción

### Variables de Entorno Requeridas
```env
# Servidor
NODE_ENV=production
PORT=3000

# Base de datos
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Seguridad
JWT_SECRET=your_ultra_secure_jwt_secret_512_bits_minimum
JWT_REFRESH_SECRET=your_ultra_secure_refresh_jwt_secret_512_bits_minimum
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://dashboard.your-domain.com

# Rate Limiting (opcional, aumentar en producción)
RATE_LIMIT_WINDOW_MS=90000      # 15 minutos
RATE_LIMIT_MAX_REQUESTS=1000     # 100 requests por ventana

# Email (opcional, para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@your-domain.com
SMTP_PASS=your_app_password

# Redis (opcional, para cache distribuido)
REDIS_URL=redis://your-redis-server:6379
```

### Comandos de Despliegue
```bash
# Instalar dependencias de producción
npm ci --only=production

# Iniciar con PM2
pm2 start ecosystem.config.js

# Monitoreo
pm2 monit

# Logs
pm2 logs jungle-planet-backend
```

### Configuración PM2 (ecosystem.config.js)
```javascript
module.exports = {
  apps: [{
    name: 'jungle-planet-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '1G',
    log_file: './logs/pm2.log',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### Configuración Nginx
```nginx
upstream jungle_planet_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name api.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://jungle_planet_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Dashboard específico
    location /dashboard {
        proxy_pass http://jungle_planet_backend/dashboard;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📋 Checklist de Funcionalidades Implementadas

### ✅ Autenticación y Seguridad
- [x] JWT Authentication con roles
- [x] bcrypt password hashing
- [x] Rate limiting inteligente
- [x] Input validation con express-validator
- [x] Security headers con Helmet
- [x] CORS configurado
- [x] Error handling centralizado
- [x] Sistema de refresh tokens

### ✅ Dashboard en Tiempo Real
- [x] WebSocket con Socket.IO
- [x] Dashboard HTML embebido
- [x] Gráficos interactivos Chart.js
- [x] Actualizaciones automáticas (30s)
- [x] Responsive design
- [x] Estadísticas en vivo
- [x] Sistema de alertas

### ✅ Gestión de Datos
- [x] CRUD completo Animales
- [x] CRUD completo Empleados
- [x] CRUD completo Alimentos
- [x] Sistema de búsqueda
- [x] Paginación y filtros
- [x] Validación exhaustiva

### ✅ Módulo de Limpieza
- [x] Gestión de tareas de limpieza
- [x] Asignación de encargados
- [x] Seguimiento de cumplimiento
- [x] Alertas de tareas vencidas
- [x] Frecuencias personalizadas

### ✅ Módulo de Recursos Humanos
- [x] Gestión de vacaciones
- [x] Control de inasistencias
- [x] Sistema de descuentos
- [x] Bonos y recompensas
- [x] Planilla mensual completa

### ✅ Reportes y Analytics
- [x] Reportes Excel exportables
- [x] Múltiples tipos de reporte
- [x] Gráficos incluidos en Excel
- [x] Reporte consolidado
- [x] Estadísticas avanzadas
- [x] Reporte de planilla con gráficos

### ✅ Logging y Monitoreo
- [x] Winston logging system
- [x] Request logging middleware
- [x] Error logging
- [x] Log rotation diaria
- [x] Health check endpoint
- [x] Status monitor
- [x] WebSocket stats

### ✅ Performance y Optimización
- [x] Compresión gzip
- [x] Database indexing
- [x] Query optimization
- [x] Memory management
- [x] Rate limiting inteligente
- [x] Graceful shutdown

---

## 🔮 Roadmap de Mejoras Futuras

### Próximas Implementaciones
1. **Sistema de Notificaciones Push**
   - Notificaciones móviles
   - Email automático
   - SMS para emergencias

2. **Sistema de Inventario Avanzado**
   - Códigos QR/Barcode
   - Control de vencimientos
   - Pedidos automáticos

3. **Módulo de Visitantes**
   - Sistema de entradas
   - Promociones dinámicas
   - Análisis de comportamiento

4. **IA y Machine Learning**
   - Predicción de enfermedades
   - Optimización de dietas
   - Análisis predictivo

5. **Mobile App Backend**
   - API para aplicación móvil
   - Sincronización offline
   - Push notifications

### Mejoras Técnicas
- **Microservicios**: Separar en servicios independientes
- **GraphQL**: Implementar API GraphQL
- **Redis Cache**: Cache distribuido
- **Docker**: Containerización completa
- **CI/CD**: Pipeline automático
- **Monitoring**: APM avanzado

---

## 📞 Soporte y Contacto

### Información del Proyecto
- **Versión Actual**: 1.0.0
- **Estado**: Producción Ready con Dashboard
- **Licencia**: MIT
- **Repositorio**: GitHub (configurar URL)

### Documentación Adicional
- **Swagger API**: `http://localhost:3000/api-docs`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Health Check**: `http://localhost:3000/health`
- **Status Monitor**: `http://localhost:3000/status`

### Contacto Técnico
- **Issues**: GitHub Issues para bugs
- **Discussions**: GitHub Discussions para preguntas
- **Pull Requests**: Contribuciones bienvenidas

---

**🦁 Jungle Planet Zoo Management System - Documentación Técnica Completa**  
*Sistema de gestión integral con dashboard en tiempo real - Donde la tecnología se encuentra con la naturaleza* 🌿

**Última actualización**: Enero 2024  
**Próxima revisión**: Febrero 2024