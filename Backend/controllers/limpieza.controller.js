const limpiezaService = require('../services/limpiezaService');
const { logger } = require('../middleware/logger');

const getAllTareas = async (req, res) => {
  try {
    const filters = {
      area: req.query.area,
      estado: req.query.estado,
      encargado_id: req.query.encargado_id,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin
    };

    const tareas = await limpiezaService.getAllTareasLimpieza(filters);
    
    res.status(200).json({
      success: true,
      data: tareas,
      message: 'Tareas de limpieza obtenidas exitosamente'
    });
  } catch (error) {
    logger.error('Error en getAllTareas', { error: error.message, query: req.query });
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas de limpieza',
      error: error.message
    });
  }
};

const getTareaById = async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await limpiezaService.getTareaLimpiezaById(id);

    if (!tarea) {
      return res.status(404).json({
        success: false,
        message: 'Tarea de limpieza no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: tarea,
      message: 'Tarea de limpieza obtenida exitosamente'
    });
  } catch (error) {
    logger.error('Error en getTareaById', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener la tarea de limpieza',
      error: error.message
    });
  }
};

const createTarea = async (req, res) => {
  try {
    const tareaData = req.body;
    const tarea = await limpiezaService.createTareaLimpieza(tareaData);

    res.status(201).json({
      success: true,
      data: tarea,
      message: 'Tarea de limpieza creada exitosamente'
    });
  } catch (error) {
    logger.error('Error en createTarea', { body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al crear la tarea de limpieza',
      error: error.message
    });
 }
};

const updateTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const tareaData = req.body;
    const tarea = await limpiezaService.updateTareaLimpieza(id, tareaData);

    res.status(200).json({
      success: true,
      data: tarea,
      message: 'Tarea de limpieza actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error en updateTarea', { id: req.params.id, body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la tarea de limpieza',
      error: error.message
    });
  }
};

const deleteTarea = async (req, res) => {
  try {
    const { id } = req.params;
    await limpiezaService.deleteTareaLimpieza(id);

    res.status(200).json({
      success: true,
      message: 'Tarea de limpieza eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error en deleteTarea', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la tarea de limpieza',
      error: error.message
    });
  }
};

const getEmpleadosDisponibles = async (req, res) => {
  try {
    const empleados = await limpiezaService.getEmpleadosDisponiblesLimpieza();

    res.status(200).json({
      success: true,
      data: empleados,
      message: 'Empleados disponibles para tareas de limpieza obtenidos exitosamente'
    });
  } catch (error) {
    logger.error('Error en getEmpleadosDisponibles', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener empleados disponibles',
      error: error.message
    });
  }
};

module.exports = {
  getAllTareas,
  getTareaById,
  createTarea,
  updateTarea,
  deleteTarea,
  getEmpleadosDisponibles
};