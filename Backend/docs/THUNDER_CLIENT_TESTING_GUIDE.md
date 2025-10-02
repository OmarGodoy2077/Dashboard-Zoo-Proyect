# 🧪 Guía de Pruebas con Thunder Client - Jungle Planet Zoo API

## 📋 Información General

**URL Base**: `http://localhost:3000`  
**Version**: 1.0.0  
**Fecha**: Septiembre 2025

---

## 🔍 Endpoints de Estado del Sistema

### 1. Health Check
```http
GET http://localhost:3000/health
```
**Descripción**: Verifica el estado del servidor y obtiene métricas del sistema.  
**Autenticación**: No requerida  
**Respuesta esperada**: 200 OK con información del sistema, memoria y WebSocket stats.

### 2. Status Monitor
```http
GET http://localhost:3000/status
```
**Descripción**: Monitor visual del estado del servidor.  
**Autenticación**: No requerida  
**Respuesta esperada**: Página HTML con gráficos de monitoreo.

### 3. Información de la API
```http
GET http://localhost:3000/
```
**Descripción**: Información general de la API y endpoints disponibles.  
**Autenticación**: No requerida

---

## 🔐 Autenticación (/api/auth)

### 1. Registrar Usuario
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan.perez@junglepland.com",
  "password": "Password123@",
  "rol": "empleado"
}
```
**Roles disponibles**: `admin`, `empleado`, `veterinario`, `contador`  
**Validaciones**:
- Nombre: 2-100 caracteres, solo letras y espacios
- Email: formato válido
- Password: mínimo 8 caracteres con mayúscula, minúscula, número y símbolo
- Rol: opcional, por defecto "empleado"

### 2. Iniciar Sesión
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "juan.perez@junglepland.com",
  "password": "Password123@"
}
```
**⚠️ IMPORTANTE**: Guardar el `token` de la respuesta para usar en requests autenticados.

### 3. Obtener Perfil (Requiere Autenticación)
```http
GET http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Actualizar Perfil (Requiere Autenticación)
```http
PUT http://localhost:3000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "nombre": "Juan Carlos Pérez",
  "email": "juancarlos.perez@junglepland.com"
}
```

### 5. Cerrar Sesión (Requiere Autenticación)
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 🦁 Gestión de Animales (/api/animales)

> **📋 Nota**: Todos los endpoints requieren autenticación. Algunos requieren roles específicos.

### 1. Listar Todos los Animales
```http
GET http://localhost:3000/api/animales
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 2. Listar Animales con Paginación y Filtros
```http
GET http://localhost:3000/api/animales?page=1&limit=10&especie=Leon&estado_salud=bueno
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```
**Parámetros de consulta**:
- `page`: número de página (por defecto 1)
- `limit`: elementos por página (por defecto 10, máximo 100)
- `especie`: filtrar por especie
- `estado_salud`: `excelente`, `bueno`, `regular`, `preocupante`, `critico`

### 3. Obtener Animal por ID
```http
GET http://localhost:3000/api/animales/ANIMAL_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Crear Nuevo Animal (Admin/Veterinario)
```http
POST http://localhost:3000/api/animales
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "nombre": "Simba",
  "especie": "León",
  "edad": 5,
  "peso": 180.5,
  "habitat": "Sabana Africana",
  "dieta": "carnivoro",
  "estado_salud": "excelente",
  "observaciones": "León macho adulto en excelente estado de salud"
}
```
**Validaciones**:
- `nombre`: requerido, 1-100 caracteres
- `especie`: requerida, 1-100 caracteres
- `edad`: número entero positivo
- `peso`: número decimal positivo
- `dieta`: `carnivoro`, `herbivoro`, `omnivoro`
- `estado_salud`: `excelente`, `bueno`, `regular`, `preocupante`, `critico`

### 5. Actualizar Animal (Admin/Veterinario)
```http
PUT http://localhost:3000/api/animales/ANIMAL_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "nombre": "Simba Rey",
  "edad": 6,
  "peso": 185.0,
  "estado_salud": "bueno",
  "observaciones": "Actualización de edad y peso en chequeo anual"
}
```

### 6. Eliminar Animal (Solo Admin)
```http
DELETE http://localhost:3000/api/animales/ANIMAL_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 7. Reporte de Animales Enfermos
```http
GET http://localhost:3000/api/animales/reporte/animales-enfermos
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 8. Reporte por Especie
```http
GET http://localhost:3000/api/animales/reporte/por-especie
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 🥘 Gestión de Alimentos (/api/alimentos)

