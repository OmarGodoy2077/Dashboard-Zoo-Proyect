const empleadoService = require('../services/empleadoService');
const { AppError } = require('../middleware/errorHandler');

const getAllEmpleados = async (req, res, next) => {
  try {
    const { logger } = require('../middleware/logger');
    logger.info('getAllEmpleados called', { query: req.query, user: req.user?.id });
    
    const filters = {
      puesto: req.query.puesto,
      estado: req.query.estado,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const empleados = await empleadoService.getAllEmpleados(filters);
    
    logger.info('Empleados fetched successfully', { count: empleados.length });
    
    res.json({
      success: true,
      data: empleados,
      message: 'Empleados obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getEmpleadoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empleado = await empleadoService.getEmpleadoById(id);
    
    if (!empleado) {
      return next(new AppError('Empleado no encontrado', 404));
    }
    
    res.json({
      success: true,
      data: empleado,
      message: 'Empleado obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const createEmpleado = async (req, res, next) => {
  try {
    const empleado = await empleadoService.createEmpleado(req.body);
    
    res.status(201).json({
      success: true,
      data: empleado,
      message: 'Empleado creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const updateEmpleado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empleado = await empleadoService.updateEmpleado(id, req.body);
    
    if (!empleado) {
      return next(new AppError('Empleado no encontrado', 404));
    }
    
    res.json({
      success: true,
      data: empleado,
      message: 'Empleado actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmpleado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const empleado = await empleadoService.deleteEmpleado(id);
    
    if (!empleado) {
      return next(new AppError('Empleado no encontrado', 404));
    }
    
    res.json({
      success: true,
      message: 'Empleado eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getEstadisticasEmpleados = async (req, res, next) => {
  try {
    const estadisticas = await empleadoService.getEstadisticasEmpleados();
    
    res.json({
      success: true,
      data: estadisticas,
      message: 'Estadísticas de empleados obtenidas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmpleados,
  getEmpleadoById,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  getEstadisticasEmpleados
};