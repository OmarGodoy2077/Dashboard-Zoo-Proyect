-- Script para corregir el tipo de dato de encargado_id en tareas_limpieza
-- Este script debe ejecutarse en la consola SQL de Supabase

-- Paso 1: Eliminar la restricción de foreign key actual
ALTER TABLE tareas_limpieza 
DROP CONSTRAINT IF EXISTS tareas_limpieza_encargado_id_fkey;

-- Paso 2: Cambiar el tipo de dato de encargado_id de UUID a INTEGER
ALTER TABLE tareas_limpieza 
ALTER COLUMN encargado_id TYPE INTEGER USING NULL;

-- Paso 3: Recrear la foreign key constraint
ALTER TABLE tareas_limpieza 
ADD CONSTRAINT tareas_limpieza_encargado_id_fkey 
FOREIGN KEY (encargado_id) REFERENCES empleados(id) ON DELETE SET NULL;

-- Verificar los cambios
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tareas_limpieza' AND column_name = 'encargado_id';
