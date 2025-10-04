-- Migración para agregar campos de control de ejecución a horarios_alimentacion
-- Fecha: 2025-10-03

-- Agregar campos para controlar las ejecuciones automáticas
ALTER TABLE horarios_alimentacion
ADD COLUMN IF NOT EXISTS ultima_ejecucion TIMESTAMP,
ADD COLUMN IF NOT EXISTS proxima_ejecucion TIMESTAMP;

-- Actualizar la próxima ejecución para horarios activos existentes
-- Para horarios diarios, la próxima ejecución es hoy a la hora especificada (hora está en zona horaria de Guatemala GMT-6)
-- Convertir hora de Guatemala a UTC agregando 6 horas
UPDATE horarios_alimentacion
SET proxima_ejecucion = CASE
    WHEN frecuencia = 'diario' THEN
        CASE
            WHEN (hora + INTERVAL '6 hours') > CURRENT_TIME THEN CURRENT_DATE + (hora + INTERVAL '6 hours')
            ELSE CURRENT_DATE + INTERVAL '1 day' + (hora + INTERVAL '6 hours')
        END
    WHEN frecuencia = 'semanal' THEN CURRENT_DATE + INTERVAL '7 days' + (hora + INTERVAL '6 hours')
    WHEN frecuencia = 'cada_dos_dias' THEN CURRENT_DATE + INTERVAL '2 days' + (hora + INTERVAL '6 hours')
    WHEN frecuencia = 'cada_tres_dias' THEN CURRENT_DATE + INTERVAL '3 days' + (hora + INTERVAL '6 hours')
    ELSE CURRENT_DATE + (hora + INTERVAL '6 hours')
END
WHERE activo = TRUE AND proxima_ejecucion IS NULL;

-- Corregir proxima_ejecucion existentes que puedan estar incorrectas
-- Recalcular para todos los horarios activos
UPDATE horarios_alimentacion
SET proxima_ejecucion = CASE
    WHEN frecuencia = 'diario' THEN
        CASE
            WHEN (hora + INTERVAL '6 hours') > CURRENT_TIME THEN CURRENT_DATE + (hora + INTERVAL '6 hours')
            ELSE CURRENT_DATE + INTERVAL '1 day' + (hora + INTERVAL '6 hours')
        END
    WHEN frecuencia = 'semanal' THEN CURRENT_DATE + INTERVAL '7 days' + (hora + INTERVAL '6 hours')
    WHEN frecuencia = 'cada_dos_dias' THEN CURRENT_DATE + INTERVAL '2 days' + (hora + INTERVAL '6 hours')
    WHEN frecuencia = 'cada_tres_dias' THEN CURRENT_DATE + INTERVAL '3 days' + (hora + INTERVAL '6 hours')
    ELSE CURRENT_DATE + (hora + INTERVAL '6 hours')
END
WHERE activo = TRUE;

-- Crear índice para optimizar las consultas de ejecución
CREATE INDEX IF NOT EXISTS idx_horarios_ejecucion ON horarios_alimentacion(proxima_ejecucion) WHERE activo = TRUE;