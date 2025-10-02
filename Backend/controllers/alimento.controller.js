const alimentoService = require('../services/alimentoService');
const { AppError } = require('../middleware/errorHandler');

const getAllAlimentos = async (req, res, next) => {
  try {
    const filters = {
      tipo: req.query.tipo,
      stock_bajo: req.query.stock_bajo === 'true',
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const alimentos = await alimentoService.getAllAlimentos(filters);
    
    res.json({
      success: true,
      data: alimentos,
      message: 'Alimentos obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getAlimentoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alimento = await alimentoService.getAlimentoById(id);
    
    if (!alimento) {
      return next(new AppError('Alimento no encontrado', 404));
    }
    
    res.json({
      success: true,
      data: alimento,
      message: 'Alimento obtenido exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const createAlimento = async (req, res, next) => {
  try {
    const alimento = await alimentoService.createAlimento(req.body);
    
    res.status(201).json({
      success: true,
      data: alimento,
      message: 'Alimento creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const updateAlimento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alimento = await alimentoService.updateAlimento(id, req.body);
    
    if (!alimento) {
      return next(new AppError('Alimento no encontrado', 404));
    }
    
    res.json({
      success: true,
      data: alimento,
      message: 'Alimento actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const deleteAlimento = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alimento = await alimentoService.deleteAlimento(id);
    
    if (!alimento) {
      return next(new AppError('Alimento no encontrado', 404));
    }
    
    res.json({
      success: true,
      message: 'Alimento eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cantidad, tipo } = req.body;
    
    if (!cantidad || !tipo) {
      return next(new AppError('Cantidad y tipo son requeridos', 400));
    }
    
    if (!['entrada', 'salida'].includes(tipo)) {
      return next(new AppError('Tipo debe ser "entrada" o "salida"', 400));
    }
    
    const alimento = await alimentoService.updateStock(id, cantidad, tipo);
    
    res.json({
      success: true,
      data: alimento,
      message: `Stock ${tipo === 'entrada' ? 'incrementado' : 'reducido'} exitosamente`
    });
  } catch (error) {
    next(error);
  }
};

const getAlimentosBajoStock = async (req, res, next) => {
  try {
    const alimentos = await alimentoService.getAlimentosBajoStock();
    
    res.json({
      success: true,
      data: alimentos,
      message: 'Alimentos con stock bajo obtenidos exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

const getEstadisticasAlimentos = async (req, res, next) => {
  try {
    const estadisticas = await alimentoService.getEstadisticasAlimentos();
    
    res.json({
      success: true,
      data: estadisticas,
      message: 'Estadísticas de alimentos obtenidas exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlimentos,
  getAlimentoById,
  createAlimento,
  updateAlimento,
  deleteAlimento,
  updateStock,
  getAlimentosBajoStock,
  getEstadisticasAlimentos
};