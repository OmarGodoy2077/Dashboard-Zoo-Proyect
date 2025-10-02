# 🦁 Jungle Planet Zoo Management System - Backend

<div align="center">

![Jungle Planet Logo](https://img.shields.io/badge/🦁-Jungle%20Planet%20Zoo-green?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18+-blue?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?style=for-the-badge&logo=postgresql)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7+-red?style=for-the-badge&logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Backend completo con Dashboard en Tiempo Real para el sistema de gestión del zoológico "Jungle Planet"**

</div>

---

## 📋 Descripción del Proyecto

**Jungle Planet** es un sistema integral de gestión para zoológicos que proporciona herramientas completas para la administración eficiente de todos los aspectos operativos. Este backend incluye un **dashboard en tiempo real con WebSocket** que permite monitorear todas las operaciones del zoológico instantáneamente.

## ✨ Características Principales

### 🔐 Autenticación y Seguridad
- **Autenticación JWT** con roles y permisos granulares
- **Rate limiting** inteligente por tipo de operación
- **Validación exhaustiva** de todos los datos
- **Encriptación bcrypt** para contraseñas
- **Headers de seguridad** con Helmet
- **Sistema de refresh tokens** para mayor seguridad

### 📊 Dashboard en Tiempo Real
- **WebSocket (Socket.IO)** para actualizaciones instantáneas
- **Gráficos interactivos** con Chart.js
- **Estadísticas en vivo** de animales, empleados y operaciones
- **Monitoreo del sistema** en tiempo real
- **Alertas automáticas** para eventos críticos

### 🦁 Gestión Integral de Zoológico
- **Control de animales** con fichas médicas completas
- **Gestión de empleados** por departamentos
- **Control de alimentos** y dietas personalizadas
- **Sistema de reportes** exportables a Excel
- **Monitoreo financiero** en tiempo real

### 📈 Reportes y Analytics
- **Reportes Excel** exportables automáticamente
- **Estadísticas avanzadas** con gráficos dinámicos
- **Dashboard ejecutivo** con KPIs en tiempo real
- **Análisis de tendencias** operativas

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

## 🏗️ Arquitectura del Sistema

```
Backend/
├── 📁 config/          # Configuraciones de BD y servicios
├── 📁 controllers/     # Controladores de rutas con dashboard
├── 📁 docs/           # Documentación completa
├── 📁 middleware/     # Middlewares de seguridad y validación
├── 📁 models/         # Modelos de datos
├── 📁 routes/         # Rutas de API incluyen dashboard
├── 📁 services/       # Lógica de negocio y WebSocket
├── 📁 utils/          # Utilidades y helpers
├── 📄 server.js       # Servidor principal con Socket.IO
├── 📄 package.json    # Dependencias completas
└── 📄 schema.sql      # Esquema de BD optimizado
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js v18+ 
- npm v8+
- PostgreSQL (Supabase recomendado)

### Instalación Rápida

1. **Clonar e instalar**
```bash
git clone https://github.com/tu-usuario/jungle-planet-zoo.git
cd jungle-planet-zoo/Backend
npm install
```

2. **Configurar variables de entorno**
```env
# .env
NODE_ENV=development
PORT=3000

# Supabase Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key
JWT_REFRESH_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

3. **Inicializar base de datos**
```bash
# Aplicar esquema SQL
psql -d your_database -f schema.sql
```

4. **Iniciar servidor**
```bash
npm run dev  # Desarrollo
npm start    # Producción
```

## 📊 Dashboard en Tiempo Real

### Acceso al Dashboard
- **URL**: `http://localhost:3000/dashboard`
- **Características**:
  - 📈 Gráficos interactivos con Chart.js
  - 🔄 Actualizaciones automáticas cada 30 segundos
  - 📱 Responsive design
  - ⚡ WebSocket para tiempo real

### Métricas Disponibles
- **Estadísticas Generales**: Animales, empleados, visitantes
- **Estado de Animales**: Salud, alimentación, ubicación
- **Personal Activo**: Empleados por turno
- **Finanzas**: Ingresos, gastos, entradas vendidas
- **Stock de Alimentos**: Inventario y vencimientos
- **Alertas Médicas**: Animales que requieren atención

## 🔌 API Endpoints Principales

### Limpieza (`/api/limpieza`)
```http
GET    /api/limpieza          # Listar tareas de limpieza
POST   /api/limpieza          # Crear tarea de limpieza
GET    /api/limpieza/:id      # Obtener tarea de limpieza
PUT    /api/limpieza/:id      # Actualizar tarea de limpieza
DELETE /api/limpieza/:id      # Eliminar tarea de limpieza
```

### RRHH (`/api/rrhh`)
```http
# Vacaciones
GET    /api/rrhh/vacaciones
POST   /api/rrhh/vacaciones
GET    /api/rrhh/vacaciones/:id
PUT    /api/rrhh/vacaciones/:id
DELETE /api/rrhh/vacaciones/:id

# Inasistencias
GET    /api/rrhh/inasistencias
POST   /api/rrhh/inasistencias
GET    /api/rrhh/inasistencias/:id
PUT    /api/rrhh/inasistencias/:id
DELETE /api/rrhh/inasistencias/:id

# Descuentos
GET    /api/rrhh/descuentos
POST   /api/rrhh/descuentos
GET    /api/rrhh/descuentos/:id
PUT    /api/rrhh/descuentos/:id
DELETE /api/rrhh/descuentos/:id

# Bonos
GET    /api/rrhh/bonos
POST   /api/rrhh/bonos
GET    /api/rrhh/bonos/:id
PUT    /api/rrhh/bonos/:id
DELETE /api/rrhh/bonos/:id

# Planilla Mensual
GET    /api/rrhh/planilla/:mes/:anio    # Obtener planilla mensual
```

### Dashboard (`/api/dashboard`)
```http
GET  /api/dashboard          # Dashboard HTML completo
GET  /api/dashboard/data     # Datos JSON del dashboard
GET  /api/dashboard/charts   # Datos para gráficos
GET  /api/dashboard/reports  # Reportes consolidados
GET  /api/dashboard/reports/excel # Exportar a Excel
```

### Autenticación (`/api/auth`)
```http
POST /api/auth/login         # Iniciar sesión
POST /api/auth/register      # Registrar usuario
GET  /api/auth/profile       # Obtener perfil
POST /api/auth/logout        # Cerrar sesión
POST /api/auth/refresh       # Refrescar token
```

### Animales (`/api/animales`)
```http
GET    /api/animales         # Listar animales
POST   /api/animales         # Crear animal
GET    /api/animales/:id     # Obtener animal
PUT    /api/animales/:id     # Actualizar animal
DELETE /api/animales/:id     # Eliminar animal
```

### Empleados (`/api/empleados`)
```http
GET    /api/empleados        # Listar empleados
POST   /api/empleados        # Crear empleado
GET    /api/empleados/:id    # Obtener empleado
PUT    /api/empleados/:id    # Actualizar empleado
```

### Alimentos (`/api/alimentos`)
```http
GET    /api/alimentos        # Listar alimentos
POST   /api/alimentos        # Crear alimento
GET    /api/alimentos/stock  # Reporte de stock
```

## 🛡️ Seguridad Implementada

### Rate Limiting Inteligente
- **General**: 100 requests/15min
- **Autenticación**: 5 intentos/15min
- **Dashboard**: 30 requests/minuto
- **Operaciones sensibles**: 20 requests/5min

### Validación y Protección
- Validación exhaustiva con express-validator
- Sanitización automática de datos
- Headers de seguridad con Helmet
- Prevención de inyección SQL

## 📝 Sistema de Logging

### Configuración Winston
- **Ubicación**: `./logs/`
- **Rotación**: Diaria automática
- **Niveles**: error, warn, info, debug
- **Formato**: JSON estructurado

### Monitoreo
- **Health Check**: `GET /health`
- **Status Monitor**: `GET /status`
- **WebSocket Stats**: Clientes conectados en tiempo real

## 🧪 Testing y Scripts

```bash
npm start          # Servidor de producción
npm run dev        # Desarrollo con nodemon
npm test           # Tests con Jest
npm run lint       # Linting con ESLint
npm run docs       # Mostrar documentación
```

## 🌐 WebSocket Events

```javascript
// Eventos disponibles para clientes
socket.on('dashboard-update', (data) => {
  // Actualización completa del dashboard
});

socket.on('charts-update', (data) => {
  // Actualización específica de gráficos
});

socket.on('system-alert', (alert) => {
  // Alertas del sistema en tiempo real
});
```

## 📈 Reportes Excel

### Generación Automática
- **Animales**: `/api/dashboard/reports/animals/excel`
- **Empleados**: `/api/dashboard/reports/employees/excel`
- **Financiero**: `/api/dashboard/reports/financial/excel`
- **Consolidado**: `/api/dashboard/reports/consolidated`

### Características
- Formato Excel (.xlsx) estándar
- Gráficos incluidos automáticamente
- Datos en tiempo real
- Múltiples hojas por reporte

## 🚀 Despliegue en Producción

### Variables de Entorno
```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_production_url
JWT_SECRET=your_secure_production_secret
JWT_REFRESH_SECRET=your_secure_production_refresh_secret
ALLOWED_ORIGINS=https://your-domain.com
```

### Recomendaciones
- **Proxy**: Nginx o Apache
- **HTTPS**: Certificados SSL obligatorios
- **PM2**: Para gestión de procesos
- **Monitoreo**: New Relic, DataDog

## 📚 Documentación

### Archivos Disponibles
- **README.md** - Este archivo (overview)
- **DOCUMENTACION_BACKEND.md** - Documentación técnica detallada
- **Swagger UI** - `/api-docs` (documentación interactiva)

### Tecnologías Utilizadas
- **Backend**: Node.js, Express.js
- **Base de datos**: PostgreSQL (Supabase)
- **Tiempo real**: Socket.IO
- **Gráficos**: Chart.js
- **Reportes**: XLSX
- **Logging**: Winston
- **Seguridad**: JWT, bcrypt, Helmet

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Agregar funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

## 📞 Soporte

- **Versión**: 1.0
- **Licencia**: MIT
- **Issues**: GitHub Issues
- **Documentación**: `/docs/`

---

## 🌟 Características Destacadas

### ⚡ Performance
- Compresión gzip automática
- Consultas optimizadas
- Cache inteligente
- WebSocket eficiente

### 🔄 Escalabilidad
- Arquitectura modular
- WebSocket clustering ready
- Base de datos distribuida
- Load balancing compatible

### 🛠️ Mantenibilidad
- Código documentado
- Tests automatizados
- Logging estructurado
- Separación de responsabilidades

---

**¡Sistema completo de gestión de zoológico con dashboard en tiempo real! 🦁📊**

*Jungle Planet Zoo Management System - Donde la tecnología encuentra la naturaleza* 🌿