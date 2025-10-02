const { body, validationResult } = require('express-validator');

// Validación de datos para tareas de limpieza
const validateLimpiezaData = (data, isUpdate = false) => {
  const allowedAreas = ['jaulas', 'sanitarios', 'jardines', 'area_juegos', 'oficinas'];
  const allowedFrecuencias = ['diaria', 'semanal', 'quincenal', 'mensual'];
  const allowedEstados = ['pendiente', 'en_progreso', 'completada'];

  // Validar área
  if (!isUpdate || (isUpdate && data.area !== undefined)) {
    if (!data.area || !allowedAreas.includes(data.area)) {
      throw new Error(`Área inválida. Valores permitidos: ${allowedAreas.join(', ')}`);
    }
  }

 // Validar frecuencia (si se proporciona)
  if (!isUpdate || (isUpdate && data.frecuencia !== undefined)) {
    if (data.frecuencia && !allowedFrecuencias.includes(data.frecuencia)) {
      throw new Error(`Frecuencia inválida. Valores permitidos: ${allowedFrecuencias.join(', ')}`);
    }
  }

 // Validar estado (si se proporciona)
  if (!isUpdate || (isUpdate && data.estado !== undefined)) {
    if (data.estado && !allowedEstados.includes(data.estado)) {
      throw new Error(`Estado inválido. Valores permitidos: ${allowedEstados.join(', ')}`);
    }
  }

  // Validar fechas (si se proporcionan)
  if (!isUpdate || (isUpdate && data.ultima_fecha !== undefined)) {
    if (data.ultima_fecha && isNaN(Date.parse(data.ultima_fecha))) {
      throw new Error('Fecha de última limpieza inválida');
    }
  }

  if (!isUpdate || (isUpdate && data.proxima_fecha !== undefined)) {
    if (data.proxima_fecha && isNaN(Date.parse(data.proxima_fecha))) {
      throw new Error('Fecha de próxima limpieza inválida');
    }
  }

 // Validar encargado_id (si se proporciona)
  if (!isUpdate || (isUpdate && data.encargado_id !== undefined)) {
    if (data.encargado_id && typeof data.encargado_id !== 'string' && typeof data.encargado_id !== 'number') {
      throw new Error('ID de encargado inválido');
    }
  }

 // Validar notas (si se proporcionan)
  if (!isUpdate || (isUpdate && data.notas !== undefined)) {
    if (data.notas && typeof data.notas !== 'string') {
      throw new Error('Notas deben ser una cadena de texto');
    }
  }

  // Validar activo (si se proporciona)
  if (!isUpdate || (isUpdate && data.activo !== undefined)) {
    if (data.activo !== undefined && typeof data.activo !== 'boolean') {
      throw new Error('Campo activo debe ser booleano');
    }
 }

  return data;
};

// Validación de datos para vacaciones
const validateVacacionesData = (data, isUpdate = false) => {
  const allowedEstados = ['solicitada', 'aprobada', 'rechazada', 'cancelada'];

  // Validar fechas
  if (!isUpdate || (isUpdate && data.fecha_inicio !== undefined)) {
    if (!data.fecha_inicio || isNaN(Date.parse(data.fecha_inicio))) {
      throw new Error('Fecha de inicio inválida');
    }
  }

  if (!isUpdate || (isUpdate && data.fecha_fin !== undefined)) {
    if (!data.fecha_fin || isNaN(Date.parse(data.fecha_fin))) {
      throw new Error('Fecha de fin inválida');
    }
 }

  if (!isUpdate || (isUpdate && data.fecha_inicio !== undefined && data.fecha_fin !== undefined)) {
    if (new Date(data.fecha_inicio) > new Date(data.fecha_fin)) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }
  }

 // Validar estado
  if (!isUpdate || (isUpdate && data.estado !== undefined)) {
    if (data.estado && !allowedEstados.includes(data.estado)) {
      throw new Error(`Estado inválido. Valores permitidos: ${allowedEstados.join(', ')}`);
    }
  }

 // Validar empleado_id
  if (!isUpdate || (isUpdate && data.empleado_id !== undefined)) {
    if (!data.empleado_id) {
      throw new Error('ID de empleado es requerido');
    }
  }

  // Validar comentarios (si se proporcionan)
  if (!isUpdate || (isUpdate && data.comentarios !== undefined)) {
    if (data.comentarios && typeof data.comentarios !== 'string') {
      throw new Error('Comentarios deben ser una cadena de texto');
    }
  }

  return data;
};

