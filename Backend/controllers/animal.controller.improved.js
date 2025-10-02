const animalService = require('../services/animalService');
const {
  successResponse,
  createdResponse,
  notFoundResponse,
  errorResponse,
  paginatedResponse,
  asyncHandler,
  validateId,
  parsePaginationParams,
  parseSortParams,
  buildFilters,
} = require('../utils/responseHelpers');
const { logger } = require('../middleware/logger');

/**
 * Obtener todos los animales con paginación, filtros y búsqueda
 */
const getAllAnimales = asyncHandler(async (req, res) => {
  try {
    // Parsear parámetros de paginación
    const pagination = parsePaginationParams(req.query);
    
    // Parsear parámetros de ordenamiento
    const sort = parseSortParams(req.query, ['nombre', 'especie', 'fecha_nacimiento', 'estado_salud']);
    
    // Parsear búsqueda
    const search = req.query.search || '';
    
    // Parsear filtros
    const filters = buildFilters(req.query, ['especie', 'estado_salud', 'habitat']);

    const result = await animalService.getAllAnimales({
      ...pagination,
      ...sort,
      search,
      filters,
    });

    return paginatedResponse(
      res,
      result.data,
      { ...pagination, total: result.total },
      'Animales obtenidos exitosamente'
    );
  } catch (error) {
    logger.error('Error in getAllAnimales:', error);
    return errorResponse(res, 'Error al obtener los animales', 500);
  }
});

/**
 * Obtener un animal por ID
 */
const getAnimalById = asyncHandler(async (req, res) => {
  try {
    const { valid, id, error: validationError } = validateId(req.params.id);
    
    if (!valid) {
      return errorResponse(res, validationError, 400);
    }

    const animal = await animalService.getAnimalById(id);

    if (!animal) {
      return notFoundResponse(res, 'Animal no encontrado');
    }

    return successResponse(res, animal, 'Animal obtenido exitosamente');
  } catch (error) {
    logger.error('Error in getAnimalById:', error);
    return errorResponse(res, 'Error al obtener el animal', 500);
  }
});

/**
 * Crear un nuevo animal
 */
const createAnimal = asyncHandler(async (req, res) => {
  try {
    const animalData = {
      nombre: req.body.nombre,
      especie: req.body.especie,
      fecha_nacimiento: req.body.fecha_nacimiento,
      estado_salud: req.body.estado_salud || 'saludable',
      habitat: req.body.habitat,
      dieta: req.body.dieta,
      peso: req.body.peso,
      observaciones: req.body.observaciones,
    };

    const newAnimal = await animalService.createAnimal(animalData);

    logger.info('Animal created', {
      animalId: newAnimal.id,
      nombre: newAnimal.nombre,
      createdBy: req.user?.email,
    });

    return createdResponse(res, newAnimal, 'Animal creado exitosamente');
  } catch (error) {
    logger.error('Error in createAnimal:', error);
    
    if (error.message.includes('ya existe')) {
      return errorResponse(res, error.message, 409);
    }
    
    return errorResponse(res, 'Error al crear el animal', 500);
  }
});

/**
 * Actualizar un animal
 */
const updateAnimal = asyncHandler(async (req, res) => {
  try {
    const { valid, id, error: validationError } = validateId(req.params.id);
    
    if (!valid) {
      return errorResponse(res, validationError, 400);
    }

    // Verificar que el animal existe
    const existingAnimal = await animalService.getAnimalById(id);
    if (!existingAnimal) {
      return notFoundResponse(res, 'Animal no encontrado');
    }

    const updateData = {
      nombre: req.body.nombre,
      especie: req.body.especie,
      fecha_nacimiento: req.body.fecha_nacimiento,
      estado_salud: req.body.estado_salud,
      habitat: req.body.habitat,
      dieta: req.body.dieta,
      peso: req.body.peso,
      observaciones: req.body.observaciones,
    };

    const updatedAnimal = await animalService.updateAnimal(id, updateData);

    logger.info('Animal updated', {
      animalId: id,
      updatedBy: req.user?.email,
    });

    return successResponse(res, updatedAnimal, 'Animal actualizado exitosamente');
  } catch (error) {
    logger.error('Error in updateAnimal:', error);
    return errorResponse(res, 'Error al actualizar el animal', 500);
  }
});

/**
 * Eliminar un animal
 */
const deleteAnimal = asyncHandler(async (req, res) => {
  try {
    const { valid, id, error: validationError } = validateId(req.params.id);
    
    if (!valid) {
      return errorResponse(res, validationError, 400);
    }

    // Verificar que el animal existe
    const existingAnimal = await animalService.getAnimalById(id);
    if (!existingAnimal) {
      return notFoundResponse(res, 'Animal no encontrado');
    }

    await animalService.deleteAnimal(id);

    logger.info('Animal deleted', {
      animalId: id,
      animalName: existingAnimal.nombre,
      deletedBy: req.user?.email,
    });

    return successResponse(res, null, 'Animal eliminado exitosamente');
  } catch (error) {
    logger.error('Error in deleteAnimal:', error);
    return errorResponse(res, 'Error al eliminar el animal', 500);
  }
});

/**
 * Obtener animales por especie
 */
const getAnimalesByEspecie = asyncHandler(async (req, res) => {
  try {
    const { especie } = req.params;
    const animales = await animalService.getAnimalesByEspecie(especie);

    return successResponse(
      res,
      animales,
      `Animales de la especie ${especie} obtenidos exitosamente`
    );
  } catch (error) {
    logger.error('Error in getAnimalesByEspecie:', error);
    return errorResponse(res, 'Error al obtener animales por especie', 500);
  }
});

/**
 * Obtener animales por estado de salud
 */
const getAnimalesByEstadoSalud = asyncHandler(async (req, res) => {
  try {
    const { estado } = req.params;
    const animales = await animalService.getAnimalesByEstadoSalud(estado);

    return successResponse(
      res,
      animales,
      `Animales con estado ${estado} obtenidos exitosamente`
    );
  } catch (error) {
    logger.error('Error in getAnimalesByEstadoSalud:', error);
    return errorResponse(res, 'Error al obtener animales por estado de salud', 500);
  }
});

/**
 * Obtener estadísticas de animales
 */
const getAnimalStats = asyncHandler(async (req, res) => {
  try {
    const stats = await animalService.getAnimalStats();

    return successResponse(res, stats, 'Estadísticas obtenidas exitosamente');
  } catch (error) {
    logger.error('Error in getAnimalStats:', error);
    return errorResponse(res, 'Error al obtener estadísticas', 500);
  }
});

/**
 * Buscar animales
 */
const searchAnimales = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return errorResponse(res, 'El parámetro de búsqueda es requerido', 400);
    }

    const animales = await animalService.searchAnimales(q);

    return successResponse(
      res,
      animales,
      `${animales.length} animales encontrados`
    );
  } catch (error) {
    logger.error('Error in searchAnimales:', error);
    return errorResponse(res, 'Error al buscar animales', 500);
  }
});

module.exports = {
  getAllAnimales,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  getAnimalesByEspecie,
  getAnimalesByEstadoSalud,
  getAnimalStats,
  searchAnimales,
};
