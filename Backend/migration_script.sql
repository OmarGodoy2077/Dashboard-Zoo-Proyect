-- Script de Migración para Jungle Planet Zoo Management System
-- Este script aplica solo los cambios nuevos sin romper la estructura existente
-- Ejecutar en Supabase después del schema original

-- ==========================================
-- 1. MODIFICAR CAMPOS EXISTENTES (Solo si es necesario y seguro)
-- ==========================================

-- NOTA: Los cambios de VARCHAR se comentan porque pueden causar pérdida de datos
-- Solo descomenta si estás seguro de que los datos actuales caben en los nuevos tamaños

-- Reducir tamaño de campos VARCHAR (CUIDADO: Revisar datos existentes primero)
/*
ALTER TABLE animales ALTER COLUMN nombre TYPE VARCHAR(10);
ALTER TABLE animales ALTER COLUMN habitat TYPE VARCHAR(10);
ALTER TABLE limpiezas ALTER COLUMN area TYPE VARCHAR(10);
ALTER TABLE productos ALTER COLUMN nombre TYPE VARCHAR(10);
ALTER TABLE promociones ALTER COLUMN nombre TYPE VARCHAR(10);
*/

-- ==========================================
-- 2. CREAR NUEVAS TABLAS
-- ==========================================

-- Nueva tabla: tareas_limpieza (módulo de limpieza extendido)
CREATE TABLE IF NOT EXISTS tareas_limpieza (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area VARCHAR(100) NOT NULL, -- valores: 'jaulas', 'sanitarios', 'jardines', 'area_juegos', 'oficinas'
    encargado_id INTEGER REFERENCES empleados(id), -- Cambiado a INTEGER para coincidir con empleados existentes
    frecuencia VARCHAR(20) CHECK (frecuencia IN ('diaria', 'semanal', 'quincenal', 'mensual')),
    ultima_fecha DATE,
    proxima_fecha DATE,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_progreso', 'completada')) DEFAULT 'pendiente',
    notas TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: vacaciones (módulo de RRHH)
CREATE TABLE IF NOT EXISTS vacaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id INTEGER NOT NULL REFERENCES empleados(id), -- Cambiado a INTEGER para coincidir con empleados existentes
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('solicitada', 'aprobada', 'rechazada', 'cancelada')) DEFAULT 'solicitada',
    comentarios TEXT,
    aprobado_por INTEGER REFERENCES empleados(id), -- Cambiado a INTEGER para coincidir con empleados existentes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: inasistencias (módulo de RRHH)
CREATE TABLE IF NOT EXISTS inasistencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id INTEGER NOT NULL REFERENCES empleados(id), -- Cambiado a INTEGER para coincidir con empleados existentes
    fecha DATE NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('justificada', 'injustificada', 'permiso', 'enfermedad')),
    motivo TEXT,
    evidencia_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: descuentos (módulo de RRHH)
CREATE TABLE IF NOT EXISTS descuentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id INTEGER NOT NULL REFERENCES empleados(id), -- Cambiado a INTEGER para coincidir con empleados existentes
    concepto VARCHAR(100),
    monto DECIMAL(8,2),
    fecha_aplicacion DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('falta', 'anticipo', 'otro')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: bonos (módulo de RRHH)
CREATE TABLE IF NOT EXISTS bonos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id INTEGER NOT NULL REFERENCES empleados(id), -- Cambiado a INTEGER para coincidir con empleados existentes
    concepto VARCHAR(100),
    monto DECIMAL(8,2),
    fecha_otorgamiento DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('productividad', 'cumpleaños', 'extraordinario')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. CREAR NUEVOS ÍNDICES
-- ==========================================

-- Índices para nuevas tablas de limpieza y RRHH
CREATE INDEX IF NOT EXISTS idx_tareas_limpieza_area ON tareas_limpieza(area);
CREATE INDEX IF NOT EXISTS idx_tareas_limpieza_encargado ON tareas_limpieza(encargado_id);
CREATE INDEX IF NOT EXISTS idx_tareas_limpieza_estado ON tareas_limpieza(estado);
CREATE INDEX IF NOT EXISTS idx_vacaciones_empleado ON vacaciones(empleado_id);
CREATE INDEX IF NOT EXISTS idx_vacaciones_estado ON vacaciones(estado);
CREATE INDEX IF NOT EXISTS idx_inasistencias_empleado ON inasistencias(empleado_id);
CREATE INDEX IF NOT EXISTS idx_inasistencias_fecha ON inasistencias(fecha);
CREATE INDEX IF NOT EXISTS idx_descuentos_empleado ON descuentos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_bonos_empleado ON bonos(empleado_id);
CREATE INDEX IF NOT EXISTS idx_bonos_fecha ON bonos(fecha_otorgamiento);

-- ==========================================
-- 4. ACTUALIZAR FUNCIÓN DE TRIGGER (CORRECCIÓN)
-- ==========================================

-- Corregir la función de actualización de fecha (con punto en lugar de espacio)
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- También crear función para updated_at de las nuevas tablas
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==========================================
-- 5. CREAR NUEVOS TRIGGERS
-- ==========================================

-- Disparadores para nuevas tablas de limpieza y RRHH
CREATE TRIGGER actualizar_tareas_limpieza_fecha 
    BEFORE UPDATE ON tareas_limpieza 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER actualizar_vacaciones_fecha 
    BEFORE UPDATE ON vacaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_updated_at();

-- ==========================================
-- 6. VERIFICACIÓN Y COMENTARIOS FINALES
-- ==========================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tareas_limpieza') THEN
        RAISE NOTICE 'Tabla tareas_limpieza creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vacaciones') THEN
        RAISE NOTICE 'Tabla vacaciones creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inasistencias') THEN
        RAISE NOTICE 'Tabla inasistencias creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'descuentos') THEN
        RAISE NOTICE 'Tabla descuentos creada exitosamente';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bonos') THEN
        RAISE NOTICE 'Tabla bonos creada exitosamente';
    END IF;
END $$;

-- ==========================================
-- COMENTARIOS IMPORTANTES PARA EL DESARROLLADOR:
-- ==========================================

/*
NOTAS IMPORTANTES:

1. CAMPOS MODIFICADOS:
   - Los cambios de tamaño de VARCHAR están comentados por seguridad
   - Si necesitas aplicarlos, primero verifica que los datos existentes caben en los nuevos tamaños
   - Ejecuta: SELECT max(length(nombre)) FROM animales; (por ejemplo) antes de cambiar

2. REFERENCIAS CORREGIDAS:
   - Cambié UUID a INTEGER en las referencias a empleados(id) para coincidir con la estructura original
   - Si en el futuro cambias empleados.id a UUID, necesitarás actualizar estas referencias

3. NUEVAS FUNCIONALIDADES AÑADIDAS:
   - Módulo de limpieza extendido con tareas_limpieza
   - Módulo de RRHH completo con vacaciones, inasistencias, descuentos y bonos
   - Índices optimizados para las nuevas tablas
   - Triggers para actualización automática de fechas

4. EJECUCIÓN SEGURA:
   - Usa IF NOT EXISTS para evitar errores si ya existen las tablas
   - Todas las operaciones son aditivas, no destructivas
   - Mantiene la integridad referencial con la estructura original

5. PRÓXIMOS PASOS:
   - Después de ejecutar este script, actualiza tu aplicación para usar las nuevas tablas
   - Considera migrar datos existentes si es necesario
   - Actualiza la documentación de la API con los nuevos endpoints
*/