### 1. Listar Todos los Alimentos
```http
GET http://localhost:3000/api/alimentos
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 2. Listar Alimentos con Filtros
```http
GET http://localhost:3000/api/alimentos?page=1&limit=20&tipo=carne&stock_minimo=true
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 3. Obtener Alimento por ID
```http
GET http://localhost:3000/api/alimentos/ALIMENTO_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Alimentos con Bajo Stock
```http
GET http://localhost:3000/api/alimentos/bajo-stock
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 5. Estadísticas de Alimentos
```http
GET http://localhost:3000/api/alimentos/estadisticas
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 6. Crear Nuevo Alimento (Admin/Contador)
```http
POST http://localhost:3000/api/alimentos
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "nombre": "Carne de Res Premium",
  "tipo": "Proteína Animal",
  "stock_actual": 500,
  "stock_minimo": 50,
  "unidad_medida": "kg",
  "precio_unitario": 15.50,
  "proveedor": "Carnes El Ganadero",
  "fecha_vencimiento": "2025-12-31",
  "ubicacion_almacen": "Almacén Refrigerado A1"
}
```

### 7. Actualizar Alimento (Admin/Contador)
```http
PUT http://localhost:3000/api/alimentos/ALIMENTO_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "stock_actual": 450,
  "precio_unitario": 16.00,
  "observaciones": "Actualización de inventario mensual"
}
```

### 8. Eliminar Alimento (Admin/Contador)
```http
DELETE http://localhost:3000/api/alimentos/ALIMENTO_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 👥 Gestión de Empleados (/api/empleados)

### 1. Listar Todos los Empleados
```http
GET http://localhost:3000/api/empleados
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```
**Roles requeridos**: Admin, Contador

### 2. Listar Empleados con Filtros
```http
GET http://localhost:3000/api/empleados?page=1&limit=15&departamento=Veterinaria&activo=true
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 3. Obtener Empleado por ID
```http
GET http://localhost:3000/api/empleados/EMPLEADO_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Estadísticas de Empleados
```http
GET http://localhost:3000/api/empleados/estadisticas
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 5. Crear Nuevo Empleado (Solo Admin)
```http
POST http://localhost:3000/api/empleados
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "usuario_id": "USER_UUID_HERE",
  "numero_empleado": "EMP001",
  "departamento": "Veterinaria",
  "puesto": "Veterinario Senior",
  "salario": 45000.00,
  "fecha_contratacion": "2025-01-15",
  "horario": "Lunes a Viernes 8:00-16:00",
  "supervisor_id": "SUPERVISOR_UUID_HERE"
}
```

### 6. Actualizar Empleado (Solo Admin)
```http
PUT http://localhost:3000/api/empleados/EMPLEADO_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "puesto": "Veterinario Principal",
  "salario": 50000.00,
  "horario": "Lunes a Viernes 7:00-15:00"
}
```

### 7. Eliminar Empleado (Solo Admin)
```http
DELETE http://localhost:3000/api/empleados/EMPLEADO_UUID_HERE
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 📊 Dashboard y Reportes (/api/dashboard)

### 1. Página del Dashboard (HTML)
```http
GET http://localhost:3000/api/dashboard
```
**Respuesta**: Página HTML completa del dashboard con gráficos interactivos.

### 2. Estadísticas Generales
```http
GET http://localhost:3000/api/dashboard/stats
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 3. Datos para Gráficos
```http
GET http://localhost:3000/api/dashboard/charts
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Datos en Tiempo Real
```http
GET http://localhost:3000/api/dashboard/realtime
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 5. Reporte Consolidado
```http
GET http://localhost:3000/api/dashboard/reports
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 6. Exportar Reporte de Animales a Excel
```http
GET http://localhost:3000/api/dashboard/reports/animals/excel
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 7. Exportar Reporte de Empleados a Excel
```http
GET http://localhost:3000/api/dashboard/reports/employees/excel
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 8. Exportar Reporte Financiero a Excel
```http
GET http://localhost:3000/api/dashboard/reports/financial/excel
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 9. Datos para Gráfico de Visitantes
```http
GET http://localhost:3000/api/dashboard/charts/visitantes
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 10. Datos para Gráfico de Alimentos
```http
GET http://localhost:3000/api/dashboard/charts/alimentos
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## 📂 Colecciones de Thunder Client Sugeridas

### 🔧 Configuración Inicial

1. **Crear Environment Variables en Thunder Client:**
   - `base_url`: `http://localhost:3000`
   - `auth_token`: (se actualizará después del login)
   - `user_id`: (se actualizará después del login)