// Validación de datos para inasistencias
const validateInasistenciasData = (data, isUpdate = false) => {
 const allowedTipos = ['justificada', 'injustificada', 'permiso', 'enfermedad'];

  // Validar fecha
  if (!isUpdate || (isUpdate && data.fecha !== undefined)) {
    if (!data.fecha || isNaN(Date.parse(data.fecha))) {
      throw new Error('Fecha inválida');
    }
  }

 // Validar tipo
  if (!isUpdate || (isUpdate && data.tipo !== undefined)) {
    if (!data.tipo || !allowedTipos.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Valores permitidos: ${allowedTipos.join(', ')}`);
    }
  }

 // Validar empleado_id
  if (!isUpdate || (isUpdate && data.empleado_id !== undefined)) {
    if (!data.empleado_id) {
      throw new Error('ID de empleado es requerido');
    }
 }

  // Validar motivo (si se proporciona)
  if (!isUpdate || (isUpdate && data.motivo !== undefined)) {
    if (data.motivo && typeof data.motivo !== 'string') {
      throw new Error('Motivo debe ser una cadena de texto');
    }
  }

  // Validar evidencia_url (si se proporciona)
  if (!isUpdate || (isUpdate && data.evidencia_url !== undefined)) {
    if (data.evidencia_url && typeof data.evidencia_url !== 'string') {
      throw new Error('URL de evidencia debe ser una cadena de texto');
    }
  }

  return data;
};

// Validación de datos para descuentos
const validateDescuentosData = (data, isUpdate = false) => {
  const allowedTipos = ['falta', 'anticipo', 'otro'];

  // Validar empleado_id
 if (!isUpdate || (isUpdate && data.empleado_id !== undefined)) {
    if (!data.empleado_id) {
      throw new Error('ID de empleado es requerido');
    }
 }

  // Validar concepto
  if (!isUpdate || (isUpdate && data.concepto !== undefined)) {
    if (!data.concepto || typeof data.concepto !== 'string') {
      throw new Error('Concepto es requerido y debe ser una cadena de texto');
    }
  }

 // Validar monto
  if (!isUpdate || (isUpdate && data.monto !== undefined)) {
    if (data.monto === undefined || data.monto === null || isNaN(data.monto) || data.monto < 0) {
      throw new Error('Monto debe ser un número positivo');
    }
  }

  // Validar fecha_aplicacion
  if (!isUpdate || (isUpdate && data.fecha_aplicacion !== undefined)) {
    if (data.fecha_aplicacion && isNaN(Date.parse(data.fecha_aplicacion))) {
      throw new Error('Fecha de aplicación inválida');
    }
 }

  // Validar tipo
  if (!isUpdate || (isUpdate && data.tipo !== undefined)) {
    if (data.tipo && !allowedTipos.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Valores permitidos: ${allowedTipos.join(', ')}`);
    }
  }

 return data;
};

// Validación de datos para bonos
const validateBonosData = (data, isUpdate = false) => {
  const allowedTipos = ['productividad', 'cumpleaños', 'extraordinario'];

  // Validar empleado_id
 if (!isUpdate || (isUpdate && data.empleado_id !== undefined)) {
    if (!data.empleado_id) {
      throw new Error('ID de empleado es requerido');
    }
 }

  // Validar concepto
 if (!isUpdate || (isUpdate && data.concepto !== undefined)) {
    if (!data.concepto || typeof data.concepto !== 'string') {
      throw new Error('Concepto es requerido y debe ser una cadena de texto');
    }
  }

  // Validar monto
  if (!isUpdate || (isUpdate && data.monto !== undefined)) {
    if (data.monto === undefined || data.monto === null || isNaN(data.monto) || data.monto < 0) {
      throw new Error('Monto debe ser un número positivo');
    }
  }

  // Validar fecha_otorgamiento
  if (!isUpdate || (isUpdate && data.fecha_otorgamiento !== undefined)) {
    if (data.fecha_otorgamiento && isNaN(Date.parse(data.fecha_otorgamiento))) {
      throw new Error('Fecha de otorgamiento inválida');
    }
  }

  // Validar tipo
  if (!isUpdate || (isUpdate && data.tipo !== undefined)) {
    if (data.tipo && !allowedTipos.includes(data.tipo)) {
      throw new Error(`Tipo inválido. Valores permitidos: ${allowedTipos.join(', ')}`);
    }
  }

  return data;
};

module.exports = {
 validateLimpiezaData,
  validateVacacionesData,
  validateInasistenciasData,
  validateDescuentosData,
  validateBonosData
};