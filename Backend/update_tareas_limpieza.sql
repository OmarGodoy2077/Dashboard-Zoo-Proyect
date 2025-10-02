-- Cambios en tareas_limpieza para agregar hora y historial
-- Cambiar proxima_fecha a TIMESTAMP para incluir hora
ALTER TABLE tareas_limpieza ALTER COLUMN proxima_fecha TYPE TIMESTAMP;

-- Agregar columna para hora específica si es necesario, pero como es TIMESTAMP, incluye hora
-- Agregar columna estado_vencido o algo, pero mejor manejar en lógica

-- Crear tabla para historial de tareas
CREATE TABLE IF NOT EXISTS historial_tareas_limpieza (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tarea_id UUID REFERENCES tareas_limpieza(id) ON DELETE CASCADE,
    estado_anterior VARCHAR(20),
    estado_nuevo VARCHAR(20),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

-- Insertar en historial cuando cambia estado (esto se haría en el service)