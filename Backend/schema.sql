-- Schema SQL para Jungle Planet Zoo Management System

-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'empleado', -- admin, empleado, veterinario, contador
    contraseña_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de empleados
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    salario DECIMAL(10, 2) NOT NULL,
    fecha_contratacion DATE NOT NULL,
    fecha_nacimiento DATE,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    vacaciones_disponibles INTEGER DEFAULT 0,
    inasistencias INTEGER DEFAULT 0,
    suspensiones INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo', -- activo, suspendido, inactivo
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de animales
CREATE TABLE animales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL,
    especie VARCHAR(100) NOT NULL,
    habitat VARCHAR(10),
    dieta TEXT,
    estado_salud VARCHAR(50) DEFAULT 'sano', -- sano, enfermo, en tratamiento
    veterinario_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    fecha_nacimiento DATE,
    sexo VARCHAR(10) CHECK (sexo IN ('macho', 'hembra', 'desconocido')),
    peso DECIMAL(8, 2),
    altura DECIMAL(6, 2),
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de proveedores
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    contacto VARCHAR(10),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    estado VARCHAR(20) DEFAULT 'activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alimentos
CREATE TABLE alimentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- carnivoro, herbivoro, omnivoro, suplemento, etc.
    descripcion TEXT,
    unidad_medida VARCHAR(20) NOT NULL, -- kg, g, litros, unidades
    stock_actual DECIMAL(10, 2) DEFAULT 0,
    stock_minimo DECIMAL(10, 2) DEFAULT 0,
    proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
    precio_unitario DECIMAL(10, 2),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de horarios de alimentación
