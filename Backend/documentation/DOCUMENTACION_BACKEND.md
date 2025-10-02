# Backend Documentation - Sistema de Gestión del Zoológico Jungle Planet

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Arquitectura del Backend](#arquitectura-del-backend)
4. [Conexión a la Base de Datos](#conexión-a-la-base-de-datos)
5. [Servicios y Funciones](#servicios-y-funciones)
6. [Middleware y Seguridad](#middleware-y-seguridad)
7. [API Endpoints](#api-endpoints)
8. [Sistema de Logs](#sistema-de-logs)
9. [Monitoreo y Métricas](#monitoreo-y-métricas)
10. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)

## Introducción

El backend del sistema de gestión del zoológico Jungle Planet es una aplicación Node.js robusta y segura diseñada para producción. Proporciona una API RESTful completa para gestionar todas las operaciones del zoológico, incluyendo animales, empleados, alimentos, limpieza, atención clínica, nóminas, inventario, entradas y promociones.

El sistema utiliza una arquitectura basada en servicios con capas claras de separación de responsabilidades. Incluye funcionalidades en tiempo real mediante WebSockets, seguridad avanzada con JWT y rate limiting, y un completo sistema de logging y monitoreo.

## Tecnologías Utilizadas

### Stack Principal
- **Node.js**: Entorno de ejecución JavaScript del lado del servidor
- **Express.js**: Framework web para crear servidores HTTP y gestionar rutas
- **Supabase**: Backend como servicio con PostgreSQL para almacenamiento de datos
- **Socket.io**: Comunicación en tiempo real para actualizaciones de dashboard
- **JSON Web Tokens (JWT)**: Autenticación y autorización seguras

### Seguridad y Protección
- **Helmet**: Protección contra vulnerabilidades web comunes
- **CORS**: Configuración de políticas de intercambio de recursos entre dominios
- **Rate Limiting**: Protección contra ataques de fuerza bruta y DDOS
- **Bcrypt**: Hashing seguro de contraseñas
- **Express-validator**: Validación y sanitización de entradas

### Logging y Monitoreo
- **Winston**: Sistema de logging flexible y potente
- **Morgan**: Logging de solicitudes HTTP
- **Express-status-monitor**: Monitorización en tiempo real del servidor

### Otros Componentes
- **Dotenv**: Gestión de variables de entorno
- **Compression**: Compresión de respuestas HTTP para mejor rendimiento
- **Multer**: Manejo de uploads de archivos
- **UUID**: Generación de identificadores únicos
- **Chart.js**: Generación de gráficas para reportes
- **Node-cron**: Tareas programadas
- **Nodemailer**: Envío de correos electrónicos
- **Joi**: Validación de esquemas

## Arquitectura del Backend

### Estructura de Directorios
```
├── server.js              # Punto de entrada principal del servidor
├── config/                # Configuración del sistema (base de datos, autenticación)
├── routes/                # Definición de rutas API
├── controllers/           # Lógica de controladores (opcional, dependiendo de la estructura)
├── services/              # Lógica de negocio y operaciones con datos
├── middleware/            # Middleware personalizado
├── models/ (o usando directamente Supabase) # Definiciones de modelos
├── utils/                 # Utilidades y funciones auxiliares
├── documentation/         # Documentación del sistema
└── tests/                 # Pruebas unitarias e integración
```

### Patrón de Diseño
El backend sigue un patrón de arquitectura limpia con separación clara de capas:
- **Rutas**: Manejan las solicitudes HTTP y devuelven respuestas
- **Controladores**: Gestionan la lógica de las rutas (cuando se implementa)
- **Servicios**: Contienen la lógica de negocio específica
- **Modelos/Clientes**: Interactúan directamente con la base de datos

## Conexión a la Base de Datos

### Configuración de Supabase
El sistema utiliza Supabase como backend como servicio basado en PostgreSQL. La conexión se configura en `config/database.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### Variables de Entorno Requeridas
- `SUPABASE_URL`: URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio para Supabase

### Función de Prueba de Conexión
```javascript
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios') // Consulta simple para verificar conexión
      .select('id')
      .limit(1);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('❌ Error al conectar a Supabase:', err.message);
    throw err;
  }
};
```

### Cliente de Supabase
Todas las operaciones CRUD se realizan directamente con el cliente de Supabase, usando métodos como:
- `supabase.from('tabla').select()`
- `supabase.from('tabla').insert([datos])`
- `supabase.from('tabla').update(datos).eq('id', id)`
- `supabase.from('tabla').delete().eq('id', id)`

## Servicios y Funciones

### Descripción General
Los servicios se encuentran en la carpeta `services/` y encapsulan la lógica de negocio para diferentes entidades del sistema. Cada servicio maneja operaciones CRUD y lógica específica para una entidad.

### Servicios Principales

#### 1. animalService.js
Gestiona todas las operaciones relacionadas con los animales del zoológico:
- `getAllAnimales()`: Obtiene todos los animales
- `getAnimalById(id)`: Obtiene un animal específico
- `createAnimal(animalData)`: Crea un nuevo animal
- `updateAnimal(id, animalData)`: Actualiza un animal existente
- `deleteAnimal(id)`: Elimina un animal
- `getAnimalesEnfermosRecientes()`: Obtiene animales enfermos recientes
- `getAnimalesPorEspecie()`: Devuelve conteo de animales por especie

#### 2. empleadoService.js
Gestiona las operaciones relacionadas con empleados:
- `getAllEmpleados()`: Obtiene todos los empleados
- `getEmpleadoById(id)`: Obtiene un empleado específico
- `createEmpleado(empleadoData)`: Crea un nuevo empleado
- `updateEmpleado(id, empleadoData)`: Actualiza un empleado existente
- `deleteEmpleado(id)`: Elimina un empleado
- Funciones específicas para roles y departamentos

#### 3. alimentoService.js
Maneja el control de inventario y consumo de alimentos:
- `getAllAlimentos()`: Obtiene todos los tipos de alimentos
- `getAlimentoById(id)`: Obtiene un alimento específico
- `createAlimento(alimentoData)`: Crea un nuevo tipo de alimento
- `updateAlimento(id, alimentoData)`: Actualiza un alimento existente
- Funciones de control de stock y notificaciones

#### 4. dashboardService.js
Proporciona datos para el dashboard del sistema:
- `getRealTimeData()`: Obtiene datos en tiempo real para el dashboard
- `generateFullReport()`: Genera reporte completo
- `getVisitantesChart()`: Datos para gráfica de visitantes
- `getAnimalesSaludChart()`: Datos para gráfica de salud de animales
- `getEmpleadosPorDepartamento()`: Datos para gráfica de empleados por departamento

#### 5. authService.js
Maneja la autenticación de usuarios:
- `register(userData)`: Registra un nuevo usuario
- `login(credentials)`: Autentica un usuario y devuelve token JWT
- `verifyToken(token)`: Valida un token JWT

#### 6. Servicios Especializados
- `clinico.service.js`: Gestión de atención clínica veterinaria
- `limpiezaService.js`: Gestión de tareas de limpieza
- `nomina.service.js`: Gestión de nóminas de empleados
- `inventario.service.js`: Gestión de inventario general
- `entrada.service.js`: Gestión de entradas al zoológico
- `promocion.service.js`: Gestión de promociones y ofertas
- `rrhhService.js`: Gestión de recursos humanos

### WebSocket Service
El servicio `websocketService.js` proporciona funcionalidades en tiempo real:
- Actualizaciones del dashboard en tiempo real
- Notificaciones de sistema
- Monitoreo de conexiones de clientes
- Verificación periódica de tareas pendientes

## Middleware y Seguridad

### Middleware de Seguridad

#### 1. Autenticación (auth.js)
Implementa JWT para autenticación segura:
```javascript
const auth = async (req, res, next) => {
  // Extrae token del header Authorization
  // Verifica token JWT
  // Obtiene información del usuario desde la base de datos
  // Añade información del usuario a req.user
};
```

- Valida formato del token (Bearer)
- Verifica token JWT con clave secreta
- Recupera información del usuario desde la base de datos
- Proporciona middleware de autorización por roles

#### 2. Validación (validation.js)
Valida y sanitiza datos de entrada usando express-validator:
- Verifica tipos de datos
- Valida formatos (emails, contraseñas, etc.)
- Sanitiza entradas para prevenir inyección

#### 3. Rate Limiter
Protege contra ataques de fuerza bruta:
- Limita solicitudes por IP
- Configurable para diferentes endpoints
- Prevención de DDOS

#### 4. Logger (logger.js)
Sistema de logging con Winston:
- Logging de solicitudes HTTP
- Logging de errores
- Logging de actividades del sistema
- Rotación de logs por tiempo

#### 5. Body Parser
Valida y parsea cuerpos de solicitudes:
- Verifica Content-Type antes de parsear
- Manejo de errores de parsing
- Límite de tamaño configurable

#### 6. Error Handler
Manejo centralizado de errores:
- Captura errores no manejados
- Respuestas de error consistentes
- Logging de errores

### Configuración de Seguridad en Helmet
```javascript
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
```

## API Endpoints

### Endpoints Principales
- `GET /health`: Verificación de estado del servidor
- `GET /status`: Monitorización del sistema
- `GET /`: Información general de la API

### Módulos de API

#### 1. Autenticación (`/api/auth`)
- `POST /register`: Registro de usuario
- `POST /login`: Inicio de sesión
- `POST /logout`: Cierre de sesión
- `GET /profile`: Obtener perfil de usuario

#### 2. Animales (`/api/animales`)
- `GET /`: Obtener todos los animales
- `GET /:id`: Obtener animal por ID
- `POST /`: Crear nuevo animal
- `PUT /:id`: Actualizar animal
- `DELETE /:id`: Eliminar animal

#### 3. Empleados (`/api/empleados`)
- `GET /`: Obtener todos los empleados
- `GET /:id`: Obtener empleado por ID
- `POST /`: Crear nuevo empleado
- `PUT /:id`: Actualizar empleado
- `DELETE /:id`: Eliminar empleado

#### 4. Alimentos (`/api/alimentos`)
- `GET /`: Obtener todos los alimentos
- `GET /:id`: Obtener alimento por ID
- `POST /`: Crear nuevo alimento
- `PUT /:id`: Actualizar alimento
- `DELETE /:id`: Eliminar alimento

#### 5. Dashboard (`/api/dashboard`)
- `GET /`: Obtener datos del dashboard
- `GET /stats`: Obtener estadísticas generales
- `GET /charts`: Obtener datos para gráficas

#### 6. Módulos Especializados
- `/api/limpieza`: Gestión de tareas de limpieza
- `/api/clinico`: Gestión de atención clínica
- `/api/nominas`: Gestión de nóminas
- `/api/inventario`: Gestión de inventario
- `/api/entradas`: Gestión de entradas
- `/api/promociones`: Gestión de promociones
- `/api/rrhh`: Gestión de recursos humanos

### Ejemplo de Respuesta API
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0",
  "memory": {
    "rss": 50.25,
    "heapUsed": 30.15,
    "heapTotal": 40.50
  },
  "websocket": {
    "connectedClients": 5,
    "totalConnections": 10
  }
}
```

## Sistema de Logs

El sistema utiliza Winston para logging con las siguientes características:

### Categorías de Logs
- **Info**: Eventos importantes del sistema
- **Warn**: Eventos potencialmente problemáticos
- **Error**: Errores del sistema
- **Debug**: Información detallada para desarrollo

### Formato de Logs
- Timestamp
- Nivel de log
- Mensaje
- Metadatos (IP, usuario, endpoint, etc.)

### Rotación de Logs
Los logs se rotan diariamente para mantener un historial de eventos sin sobrecargar el sistema.

## Monitoreo y Métricas

### Health Check Endpoint
El endpoint `/health` proporciona información completa del estado del sistema:
- Tiempo de actividad
- Uso de memoria
- Estado de WebSocket
- Entorno

### Monitoreo en Tiempo Real
- WebSocket para actualizaciones en tiempo real
- Conteo de clientes conectados
- Estadísticas de conexión
- Alertas de sistema

### Dashboard en Tiempo Real
- Actualizaciones cada 30 segundos
- Gráficas actualizadas cada 5 minutos
- Notificaciones de eventos importantes
- Monitorización de tareas pendientes

## Configuración y Variables de Entorno

### Variables Requeridas
- `PORT`: Puerto del servidor (por defecto 3000)
- `JWT_SECRET`: Clave para firma de tokens JWT
- `SUPABASE_URL`: URL del proyecto de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase
- `NODE_ENV`: Entorno (development/production)
- `ALLOWED_ORIGINS`: Orígenes permitidos para CORS

### Variables Opcionales
- `LOG_LEVEL`: Nivel de logging (info, warn, error, debug)
- `RATE_LIMIT_WINDOW`: Ventana de tiempo para rate limiting
- `RATE_LIMIT_MAX`: Número máximo de solicitudes por ventana

### Archivo .env.example
El proyecto incluye un archivo `.env.example` con todas las variables necesarias para configurar el entorno local.

## Funcionalidades Especializadas

### WebSocket Real-Time Dashboard
- Actualizaciones en tiempo real del dashboard
- Notificaciones de eventos críticos
- Control de tareas pendientes
- Monitoreo de salud de animales y otros indicadores clave

### Sistema de Reportes
- Reportes basados en datos de Supabase
- Generación automática de estadísticas
- Visualización de datos históricos
- Exportación de reportes (si implementado)

### Seguridad Avanzada
- Rate limiting para prevenir ataques
- Autenticación JWT con tokens expirables
- Validación de roles y permisos
- Protección contra inyección SQL (mediante Supabase)
- Sanitización de entradas

## Consideraciones de Despliegue

### Requisitos del Sistema
- Node.js versión 16 o superior
- Acceso a un proyecto de Supabase con base de datos PostgreSQL
- Variables de entorno configuradas

### Scripts de NPM
- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon
- `npm test`: Ejecuta pruebas con cobertura
- `npm run migrate`: Ejecuta migraciones de base de datos
- `npm run install:setup`: Configuración inicial del sistema

### Scripts de Desarrollo
- `npm run lint`: Verifica código con ESLint
- `npm run format`: Formatea código con Prettier
- `npm run check`: Ejecuta linting y pruebas

## Buenas Prácticas Implementadas

1. **Separación de Responsabilidades**: Código organizado en servicios, middleware, rutas y utilidades
2. **Seguridad**: Uso de JWT, rate limiting, sanitización de entradas y validación de esquemas
3. **Logging Exhaustivo**: Registro detallado de eventos, errores y actividades del sistema
4. **Manejo de Errores Centralizado**: Middleware para manejo de errores consistentes
5. **Conexión Segura a la Base de Datos**: Configuración adecuada de credenciales y validación
6. **Documentación**: Inclusión de documentación detallada del sistema
7. **Monitoreo y Métricas**: Endpoint de health check y sistema de monitoreo
8. **Tiempo Real**: WebSocket para actualizaciones en tiempo real
9. **Variables de Entorno**: Separación de configuración sensible del código
10. **Pruebas**: Configuración para pruebas unitarias e integración

## Conclusión

El backend del Sistema de Gestión del Zoológico Jungle Planet es una aplicación robusta, segura y preparada para producción que sigue las mejores prácticas de desarrollo web moderno. Con su arquitectura modular, sistema de seguridad completo y funcionalidades en tiempo real, proporciona una base sólida para la gestión eficiente de todas las operaciones del zoológico.