2. **Estructura de Carpetas Sugerida:**
   ```
   📁 Jungle Planet API Tests
   ├── 📁 00. System Health
   ├── 📁 01. Authentication
   ├── 📁 02. Animals Management
   ├── 📁 03. Food Management
   ├── 📁 04. Employee Management
   ├── 📁 05. Dashboard & Reports
   └── 📁 99. Error Testing
   ```

---

## 🧪 Secuencia de Pruebas Recomendada

### ✅ Fase 1: Verificación del Sistema
1. **Health Check** - Verificar que el servidor esté funcionando
2. **API Info** - Confirmar endpoints disponibles
3. **Status Monitor** - Verificar métricas del sistema

### ✅ Fase 2: Autenticación
1. **Register** - Crear un usuario de prueba
2. **Login** - Obtener token de autenticación
3. **Profile** - Verificar datos del usuario
4. **Update Profile** - Probar actualización de datos

### ✅ Fase 3: Gestión de Datos
1. **Animales**: Crear → Listar → Obtener → Actualizar → Reportes
2. **Alimentos**: Crear → Listar → Stock bajo → Estadísticas
3. **Empleados**: Crear → Listar → Estadísticas (si tienes rol admin)

### ✅ Fase 4: Dashboard y Reportes
1. **Dashboard HTML** - Verificar interfaz visual
2. **Estadísticas** - Obtener datos agregados
3. **Gráficos** - Verificar datos para visualizaciones
4. **Reportes Excel** - Descargar reportes

---

## 🚨 Casos de Prueba de Errores

### 1. Autenticación Fallida
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "usuario@inexistente.com",
  "password": "passwordIncorrecto"
}
```
**Respuesta esperada**: 401 Unauthorized

### 2. Token Inválido
```http
GET http://localhost:3000/api/animales
Authorization: Bearer token_invalido_o_expirado
```
**Respuesta esperada**: 401 Unauthorized

### 3. Datos Inválidos
```http
POST http://localhost:3000/api/animales
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "nombre": "",
  "especie": "A",
  "edad": -5,
  "dieta": "dieta_invalida"
}
```
**Respuesta esperada**: 400 Bad Request con detalles de validación

### 4. Permisos Insuficientes
```http
DELETE http://localhost:3000/api/animales/ANIMAL_UUID_HERE
Authorization: Bearer EMPLEADO_TOKEN_HERE
```
**Respuesta esperada**: 403 Forbidden (solo admin puede eliminar)

### 5. Rate Limiting
Ejecutar múltiples requests rápidamente para activar el rate limiting:
```http
GET http://localhost:3000/api/animales
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```
**Respuesta esperada**: 429 Too Many Requests después de superar el límite

---

## 📊 Datos de Prueba Sugeridos

### Usuarios de Prueba
```json
// Admin
{
  "nombre": "Administrador Zoo",
  "email": "admin@junglepland.com",
  "password": "Admin123@",
  "rol": "admin"
}

// Veterinario
{
  "nombre": "Dr. Veterinario",
  "email": "vet@junglepland.com",
  "password": "Vet123@",
  "rol": "veterinario"
}

// Empleado
{
  "nombre": "Empleado Cuidador",
  "email": "empleado@junglepland.com",
  "password": "Emp123@",
  "rol": "empleado"
}

