const { body, validationResult } = require('express-validator');
const { logger } = require('./logger');

// Función para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Errores de validación:', { errors: errors.array() });
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validación para registro de usuarios
const validateRegister = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'),
  body('rol')
    .optional()
    .isIn(['admin', 'veterinario', 'empleado', 'contador'])
    .withMessage('Rol inválido. Valores permitidos: admin, veterinario, empleado, contador')
];

// Validación para login de usuarios
const validateLogin = [
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
];

// Validación para paginación
const validatePagination = [
  body('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entero entre 1 y 100'),
  handleValidationErrors
];

// Validación para alimentos
const validateAlimento = [
  body('nombre')
    .notEmpty().withMessage('El nombre del alimento es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('tipo')
    .isIn(['carne', 'vegetales', 'frutas', 'suplementos', 'otros'])
    .withMessage('Tipo inválido. Valores permitidos: carne, vegetales, frutas, suplementos, otros'),
  body('stock')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0'),
  body('stock_minimo')
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
  body('precio_unitario')
    .isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número mayor o igual a 0'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no debe exceder los 500 caracteres')
];

// Validación para IDs
const validateId = [
  body('id')
    .optional()
    .isUUID().withMessage('El ID debe ser un UUID válido')
];

// Validación para empleados
const validateEmpleado = [
  body('nombre')
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail().withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('telefono')
    .optional()
    .isMobilePhone('es-ES').withMessage('El teléfono debe tener un formato válido'),
  body('puesto')
    .notEmpty().withMessage('El puesto es requerido')
    .isIn(['veterinario', 'cuidador', 'limpieza', 'administrativo', 'seguridad'])
    .withMessage('Puesto inválido. Valores permitidos: veterinario, cuidador, limpieza, administrativo, seguridad'),
  body('salario')
    .isFloat({ min: 0 }).withMessage('El salario debe ser un número mayor o igual a 0'),
  body('fecha_contratacion')
    .isDate().withMessage('La fecha de contratación debe ser una fecha válida')
];

