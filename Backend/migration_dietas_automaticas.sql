-- Migración para agregar campos de control de ejecución a horarios_alimentacion
-- Fecha: 2025-10-03

-- Agregar campos para controlar las ejecuciones automáticas
ALTER TABLE horarios_alimentacion
ADD COLUMN IF NOT EXISTS ultima_ejecucion TIMESTAMP,
ADD COLUMN IF NOT EXISTS proxima_ejecucion TIMESTAMP;

-- Actualizar la próxima ejecución para horarios activos existentes
-- Para horarios diarios, la próxima ejecución es hoy a la hora especificada
UPDATE horarios_alimentacion
SET proxima_ejecucion = CASE
    WHEN frecuencia = 'diario' THEN
        CASE
            WHEN hora > CURRENT_TIME THEN CURRENT_DATE + hora
            ELSE CURRENT_DATE + INTERVAL '1 day' + hora
        END
    WHEN frecuencia = 'semanal' THEN CURRENT_DATE + INTERVAL '7 days' + hora
    WHEN frecuencia = 'cada_dos_dias' THEN CURRENT_DATE + INTERVAL '2 days' + hora
    WHEN frecuencia = 'cada_tres_dias' THEN CURRENT_DATE + INTERVAL '3 days' + hora
    ELSE CURRENT_DATE + hora
END
WHERE activo = TRUE AND proxima_ejecucion IS NULL;

-- Crear índice para optimizar las consultas de ejecución
CREATE INDEX IF NOT EXISTS idx_horarios_ejecucion ON horarios_alimentacion(proxima_ejecucion) WHERE activo = TRUE;