// Contador
{
  "nombre": "Contador Finanzas",
  "email": "contador@junglepland.com",
  "password": "Cont123@",
  "rol": "contador"
}
```

### Animales de Prueba
```json
[
  {
    "nombre": "Simba",
    "especie": "León",
    "edad": 5,
    "peso": 180.5,
    "habitat": "Sabana Africana",
    "dieta": "carnivoro",
    "estado_salud": "excelente"
  },
  {
    "nombre": "Dumbo",
    "especie": "Elefante",
    "edad": 12,
    "peso": 4500.0,
    "habitat": "Sabana",
    "dieta": "herbivoro",
    "estado_salud": "bueno"
  },
  {
    "nombre": "Coco",
    "especie": "Mono",
    "edad": 3,
    "peso": 15.2,
    "habitat": "Selva Tropical",
    "dieta": "omnivoro",
    "estado_salud": "regular"
  }
]
```

### Alimentos de Prueba
```json
[
  {
    "nombre": "Carne de Res",
    "tipo": "Proteína Animal",
    "stock_actual": 500,
    "stock_minimo": 50,
    "unidad_medida": "kg",
    "precio_unitario": 15.50,
    "proveedor": "Carnes Premium",
    "fecha_vencimiento": "2025-12-31"
  },
  {
    "nombre": "Manzanas",
    "tipo": "Fruta",
    "stock_actual": 200,
    "stock_minimo": 30,
    "unidad_medida": "kg",
    "precio_unitario": 3.50,
    "proveedor": "Frutas Frescas SA",
    "fecha_vencimiento": "2025-10-15"
  }
]
```

---

## 🔧 Configuración Avanzada de Thunder Client

### Variables de Entorno Dinámicas

1. **Pre-request Script para Login:**
```javascript
// Ejecutar antes del request de login
tc.setVar("login_timestamp", new Date().toISOString());
```

2. **Post-response Script para Login:**
```javascript
// Ejecutar después del response de login exitoso
const response = tc.response.json;
if (response.success && response.data.token) {
    tc.setVar("auth_token", response.data.token);
    tc.setVar("user_id", response.data.user.id);
    tc.setVar("user_role", response.data.user.rol);
}
```

3. **Headers Globales:**
```json
{
  "Content-Type": "application/json",
  "User-Agent": "Thunder Client API Tester"
}
```

---

## 📝 Notas Importantes

### ⚠️ Seguridad
- **Nunca uses tokens reales en repositorios públicos**
- **Los tokens JWT expiran según configuración del servidor**
- **Algunos endpoints requieren roles específicos**
- **Rate limiting está activo (100 requests/15min generalmente)**

### 🔄 WebSocket Testing
Para probar WebSocket (tiempo real):
1. Abre el dashboard en navegador: `http://localhost:3000/dashboard`
2. Ejecuta operaciones CRUD desde Thunder Client
3. Observa actualizaciones automáticas en el dashboard

### 📊 Monitoreo
- Usa `/health` para verificar estado del servidor
- Usa `/status` para ver métricas en tiempo real
- Los logs se escriben en `./logs/application-YYYY-MM-DD.log`

### 🐛 Debugging
- Revisa los logs del servidor para errores detallados
- Usa el endpoint `/health` para verificar conectividad de BD
- Verifica que las variables de entorno estén configuradas

---

## 🎯 Casos de Uso Completos

### Caso 1: Flujo Completo de Veterinario
1. **Login como veterinario**
2. **Ver lista de animales**
3. **Agregar nuevo animal**
4. **Actualizar estado de salud de un animal**
5. **Generar reporte de animales enfermos**

### Caso 2: Flujo Completo de Contador
1. **Login como contador**
2. **Ver estadísticas de alimentos**
3. **Agregar nuevo alimento**
4. **Verificar alimentos con stock bajo**
5. **Exportar reporte financiero a Excel**

### Caso 3: Flujo Completo de Admin
1. **Login como admin**
2. **Crear nuevo empleado**
3. **Ver dashboard completo**
4. **Exportar todos los reportes**
5. **Gestionar todos los recursos**

---

## 🚀 Performance Testing

### Pruebas de Carga Básicas
```bash
# En terminal separado, usar Artillery o similar
# Para instalar: npm install -g artillery

# artillery quick --count 10 --num 5 http://localhost:3000/health
```

### Monitoreo de Response Times
Verificar que los response times sean razonables:
- **Health/Status**: < 100ms
- **Login/Register**: < 500ms  
- **CRUD Operations**: < 300ms
- **Reports**: < 2000ms
- **Dashboard**: < 1000ms

---

**🦁 ¡Listo para probar la API de Jungle Planet Zoo Management System!**

*Esta guía te ayudará a probar todas las funcionalidades del sistema de manera sistemática y completa.*