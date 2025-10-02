/**
 * Utilidades para manejo de respuestas HTTP estandarizadas
 */

/**
 * Envía una respuesta de éxito
 */
const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Envía una respuesta de error
 */
const errorResponse = (res, message = 'Error en la operación', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Envía una respuesta de recurso creado
 */
const createdResponse = (res, data, message = 'Recurso creado exitosamente') => {
  return successResponse(res, data, message, 201);
};

/**
 * Envía una respuesta de recurso no encontrado
 */
const notFoundResponse = (res, message = 'Recurso no encontrado') => {
  return errorResponse(res, message, 404);
};

/**
 * Envía una respuesta de no autorizado
 */
const unauthorizedResponse = (res, message = 'No autorizado') => {
  return errorResponse(res, message, 401);
};

/**
 * Envía una respuesta de prohibido
 */
const forbiddenResponse = (res, message = 'Acceso prohibido') => {
  return errorResponse(res, message, 403);
};

/**
 * Envía una respuesta de conflicto
 */
const conflictResponse = (res, message = 'Conflicto con el estado actual del recurso') => {
  return errorResponse(res, message, 409);
};

/**
 * Envía una respuesta de validación fallida
 */
const validationErrorResponse = (res, errors, message = 'Errores de validación') => {
  return errorResponse(res, message, 422, errors);
};

/**
 * Envía una respuesta de error del servidor
 */
const serverErrorResponse = (res, message = 'Error interno del servidor') => {
  return errorResponse(res, message, 500);
};

/**
 * Envía una respuesta paginada
 */
const paginatedResponse = (res, data, pagination, message = 'Datos obtenidos exitosamente') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      itemsPerPage: pagination.limit,
      totalItems: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Wrapper para manejo de errores async en rutas
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Valida que el ID sea un número válido
 */
const validateId = (id) => {
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId <= 0) {
    return { valid: false, error: 'ID inválido' };
  }
  return { valid: true, id: numId };
};

/**
 * Sanitiza un objeto eliminando campos undefined o null
 */
const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Parsea parámetros de paginación
 */
const parsePaginationParams = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 && limit <= 100 ? limit : 10,
    offset: offset >= 0 ? offset : 0,
  };
};

/**
 * Parsea parámetros de ordenamiento
 */
const parseSortParams = (query, allowedFields = []) => {
  const sortBy = query.sortBy || 'id';
  const sortOrder = query.sortOrder?.toLowerCase() === 'desc' ? 'desc' : 'asc';

  // Validar que el campo de ordenamiento sea permitido
  const validSortBy = allowedFields.length > 0 
    ? (allowedFields.includes(sortBy) ? sortBy : allowedFields[0])
    : sortBy;

  return {
    sortBy: validSortBy,
    sortOrder,
    ascending: sortOrder === 'asc',
  };
};

/**
 * Construye filtros para consultas
 */
const buildFilters = (query, allowedFilters = []) => {
  const filters = {};

  for (const filter of allowedFilters) {
    if (query[filter]) {
      filters[filter] = query[filter];
    }
  }

  return filters;
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  validationErrorResponse,
  serverErrorResponse,
  paginatedResponse,
  asyncHandler,
  validateId,
  sanitizeObject,
  parsePaginationParams,
  parseSortParams,
  buildFilters,
};