// Validación para tareas de limpieza
const validateLimpieza = [
  body('area')
    .notEmpty().withMessage('El área es requerida')
    .isIn(['jaulas', 'sanitarios', 'jardines', 'area_juegos', 'oficinas'])
    .withMessage('Área inválida. Valores permitidos: jaulas, sanitarios, jardines, area_juegos, oficinas'),
  body('encargado_id')
    .optional()
    .isString().withMessage('El ID del encargado debe ser una cadena de texto válida'),
  body('frecuencia')
    .optional()
    .isIn(['diaria', 'semanal', 'quincenal', 'mensual'])
    .withMessage('Frecuencia inválida. Valores permitidos: diaria, semanal, quincenal, mensual'),
  body('ultima_fecha')
    .optional()
    .isDate().withMessage('La última fecha debe ser una fecha válida'),
  body('proxima_fecha')
    .optional()
    .isDate().withMessage('La próxima fecha debe ser una fecha válida'),
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_progreso', 'completada'])
    .withMessage('Estado inválido. Valores permitidos: pendiente, en_progreso, completada'),
  body('notas')
    .optional()
    .isString().withMessage('Las notas deben ser una cadena de texto')
    .isLength({ max: 500 }).withMessage('Las notas no deben exceder los 500 caracteres'),
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser booleano'),

  // Middleware para manejar los resultados de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en tarea de limpieza', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para vacaciones
const validateVacaciones = [
  body('empleado_id')
    .notEmpty().withMessage('El ID del empleado es requerido')
    .isString().withMessage('El ID del empleado debe ser una cadena de texto válida'),
  body('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isDate().withMessage('La fecha de inicio debe ser una fecha válida')
    .custom((value, { req }) => {
      if (req.body.fecha_fin && new Date(value) > new Date(req.body.fecha_fin)) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
      return true;
    }),
  body('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es requerida')
    .isDate().withMessage('La fecha de fin debe ser una fecha válida'),
  body('estado')
    .optional()
    .isIn(['solicitada', 'aprobada', 'rechazada', 'cancelada'])
    .withMessage('Estado inválido. Valores permitidos: solicitada, aprobada, rechazada, cancelada'),
  body('comentarios')
    .optional()
    .isString().withMessage('Los comentarios deben ser una cadena de texto')
    .isLength({ max: 500 }).withMessage('Los comentarios no deben exceder los 500 caracteres'),
  body('aprobado_por')
    .optional()
    .isString().withMessage('El ID del aprobador debe ser una cadena de texto válida'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en vacaciones', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para inasistencias
const validateInasistencias = [
  body('empleado_id')
    .notEmpty().withMessage('El ID del empleado es requerido')
    .isString().withMessage('El ID del empleado debe ser una cadena de texto válida'),
  body('fecha')
    .notEmpty().withMessage('La fecha es requerida')
    .isDate().withMessage('La fecha debe ser una fecha válida'),
  body('tipo')
    .notEmpty().withMessage('El tipo es requerido')
    .isIn(['justificada', 'injustificada', 'permiso', 'enfermedad'])
    .withMessage('Tipo inválido. Valores permitidos: justificada, injustificada, permiso, enfermedad'),
  body('motivo')
    .optional()
    .isString().withMessage('El motivo debe ser una cadena de texto')
    .isLength({ max: 200 }).withMessage('El motivo no debe exceder los 200 caracteres'),
  body('evidencia_url')
    .optional()
    .isString().withMessage('La URL de evidencia debe ser una cadena de texto válida')
    .isURL().withMessage('La URL de evidencia debe ser una URL válida'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en inasistencias', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para descuentos
const validateDescuentos = [
  body('empleado_id')
    .notEmpty().withMessage('El ID del empleado es requerido')
    .isString().withMessage('El ID del empleado debe ser una cadena de texto válida'),
  body('concepto')
    .notEmpty().withMessage('El concepto es requerido')
    .isString().withMessage('El concepto debe ser una cadena de texto')
    .isLength({ max: 100 }).withMessage('El concepto no debe exceder los 100 caracteres'),
  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('fecha_aplicacion')
    .optional()
    .isDate().withMessage('La fecha de aplicación debe ser una fecha válida'),
  body('tipo')
    .optional()
    .isIn(['falta', 'anticipo', 'otro'])
    .withMessage('Tipo inválido. Valores permitidos: falta, anticipo, otro'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en descuentos', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para bonos
const validateBonos = [
  body('empleado_id')
    .notEmpty().withMessage('El ID del empleado es requerido')
    .isString().withMessage('El ID del empleado debe ser una cadena de texto válida'),
  body('concepto')
    .notEmpty().withMessage('El concepto es requerido')
    .isString().withMessage('El concepto debe ser una cadena de texto')
    .isLength({ max: 100 }).withMessage('El concepto no debe exceder los 100 caracteres'),
  body('monto')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0 }).withMessage('El monto debe ser un número positivo'),
  body('fecha_otorgamiento')
    .optional()
    .isDate().withMessage('La fecha de otorgamiento debe ser una fecha válida'),
  body('tipo')
    .optional()
    .isIn(['productividad', 'cumpleaños', 'extraordinario'])
    .withMessage('Tipo inválido. Valores permitidos: productividad, cumpleaños, extraordinario'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en bonos', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para promociones
const validatePromocion = [
  body('nombre')
    .notEmpty().withMessage('El nombre de la promoción es requerido')
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .isLength({ min: 2, max: 150 }).withMessage('El nombre debe tener entre 2 y 150 caracteres'),
  body('descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser una cadena de texto')
    .isLength({ max: 500 }).withMessage('La descripción no debe exceder los 500 caracteres'),
  body('descuento')
    .notEmpty().withMessage('El descuento es requerido')
    .isFloat({ min: 0, max: 100 }).withMessage('El descuento debe ser un número entre 0 y 100'),
  body('fecha_inicio')
    .notEmpty().withMessage('La fecha de inicio es requerida')
    .isDate().withMessage('La fecha de inicio debe ser una fecha válida'),
  body('fecha_fin')
    .notEmpty().withMessage('La fecha de fin es requerida')
    .isDate().withMessage('La fecha de fin debe ser una fecha válida'),
  body('activo')
    .optional()
    .isBoolean().withMessage('El campo activo debe ser booleano'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en promoción', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para nóminas
const validateNomina = [
  body('empleado_id')
    .notEmpty().withMessage('El ID del empleado es requerido')
    .isString().withMessage('El ID del empleado debe ser una cadena de texto válida'),
  body('mes')
    .notEmpty().withMessage('El mes es requerido')
    .isInt({ min: 1, max: 12 }).withMessage('El mes debe ser un número entre 1 y 12'),
  body('anio')
    .notEmpty().withMessage('El año es requerido')
    .isInt({ min: 2000, max: 2100 }).withMessage('El año debe ser un número entre 2000 y 2100'),
  body('salario_base')
    .notEmpty().withMessage('El salario base es requerido')
    .isFloat({ min: 0 }).withMessage('El salario base debe ser un número positivo'),
  body('bonos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los bonos deben ser un número positivo'),
  body('descuentos')
    .optional()
    .isFloat({ min: 0 }).withMessage('Los descuentos deben ser un número positivo'),
  body('total')
    .optional()
    .isFloat({ min: 0 }).withMessage('El total debe ser un número positivo'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en nómina', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para inventario
const validateInventario = [
  body('nombre')
    .notEmpty().withMessage('El nombre del artículo es requerido')
    .isString().withMessage('El nombre debe ser una cadena de texto')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('tipo')
    .optional()
    .isIn(['alimento', 'medicamento', 'equipo', 'limpieza', 'otros'])
    .withMessage('Tipo inválido. Valores permitidos: alimento, medicamento, equipo, limpieza, otros'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero mayor o igual a 0'),
  body('cantidad_minima')
    .optional()
    .isInt({ min: 0 }).withMessage('La cantidad mínima debe ser un número entero mayor o igual a 0'),
  body('precio_unitario')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número mayor o igual a 0'),
  body('ubicacion')
    .optional()
    .isString().withMessage('La ubicación debe ser una cadena de texto')
    .isLength({ max: 100 }).withMessage('La ubicación no debe exceder los 100 caracteres'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en inventario', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para entradas
const validateEntrada = [
  body('tipo_ticket')
    .notEmpty().withMessage('El tipo de ticket es requerido')
    .isIn(['Adulto', 'Niño', 'Adulto Mayor', 'Estudiante'])
    .withMessage('Tipo de ticket inválido. Valores permitidos: Adulto, Niño, Adulto Mayor, Estudiante'),
  body('cantidad')
    .notEmpty().withMessage('La cantidad es requerida')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero mayor a 0'),
  body('precio_unitario')
    .notEmpty().withMessage('El precio unitario es requerido')
    .isFloat({ min: 0 }).withMessage('El precio unitario debe ser un número mayor o igual a 0'),
  body('total_venta')
    .optional()
    .isFloat({ min: 0 }).withMessage('El total debe ser un número mayor o igual a 0'),
  body('fecha_venta')
    .optional()
    .isDate().withMessage('La fecha de venta debe ser una fecha válida'),
  body('metodo_pago')
    .optional()
    .isIn(['efectivo', 'tarjeta', 'transferencia'])
    .withMessage('Método de pago inválido. Valores permitidos: efectivo, tarjeta, transferencia'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en entrada', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validación para registros clínicos
const validateClinico = [
  body('animal_id')
    .notEmpty().withMessage('El ID del animal es requerido')
    .isString().withMessage('El ID del animal debe ser una cadena de texto válida'),
  body('veterinario_id')
    .optional()
    .isString().withMessage('El ID del veterinario debe ser una cadena de texto válida'),
  body('tipo')
    .notEmpty().withMessage('El tipo de registro es requerido')
    .isIn(['consulta', 'vacunacion', 'cirugia', 'tratamiento', 'emergencia'])
    .withMessage('Tipo inválido. Valores permitidos: consulta, vacunacion, cirugia, tratamiento, emergencia'),
  body('diagnostico')
    .optional()
    .isString().withMessage('El diagnóstico debe ser una cadena de texto')
    .isLength({ max: 500 }).withMessage('El diagnóstico no debe exceder los 500 caracteres'),
  body('tratamiento')
    .optional()
    .isString().withMessage('El tratamiento debe ser una cadena de texto')
    .isLength({ max: 500 }).withMessage('El tratamiento no debe exceder los 500 caracteres'),
  body('medicamentos')
    .optional()
    .isString().withMessage('Los medicamentos deben ser una cadena de texto')
    .isLength({ max: 500 }).withMessage('Los medicamentos no deben exceder los 500 caracteres'),
  body('observaciones')
    .optional()
    .isString().withMessage('Las observaciones deben ser una cadena de texto')
    .isLength({ max: 1000 }).withMessage('Las observaciones no deben exceder los 1000 caracteres'),
  body('fecha')
    .optional()
    .isDate().withMessage('La fecha debe ser una fecha válida'),
  body('proxima_cita')
    .optional()
    .isDate().withMessage('La próxima cita debe ser una fecha válida'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Error de validación en registro clínico', { 
        errors: errors.array(), 
        body: req.body 
      });
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validatePagination,
  validateAlimento,
  validateId,
  validateEmpleado,
  validateLimpieza,
  validateVacaciones,
  validateInasistencias,
  validateDescuentos,
  validateBonos,
  validatePromocion,
  validateNomina,
  validateInventario,
  validateEntrada,
  validateClinico
};