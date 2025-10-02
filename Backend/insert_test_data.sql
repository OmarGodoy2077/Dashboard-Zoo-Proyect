-- Script para insertar datos de prueba en el sistema
-- Ejecutar en la consola SQL de Supabase

-- 1. Insertar empleados de prueba (si no existen)
INSERT INTO empleados (nombre, puesto, salario, fecha_contratacion, estado, email, telefono)
VALUES 
  ('Juan Pérez', 'Veterinario', 3500.00, '2023-01-15', 'activo', 'juan.veterinario@zoo.com', '555-0101'),
  ('María García', 'Cuidador de Animales', 2200.00, '2023-03-20', 'activo', 'maria.cuidador@zoo.com', '555-0102'),
  ('Carlos López', 'Personal de Limpieza', 1800.00, '2023-05-10', 'activo', 'carlos.limpieza@zoo.com', '555-0103'),
  ('Ana Martínez', 'Administradora', 3000.00, '2022-11-05', 'activo', 'ana.admin@zoo.com', '555-0104'),
  ('Luis Rodríguez', 'Veterinario', 3500.00, '2023-02-14', 'activo', 'luis.veterinario@zoo.com', '555-0105')
ON CONFLICT DO NOTHING;

-- 2. Insertar animales de prueba
INSERT INTO animales (nombre, especie, raza, fecha_nacimiento, habitat, estado_salud, peso, altura)
VALUES 
  ('Simba', 'León', 'León Africano', '2020-05-15', 'Sabana', 'sano', 190.5, 1.2),
  ('Luna', 'Elefante', 'Elefante Africano', '2018-08-20', 'Sabana', 'sano', 4500.0, 3.0),
  ('Rocky', 'Oso', 'Oso Pardo', '2019-03-10', 'Bosque', 'enfermo', 320.0, 2.1),
  ('Bella', 'Tigre', 'Tigre de Bengala', '2021-01-25', 'Selva', 'sano', 150.0, 1.0),
  ('Coco', 'Mono', 'Capuchino', '2022-06-12', 'Selva', 'sano', 4.5, 0.5),
  ('Max', 'Gorila', 'Gorila de Montaña', '2017-11-30', 'Selva', 'en_observacion', 180.0, 1.7)
ON CONFLICT DO NOTHING;

-- 3. Insertar alimentos de prueba
INSERT INTO alimentos (nombre, tipo, descripcion, stock_actual, stock_minimo, unidad_medida, costo_unitario)
VALUES 
  ('Carne Fresca', 'Proteína', 'Carne para carnívoros', 150, 50, 'kg', 8.50),
  ('Frutas Variadas', 'Frutas', 'Manzanas, plátanos, naranjas', 200, 80, 'kg', 3.20),
  ('Verduras Frescas', 'Vegetales', 'Lechuga, zanahoria, apio', 180, 70, 'kg', 2.50),
  ('Pescado', 'Proteína', 'Pescado fresco para osos', 40, 30, 'kg', 6.00),
  ('Heno', 'Forraje', 'Heno para herbívoros', 300, 100, 'kg', 1.50)
ON CONFLICT DO NOTHING;

-- 4. Insertar tratamientos activos
INSERT INTO tratamientos (animal_id, tipo_tratamiento, descripcion, veterinario, fecha_inicio, estado)
SELECT 
  a.id,
  'Antibiótico',
  'Tratamiento preventivo de infección respiratoria',
  'Dr. Juan Pérez',
  CURRENT_DATE - INTERVAL '3 days',
  'activo'
FROM animales a
WHERE a.nombre = 'Rocky'
ON CONFLICT DO NOTHING;

-- 5. Insertar entradas de visitantes (últimos 7 días)
INSERT INTO entradas (tipo_entrada, precio, cantidad, total_venta, fecha_venta, metodo_pago)
VALUES 
  ('Adulto', 15.00, 45, 675.00, CURRENT_DATE, 'efectivo'),
  ('Niño', 8.00, 30, 240.00, CURRENT_DATE, 'tarjeta'),
  ('Adulto', 15.00, 52, 780.00, CURRENT_DATE - INTERVAL '1 day', 'efectivo'),
  ('Niño', 8.00, 35, 280.00, CURRENT_DATE - INTERVAL '1 day', 'tarjeta'),
  ('Adulto', 15.00, 38, 570.00, CURRENT_DATE - INTERVAL '2 days', 'efectivo'),
  ('Adulto', 15.00, 60, 900.00, CURRENT_DATE - INTERVAL '3 days', 'tarjeta'),
  ('Niño', 8.00, 40, 320.00, CURRENT_DATE - INTERVAL '4 days', 'efectivo'),
  ('Adulto', 15.00, 55, 825.00, CURRENT_DATE - INTERVAL '5 days', 'tarjeta'),
  ('Adulto', 15.00, 42, 630.00, CURRENT_DATE - INTERVAL '6 days', 'efectivo')
ON CONFLICT DO NOTHING;

-- Verificar datos insertados
SELECT 'Empleados' as tabla, COUNT(*) as total FROM empleados
UNION ALL
SELECT 'Animales', COUNT(*) FROM animales
UNION ALL
SELECT 'Alimentos', COUNT(*) FROM alimentos
UNION ALL
SELECT 'Tratamientos activos', COUNT(*) FROM tratamientos WHERE estado = 'activo'
UNION ALL
SELECT 'Entradas (últimos 7 días)', COUNT(*) FROM entradas WHERE fecha_venta >= CURRENT_DATE - INTERVAL '7 days';