CREATE TABLE horarios_alimentacion (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    alimento_id INTEGER NOT NULL REFERENCES alimentos(id) ON DELETE CASCADE,
    hora TIME NOT NULL,
    frecuencia VARCHAR(20) NOT NULL, -- diario, semanal, cada_dos_dias, etc.
    cantidad DECIMAL(8, 2) NOT NULL,
    observaciones TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de limpiezas
CREATE TYPE area_tipo AS ENUM ('jaula', 'sanitario', 'jardin', 'area_juego', 'oficina', 'otros');

CREATE TABLE limpiezas (
    id SERIAL PRIMARY KEY,
    area VARCHAR(10) NOT NULL,
    tipo_area area_tipo NOT NULL,
    responsable_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    fecha_programada DATE NOT NULL,
    fecha_ejecucion DATE,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, en_progreso, completado, cancelado
    notas TEXT,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: tareas_limpieza (módulo de limpieza extendido)
CREATE TABLE tareas_limpieza (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area VARCHAR(100) NOT NULL, -- valores: 'jaulas', 'sanitarios', 'jardines', 'area_juegos', 'oficinas'
    encargado_id UUID REFERENCES empleados(id),
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
CREATE TABLE vacaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('solicitada', 'aprobada', 'rechazada', 'cancelada')) DEFAULT 'solicitada',
    comentarios TEXT,
    aprobado_por UUID REFERENCES empleados(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: inasistencias (módulo de RRHH)
CREATE TABLE inasistencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    fecha DATE NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('justificada', 'injustificada', 'permiso', 'enfermedad')),
    motivo TEXT,
    evidencia_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: descuentos (módulo de RRHH)
CREATE TABLE descuentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    concepto VARCHAR(100),
    monto DECIMAL(8,2),
    fecha_aplicacion DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('falta', 'anticipo', 'otro')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nueva tabla: bonos (módulo de RRHH)
CREATE TABLE bonos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    concepto VARCHAR(100),
    monto DECIMAL(8,2),
    fecha_otorgamiento DATE,
    tipo VARCHAR(20) CHECK (tipo IN ('productividad', 'cumpleaños', 'extraordinario')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de medicamentos
CREATE TABLE medicamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- medicamento, vacuna, vitamina
    descripcion TEXT,
    forma_farmaceutica VARCHAR(50), -- inyeccion, pastilla, jarabe, etc.
    via_administracion VARCHAR(50), -- oral, intramuscular, etc.
    concentracion VARCHAR(50),
    stock_actual DECIMAL(10, 2) DEFAULT 0,
    stock_minimo DECIMAL(10, 2) DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tratamientos clínicos
CREATE TABLE tratamientos (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animales(id) ON DELETE CASCADE,
    medicamento_id INTEGER REFERENCES medicamentos(id) ON DELETE SET NULL,
    veterinario_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    diagnostico TEXT,
    tratamiento TEXT,
    dosis VARCHAR(50),
    frecuencia VARCHAR(50),
    duracion_dias INTEGER,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'activo', -- activo, completado, suspendido
    notas TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos/insumos para inventario
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- limpieza, oficina, mantenimiento, etc.
    descripcion TEXT,
    unidad_medida VARCHAR(20) NOT NULL,
    stock_actual DECIMAL(10, 2) DEFAULT 0,
    stock_minimo DECIMAL(10, 2) DEFAULT 0,
    proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
    precio_unitario DECIMAL(10, 2),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de movimientos de inventario
CREATE TYPE tipo_movimiento AS ENUM ('entrada', 'salida');

CREATE TABLE movimientos_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tipo_movimiento tipo_movimiento NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    responsable_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    descripcion TEXT,
    fecha_movimiento DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de nóminas
CREATE TABLE nominas (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    periodo_mes INTEGER NOT NULL, -- 1-12
    periodo_anio INTEGER NOT NULL, -- año
    sueldo_base DECIMAL(10, 2) NOT NULL,
    bonos DECIMAL(10, 2) DEFAULT 0,
    descuentos DECIMAL(10, 2) DEFAULT 0,
    total_neto DECIMAL(10, 2) NOT NULL,
    estado_pago VARCHAR(20) DEFAULT 'pendiente', -- pendiente, pagado, retrasado
    fecha_pago DATE,
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de entradas
CREATE TABLE entradas (
    id SERIAL PRIMARY KEY,
    fecha_venta DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo_ticket VARCHAR(50) NOT NULL, -- adulto, niño, adulto_mayor, grupo, etc.
    precio_unitario DECIMAL(8, 2) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1,
    total_venta DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(30) DEFAULT 'efectivo', -- efectivo, tarjeta, transferencia
    vendedor_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de promociones
CREATE TABLE promociones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(10) NOT NULL,
    descripcion TEXT,
    tipo_descuento VARCHAR(20) NOT NULL, -- porcentaje, monto_fijo
    valor_descuento DECIMAL(5, 2) NOT NULL, -- porcentaje o monto
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    condiciones TEXT, -- condiciones específicas de la promoción
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de asistencia de empleados
CREATE TABLE asistencia (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    estado VARCHAR(20) DEFAULT 'trabajando', -- trabajando, ausente, vacaciones, permiso
    observaciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización

-- Índices en tablas principales
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_animales_especie ON animales(especie);
CREATE INDEX idx_animales_estado_salud ON animales(estado_salud);
CREATE INDEX idx_alimentos_nombre ON alimentos(nombre);
CREATE INDEX idx_empleados_nombre ON empleados(nombre);
CREATE INDEX idx_empleados_puesto ON empleados(puesto);
CREATE INDEX idx_limpiezas_fecha_programada ON limpiezas(fecha_programada);
CREATE INDEX idx_limpiezas_estado ON limpiezas(estado);

-- Índices para nuevas tablas de limpieza y RRHH
CREATE INDEX idx_tareas_limpieza_area ON tareas_limpieza(area);
CREATE INDEX idx_tareas_limpieza_encargado ON tareas_limpieza(encargado_id);
CREATE INDEX idx_tareas_limpieza_estado ON tareas_limpieza(estado);
CREATE INDEX idx_vacaciones_empleado ON vacaciones(empleado_id);
CREATE INDEX idx_vacaciones_estado ON vacaciones(estado);
CREATE INDEX idx_inasistencias_empleado ON inasistencias(empleado_id);
CREATE INDEX idx_inasistencias_fecha ON inasistencias(fecha);
CREATE INDEX idx_descuentos_empleado ON descuentos(empleado_id);
CREATE INDEX idx_bonos_empleado ON bonos(empleado_id);
CREATE INDEX idx_bonos_fecha ON bonos(fecha_otorgamiento);

CREATE INDEX idx_tratamientos_fecha_inicio ON tratamientos(fecha_inicio);
CREATE INDEX idx_tratamientos_estado ON tratamientos(estado);
CREATE INDEX idx_entradas_fecha_venta ON entradas(fecha_venta);
CREATE INDEX idx_entradas_tipo_ticket ON entradas(tipo_ticket);
CREATE INDEX idx_nominas_periodo ON nominas(periodo_anio, periodo_mes);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha_movimiento);
CREATE INDEX idx_asistencia_fecha ON asistencia(fecha);

-- Índices compuestos para búsquedas frecuentes
CREATE INDEX idx_horarios_alimentacion_animal ON horarios_alimentacion(animal_id, hora);
CREATE INDEX idx_tratamientos_animal_estado ON tratamientos(animal_id, estado);
CREATE INDEX idx_movimientos_producto_fecha ON movimientos_inventario(producto_id, fecha_movimiento);

-- Función para actualizar automáticamente la fecha de actualización
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Disparadores para actualizar automáticamente la fecha de actualización
CREATE TRIGGER actualizar_usuarios_fecha 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_animales_fecha 
    BEFORE UPDATE ON animales 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_alimentos_fecha 
    BEFORE UPDATE ON alimentos 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_empleados_fecha 
    BEFORE UPDATE ON empleados 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_limpiezas_fecha 
    BEFORE UPDATE ON limpiezas 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Disparadores para nuevas tablas de limpieza y RRHH
CREATE TRIGGER actualizar_tareas_limpieza_fecha 
    BEFORE UPDATE ON tareas_limpieza 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_vacaciones_fecha 
    BEFORE UPDATE ON vacaciones 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_medicamentos_fecha 
    BEFORE UPDATE ON medicamentos 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_tratamientos_fecha 
    BEFORE UPDATE ON tratamientos 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_productos_fecha 
    BEFORE UPDATE ON productos 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_nominas_fecha 
    BEFORE UPDATE ON nominas 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_promociones_fecha 
    BEFORE UPDATE ON promociones 
    FOR EACH ROW 
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Datos de ejemplo para pruebas

-- Insertar usuarios
INSERT INTO usuarios (nombre, email, rol, contraseña_hash) VALUES
('Admin Principal', 'admin@jungleplanet.com', 'admin', '$2b$12$LQ3E0k.Zk5Y4Z3y3y3y3y'), -- contraseña encriptada
('Dr. Veterinario', 'veterinario@jungleplanet.com', 'veterinario', '$2b$12$LQ3E0k.Zk5Y4Z3y3y3y3y'),
('Empleado Contable', 'contable@jungleplanet.com', 'contador', '$2b$12$LQ3E0k.Zk5Y4Z3y3y3y3y');

-- Insertar empleados
INSERT INTO empleados (usuario_id, nombre, puesto, salario, fecha_contratacion) VALUES
(1, 'Admin Principal', 'Administrador General', 5000.00, '2023-01-15'),
(2, 'Dr. Juan Pérez', 'Veterinario Jefe', 4000.00, '2023-02-01'),
(3, 'María González', 'Contadora', 3000.00, '2023-03-10');

-- Insertar animales
INSERT INTO animales (nombre, especie, habitat, dieta, veterinario_id) VALUES
('Simba', 'León Africano', 'Sabana', 'Carne, pollo, huesos', 2),
('Nala', 'León Africana', 'Sabana', 'Carne, pollo, huesos', 2),
('Kubo', 'Tigre de Bengala', 'Selva', 'Carne, pescado', 2),
('Paco', 'Pingüino Emperador', 'Antártida', 'Pescado, crustáceos', 2);

-- Insertar proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
('Proveedor Alimentos S.A.', 'Sr. Martínez', '+502 12345678', 'contacto@proveedoralimentos.com'),
('Proveedor Limpieza Ltda.', 'Sra. López', '+502 87654321', 'ventas@proveedorlimpieza.com');

-- Insertar alimentos
INSERT INTO alimentos (nombre, tipo, unidad_medida, stock_actual, proveedor_id, precio_unitario) VALUES
('Carne de res', 'carnivoro', 'kg', 100.00, 1, 30.00),
('Pescado fresco', 'carnivoro', 'kg', 50.00, 1, 20.00),
('Heno', 'herbivoro', 'kg', 200.00, 1, 5.00),
('Frutas tropicales', 'omnivoro', 'kg', 30.00, 1, 15.00);

-- Insertar medicamentos
INSERT INTO medicamentos (nombre, tipo, descripcion) VALUES
('Ibuprofeno veterinario', 'medicamento', 'Analgésico y antiinflamatorio'),
('Vitamina C', 'vitamina', 'Suplemento vitamínico'),
('Vacuna polivalente', 'vacuna', 'Vacuna para prevención de enfermedades comunes');

-- Insertar productos de inventario
INSERT INTO productos (nombre, categoria, unidad_medida, stock_actual, precio_unitario) VALUES
('Detergente desinfectante', 'limpieza', 'litro', 50.00, 25.00),
('Guantes de látex', 'limpieza', 'par', 100.00, 5.00),
('Papel higiénico', 'oficina', 'rollo', 200.00, 3.00),
('Papelería general', 'oficina', 'paquete', 30.00, 15.00);

-- Insertar horarios de alimentación
INSERT INTO horarios_alimentacion (animal_id, alimento_id, hora, frecuencia, cantidad) VALUES
(1, 1, '09:00', 'diario', 5.00),
(2, 1, '09:00:00', 'diario', 4.00),
(3, 1, '10:00:00', 'diario', 6.00),
(4, 2, '11:00:00', 'diario', 2.00);

-- Insertar limpiezas programadas
INSERT INTO limpiezas (area, tipo_area, responsable_id, fecha_programada, estado) VALUES
('Jaula Leones', 'jaula', 1, CURRENT_DATE + INTERVAL '1 day', 'pendiente'),
('Zona de Peces', 'jaula', 1, CURRENT_DATE + INTERVAL '1 day', 'pendiente'),
('Baños Públicos', 'sanitario', 1, CURRENT_DATE, 'en_progreso');

-- Insertar promociones
INSERT INTO promociones (nombre, descripcion, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin) VALUES
('Verano Divertido', '2x1 en entradas para niños', 'porcentaje', 50.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days'),
('Familia Feliz', '15% de descuento para grupos de 4 o más personas', 'porcentaje', 15.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days');

-- Insertar entradas vendidas
INSERT INTO entradas (fecha_venta, tipo_ticket, precio_unitario, cantidad, total_venta, vendedor_id) VALUES
(CURRENT_DATE, 'adulto', 25.00, 2, 50.00, 1),
(CURRENT_DATE, 'niño', 15.00, 3, 45.00, 1),
(CURRENT_DATE - INTERVAL '1 day', 'adulto', 25.00, 1, 25.00, 1);
