# Jungle Planet Zoo - Sistema de Gestión del Zoológico

## ¿Qué es Jungle Planet Zoo?

Jungle Planet Zoo es una aplicación web diseñada para facilitar la administración y gestión diaria de un zoológico. Permite a los empleados y administradores controlar diferentes aspectos del zoológico de manera eficiente y organizada.

## ¿Para qué sirve?

El sistema permite gestionar:

- **Animales**: Registrar, actualizar y monitorear información sobre cada animal
- **Alimentos**: Controlar los tipos de alimentos y su distribución
- **Personal**: Administrar empleados y sus responsabilidades
- **Tareas de limpieza**: Programar y supervisar la limpieza de habitats
- **Visitantes**: Monitorear el número de visitantes y la venta de entradas
- **Salud animal**: Registrar alertas médicas y controlar la salud de los animales
- **Recursos Humanos**: Administrar información del personal
- **Reportes**: Generar informes sobre diferentes aspectos del zoológico

## Características Principales

### Panel Principal (Dashboard)
- Vista general del zoológico con estadísticas clave
- Gráficos y visualizaciones de datos importantes
- Información en tiempo real sobre visitantes, animales, empleados y alertas médicas
- Acceso rápido a las secciones más importantes

### Gestión de Animales
- Registro de nuevos animales con información detallada
- Seguimiento de salud y alertas médicas
- Control de dietas y necesidades especiales
- Historial médico y cuidados

### Gestión de Alimentos
- Catálogo de diferentes tipos de alimentos
- Control de inventario
- Asignación de alimentos a diferentes especies
- Registro de cantidades y frecuencias de alimentación

### Gestión de Personal
- Registro y perfil de empleados
- Asignación de responsabilidades
- Control de horarios
- Acceso diferenciado según roles

### Control de Tareas de Limpieza
- Programación de tareas de limpieza
- Asignación a empleados responsables
- Seguimiento de cumplimiento
- Alertas de tareas pendientes

### Control de Visitantes
- Registro de entradas vendidas
- Estadísticas de visitantes
- Informes sobre afluencia

### Alertas Médicas
- Registro de animales enfermos o con problemas de salud
- Priorización de casos
- Seguimiento de tratamientos
- Notificaciones importantes

## ¿Cómo funciona desde el punto de vista del usuario?

### Inicio de Sesión
1. Los usuarios acceden al sistema con su correo electrónico y contraseña
2. Una vez autenticados, pueden acceder al panel principal

### Navegación
1. El menú lateral permite acceder a diferentes secciones
2. Cada sección contiene formularios, listas y herramientas específicas
3. El sistema es intuitivo y fácil de usar

### Funcionalidades Comunes
- **Listar**: Ver todos los registros de una categoría (animales, empleados, etc.)
- **Agregar**: Crear nuevos registros
- **Editar**: Actualizar información existente
- **Eliminar**: Remover registros (cuando sea seguro hacerlo)
- **Buscar**: Encontrar registros específicos
- **Filtrar**: Ver registros según criterios específicos

## Estructura del Sistema (Descripción para Análisis UML)

### Actores del Sistema
- **Administrador**: Usuario con permisos completos para gestionar todo el sistema
- **Empleado de Zoológico**: Personal encargado de tareas específicas (cuidadores, limpieza, etc.)
- **Veterinario**: Usuario especializado en atención médica de animales
- **Gerente**: Usuario con acceso a reportes y estadísticas

### Módulos del Sistema
1. **Módulo de Autenticación**
   - Inicio de sesión
   - Cierre de sesión
   - Registro de nuevos usuarios
   - Control de roles y permisos

2. **Módulo de Dashboard**
   - Visualización de estadísticas
   - Gráficos y reportes en tiempo real
   - Resumen de actividades del día

3. **Módulo de Animales**
   - Registro y mantenimiento de información de animales
   - Monitoreo de salud
   - Control de dietas

4. **Módulo de Alimentos**
   - Gestión de inventario de alimentos
   - Asignación de alimentos a animales
   - Control de caducidad y calidad

5. **Módulo de Personal**
   - Registro de empleados
   - Asignación de roles y responsabilidades
   - Control de horarios

6. **Módulo de Limpieza**
   - Programación de tareas
   - Asignación de responsables
   - Seguimiento de cumplimiento

7. **Módulo de Visitantes**
   - Control de entradas
   - Estadísticas de afluencia
   - Informes de visitantes

8. **Módulo de Alertas Médicas**
   - Registro de alertas
   - Priorización de casos
   - Seguimiento de tratamientos

9. **Módulo de Reportes**
   - Generación de informes
   - Exportación de datos
   - Análisis comparativo

### Diagramas UML Relevantes
- **Diagrama de Casos de Uso**: Mostrará las interacciones entre los actores y las funcionalidades del sistema
- **Diagrama de Clases**: Representará las clases principales como Animal, Empleado, Alimento, etc.
- **Diagrama de Secuencia**: Ilustrará el flujo de procesos como el registro de animales o la creación de alertas médicas
- **Diagrama de Actividades**: Mostrará flujos de trabajo como el proceso de alimentación o limpieza

## Beneficios del Sistema

1. **Organización**: Centraliza toda la información del zoológico en una sola plataforma
2. **Eficiencia**: Automatiza procesos y reduce tareas repetitivas
3. **Accesibilidad**: Permite acceso a la información desde cualquier lugar con conexión
4. **Seguimiento**: Mantiene registros históricos para análisis y toma de decisiones
5. **Seguridad**: Control de acceso basado en roles y permisos
6. **Colaboración**: Permite a diferentes empleados colaborar en la gestión del zoológico
7. **Transparencia**: Facilita la supervisión de actividades y responsabilidades

## Tipos de Información que se Gestiona

1. **Información de Animales**:
   - Nombre, especie, edad, sexo
   - Historial médico
   - Dieta y necesidades especiales

2. **Información de Empleados**:
   - Datos personales
   - Rol y responsabilidades
   - Horarios de trabajo

3. **Información de Alimentos**:
   - Tipo y cantidad de alimentos
   - Fecha de caducidad
   - Proveedores

4. **Información de Tareas**:
   - Limpieza de habitats
   - Alimentación
   - Revisiones médicas

5. **Información de Visitantes**:
   - Número de entradas vendidas
   - Estadísticas de afluencia
   - Comentarios

Este sistema permite una administración más efectiva del zoológico, mejorando la calidad de vida de los animales y la eficiencia operativa del personal.