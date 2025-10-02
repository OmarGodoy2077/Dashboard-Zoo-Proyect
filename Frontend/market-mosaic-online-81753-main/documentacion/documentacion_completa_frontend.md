# Documentación Completa del Frontend - Jungle Planet Zoo

## Índice

1. [Descripción General del Proyecto](#descripción-general-del-proyecto)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Sistema de Enrutamiento](#sistema-de-enrutamiento)
5. [Gestión de Estado y Autenticación](#gestión-de-estado-y-autenticación)
6. [Componentes de la Interfaz de Usuario](#componentes-de-la-interfaz-de-usuario)
7. [Configuración y Variables de Entorno](#configuración-y-variables-de-entorno)
8. [API y Comunicación con el Backend](#api-y-comunicación-con-el-backend)
9. [Sistema de Estilos y Diseño](#sistema-de-estilos-y-diseño)
10. [Características Especiales](#características-especiales)

## Descripción General del Proyecto

El proyecto Jungle Planet Zoo es una aplicación web desarrollada para la gestión integral de un zoológico. Incluye funcionalidades para el manejo de animales, empleados, alimentos, tareas de limpieza, control de visitantes, alertas médicas, y reportes. La aplicación proporciona una interfaz de usuario moderna y funcionalidades en tiempo real para la administración del zoo.

## Tecnologías Utilizadas

### Principales

- **React 18**: Biblioteca JavaScript para construir interfaces de usuario
- **TypeScript**: Superconjunto de JavaScript que agrega tipado estático
- **Vite**: Herramienta de construcción que proporciona un desarrollo rápido con recarga instantánea
- **Tailwind CSS**: Framework CSS de utilidades para diseño rápido
- **shadcn/ui**: Biblioteca de componentes React accesibles y personalizables
- **Radix UI Primitives**: Componentes primitivos sin estilo para construir interfaces de usuario

### Dependencias Clave

- **React Router DOM**: Para la navegación y enrutamiento dentro de la aplicación
- **React Hook Form**: Para la gestión de formularios
- **Zod**: Para validación de esquemas
- **Chart.js + React Chart.js 2**: Para la visualización de datos en gráficos
- **Recharts**: Otra biblioteca para gráficos y visualización de datos
- **Lucide React**: Conjunto de iconos livianos
- **TanStack Query (antes React Query)**: Para la gestión del estado del servidor
- **Socket.io-client**: Para comunicación en tiempo real con el backend
- **Class-variance-authority**: Para la gestión de variantes de clase
- **Date-fns**: Para manipulación de fechas

### Herramientas de Desarrollo

- **ESLint**: Para la identificación y corrección de patrones problemáticos
- **TypeScript ESLint**: Integración de ESLint con TypeScript
- **Autoprefixer**: Para la compatibilidad con navegadores antiguos

## Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes de UI (shadcn/ui)
│   ├── layout/          # Componentes de layout
│   └── ...              # Otros componentes específicos
├── pages/               # Componentes de página
├── hooks/               # Hooks personalizados
├── lib/                 # Utilidades y bibliotecas auxiliares
├── utils/               # Funciones de utilidad
├── config/              # Configuraciones
├── types/               # Definiciones de tipos TypeScript
└── assets/              # Recursos estáticos
```

### Desglose de la Estructura

#### `/components/ui`
Contiene componentes UI reutilizables basados en shadcn/ui y Radix UI:
- `button.tsx` - Componente de botón con variantes y tamaños
- `card.tsx` - Componente de tarjeta para contenido estructurado
- `input.tsx` - Campo de entrada estilizado
- `label.tsx` - Etiqueta para campos de formulario
- `avatar.tsx` - Componente para mostrar imágenes de perfil
- `dropdown-menu.tsx` - Menú desplegable estilizado
- `table.tsx` - Componentes para tablas
- `chart.tsx` - Componentes para gráficos
- Y muchos otros componentes UI

#### `/pages`
Contiene los componentes de página principales de la aplicación:
- `Dashboard.tsx` - Panel principal con estadísticas y gráficos
- `Login.tsx` y `Register.tsx` - Formularios de autenticación
- `Animales.tsx` - Gestión de animales
- `Alimentos.tsx` - Gestión de alimentos
- `Limpieza.tsx` - Gestión de tareas de limpieza
- `Empleados.tsx` - Gestión de empleados
- `AlertasMedicas.tsx` - Gestión de alertas médicas
- `Reportes.tsx` - Generación de reportes
- `Settings.tsx` - Configuración de usuario
- `Profile.tsx` - Perfil de usuario

#### `/hooks`
Contiene hooks personalizados:
- `use-toast.ts` - Hook para mostrar notificaciones/toasts

#### `/utils`
Funciones de utilidad:
- `auth.ts` - Funciones relacionadas con la autenticación

#### `/config`
Configuración de la aplicación:
- `api.ts` - URLs base para la API y WebSocket

#### `/lib`
Bibliotecas auxiliares:
- `utils.ts` - Función `cn` para combinar clases de Tailwind

## Sistema de Enrutamiento

La aplicación utiliza React Router DOM para la navegación entre páginas. El sistema de enrutamiento está definido en `App.tsx`:

- Rutas públicas: `/login`, `/register`
- Rutas protegidas: Todas las demás rutas requieren autenticación
- Componente `ProtectedRoute` que verifica si el usuario está autenticado
- Componente `AppLayout` que proporciona el layout común con el sidebar

Las rutas protegidas incluyen:
- `/dashboard` - Panel principal
- `/animales` - Gestión de animales  
- `/alimentos` - Gestión de alimentos
- `/limpieza` - Gestión de tareas de limpieza
- `/entradas` - Control de visitantes
- `/empleados` - Gestión de empleados
- `/alertas-medicas` - Alertas médicas
- `/rrhh` - Recursos humanos
- `/reportes` - Reportes
- `/profile` - Perfil de usuario
- `/settings` - Configuración

## Gestión de Estado y Autenticación

### Sistema de Autenticación

La autenticación se gestiona a través de tokens JWT almacenados en localStorage:

#### Archivo `utils/auth.ts`:
- `getToken()`: Obtiene y verifica la validez del token
- `setToken(token)`: Guarda el token en localStorage
- `removeToken()`: Elimina el token de localStorage
- `isAuthenticated()`: Verifica si el usuario está autenticado
- `getUserRole()`: Obtiene el rol del usuario del token

#### Flujos de Autenticación:
- Login: `/login` → obtención de token del backend → almacenamiento → redirección a `/dashboard`
- Registro: `/register` → creación de cuenta → login automático
- Logout: Eliminación del token → limpieza de datos de usuario → redirección a `/login`
- Protección de rutas: Verificación de token antes de acceder a rutas protegidas

### Gestión de Estado

La aplicación utiliza el estado local de React para la mayoría de la gestión de datos, complementado con:

- Context API para estados globales (aunque no se evidencia un uso extensivo en el código mostrado)
- TanStack Query para la gestión del estado del servidor
- useState y useEffect para la gestión local de estado

### Comunicación en Tiempo Real

La aplicación utiliza Socket.io-client para recibir actualizaciones en tiempo real:
- Actualizaciones del dashboard
- Cambios en los datos de los gráficos
- Notificaciones

## Componentes de la Interfaz de Usuario

### Componentes de UI Principales

#### Card Component
Componentes para mostrar contenido estructurado:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>Contenido principal</CardContent>
  <CardFooter>Pie de página</CardFooter>
</Card>
```

#### Button Component
Botones con diferentes variantes y tamaños:
- Variantes: default, destructive, outline, secondary, ghost, link
- Tamaños: default, sm, lg, icon
- Soporte para iconos y estados de carga

#### Form Components
Componentes para formularios:
- Input: Campo de entrada estilizado
- Label: Etiqueta para campos de formulario
- Form: Integración con React Hook Form y Zod para validación

#### Navigation Components
- SideNav: Barra de navegación lateral
- DropdownMenu: Menú desplegable para el menú de usuario

#### Data Display Components
- Table: Componentes para tablas de datos
- Avatar: Imágenes de perfil con inicial como fallback
- Badge: Etiquetas con diferentes estilos

### Componentes de Gráficos
La aplicación incluye soporte para gráficos:
- Bar charts (React Chart.js 2)
- Pie charts (React Chart.js 2)
- Recharts para visualizaciones más avanzadas

## Configuración y Variables de Entorno

### Archivo `.env`
- `VITE_API_URL`: URL base para la API (por defecto http://localhost:3000)

### Archivo `vite.config.ts`
Configuración de Vite:
- Puerto: 5173
- Alias: `@` para `./src`
- Plugins: React SWC, componentTagger en desarrollo

### Archivo `tsconfig.json`
Configuración de TypeScript:
- Base URL: `./`
- Paths: `@/*` → `./src/*`
- Opciones de compilación ajustadas para compatibilidad

### Archivo `tailwind.config.ts`
Configuración de Tailwind CSS:
- Tema extendido con colores y estilos personalizados
- Configuración de breakpoints
- Animaciones personalizadas
- Soporte para modo oscuro

## API y Comunicación con el Backend

### Configuración
- API base URL: Configurada en `config/api.ts`
- WebSocket base URL: Misma que la API
- Uso de `VITE_API_URL` del entorno

### Tipos de Comunicación
1. **API RESTful**: Para operaciones CRUD
2. **WebSocket**: Para actualizaciones en tiempo real

### Gestión de Solicitudes
- Uso de `fetch` para solicitudes HTTP
- Manejo de tokens JWT en encabezados de autorización
- Manejo de errores y estados de carga
- Validación de respuesta del servidor

### Ejemplo de llamada API
```tsx
const response = await fetch(`${API_BASE_URL}/api/dashboard/data`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Sistema de Estilos y Diseño

### Tailwind CSS
- Configuración personalizada en `tailwind.config.ts`
- Tema con colores semánticos (primary, secondary, destructive, etc.)
- Soporte para modo oscuro usando `[class='theme']`
- Utilidades de espaciado, tipografía y responsive design

### shadcn/ui
- Componentes UI estilizados consistentemente
- Sistema de tokens de diseño
- Accesibilidad integrada
- Tema personalizable

### Tipografía
- Fuente principal: 'Inter var' (variable font)
- Tipografía escalable y legible
- Tamaños y pesos tipográficos consistentes

### Animaciones
- Transiciones suaves para interacciones
- Animaciones personalizadas definidas en Tailwind:
  - `accordion-down/up`
  - `fade-in/out`
  - `slide-up/down`
  - `pulse-gentle`
  - `float`

### Diseño Responsivo
- Uso de utilidades de Tailwind para diferentes breakpoints
- Columnas adaptables (grid)
- Componentes que se adaptan a diferentes tamaños de pantalla
- Sidebar que se oculta en dispositivos móviles

## Características Especiales

### Dashboard en Tiempo Real
- Actualizaciones en vivo de estadísticas
- Gráficos actualizados en tiempo real
- Integración con WebSocket
- Manejo de errores y fallbacks

### Sistema de Toasts
- Notificaciones elegantes y accesibles
- Diferentes variantes (default, destructive, etc.)
- Soporte para acciones

### Enrutamiento Protegido
- Autenticación basada en tokens
- Verificación de expiración de tokens
- Redirección automática para usuarios no autenticados

### Diseño Adaptado para Zoológico
- Funcionalidades específicas para la gestión del zoo:
  - Gestión de animales
  - Control de alimentos
  - Tareas de limpieza
  - Alertas médicas
  - Control de visitantes
  - Recursos humanos
  - Reportes

### Sistema de Roles
- Implementación de sistema de roles de usuario
- Control de acceso basado en roles
- Diferentes vistas y funcionalidades según el rol

### Experiencia de Usuario
- Carga de datos con estados de "loading"
- Manejo de errores elegante
- Transiciones suaves
- Feedback visual para interacciones
- Navegación intuitiva