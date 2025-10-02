const rrhhService = require('../services/rrhhService');
const { logger } = require('../middleware/logger');

// Controladores para vacaciones
const getAllVacaciones = async (req, res) => {
  try {
    const filters = {
      empleado_id: req.query.empleado_id,
      estado: req.query.estado,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin
    };

    const vacaciones = await rrhhService.getAllVacaciones(filters);
    
    res.status(200).json({
      success: true,
      data: vacaciones,
      message: 'Vacaciones obtenidas exitosamente'
    });
  } catch (error) {
    logger.error('Error en getAllVacaciones', { error: error.message, query: req.query });
    res.status(500).json({
      success: false,
      message: 'Error al obtener las vacaciones',
      error: error.message
    });
 }
};

const getVacacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const vacacion = await rrhhService.getVacacionById(id);

    if (!vacacion) {
      return res.status(404).json({
        success: false,
        message: 'Vacación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: vacacion,
      message: 'Vacación obtenida exitosamente'
    });
  } catch (error) {
    logger.error('Error en getVacacionById', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener la vacación',
      error: error.message
    });
  }
};

const createVacacion = async (req, res) => {
  try {
    const vacacionData = req.body;
    const vacacion = await rrhhService.createVacacion(vacacionData);

    res.status(201).json({
      success: true,
      data: vacacion,
      message: 'Vacación creada exitosamente'
    });
  } catch (error) {
    logger.error('Error en createVacacion', { body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al crear la vacación',
      error: error.message
    });
  }
};

const updateVacacion = async (req, res) => {
  try {
    const { id } = req.params;
    const vacacionData = req.body;
    const vacacion = await rrhhService.updateVacacion(id, vacacionData);

    res.status(200).json({
      success: true,
      data: vacacion,
      message: 'Vacación actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error en updateVacacion', { id: req.params.id, body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la vacación',
      error: error.message
    });
  }
};

const deleteVacacion = async (req, res) => {
  try {
    const { id } = req.params;
    await rrhhService.deleteVacacion(id);

    res.status(200).json({
      success: true,
      message: 'Vacación eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error en deleteVacacion', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la vacación',
      error: error.message
    });
  }
};

// Controladores para inasistencias
const getAllInasistencias = async (req, res) => {
  try {
    const filters = {
      empleado_id: req.query.empleado_id,
      tipo: req.query.tipo,
      fecha: req.query.fecha,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin
    };

    const inasistencias = await rrhhService.getAllInasistencias(filters);
    
    res.status(200).json({
      success: true,
      data: inasistencias,
      message: 'Inasistencias obtenidas exitosamente'
    });
  } catch (error) {
    logger.error('Error en getAllInasistencias', { error: error.message, query: req.query });
    res.status(500).json({
      success: false,
      message: 'Error al obtener las inasistencias',
      error: error.message
    });
  }
};

const getInasistenciaById = async (req, res) => {
  try {
    const { id } = req.params;
    const inasistencia = await rrhhService.getInasistenciaById(id);

    if (!inasistencia) {
      return res.status(404).json({
        success: false,
        message: 'Inasistencia no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: inasistencia,
      message: 'Inasistencia obtenida exitosamente'
    });
  } catch (error) {
    logger.error('Error en getInasistenciaById', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener la inasistencia',
      error: error.message
    });
  }
};

const createInasistencia = async (req, res) => {
  try {
    const inasistenciaData = req.body;
    const inasistencia = await rrhhService.createInasistencia(inasistenciaData);

    res.status(201).json({
      success: true,
      data: inasistencia,
      message: 'Inasistencia creada exitosamente'
    });
  } catch (error) {
    logger.error('Error en createInasistencia', { body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al crear la inasistencia',
      error: error.message
    });
  }
};

const updateInasistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const inasistenciaData = req.body;
    const inasistencia = await rrhhService.updateInasistencia(id, inasistenciaData);

    res.status(200).json({
      success: true,
      data: inasistencia,
      message: 'Inasistencia actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error en updateInasistencia', { id: req.params.id, body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la inasistencia',
      error: error.message
    });
  }
};

const deleteInasistencia = async (req, res) => {
  try {
    const { id } = req.params;
    await rrhhService.deleteInasistencia(id);

    res.status(200).json({
      success: true,
      message: 'Inasistencia eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error en deleteInasistencia', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la inasistencia',
      error: error.message
    });
  }
};

// Controladores para descuentos
const getAllDescuentos = async (req, res) => {
  try {
    const filters = {
      empleado_id: req.query.empleado_id,
      tipo: req.query.tipo,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin
    };

    const descuentos = await rrhhService.getAllDescuentos(filters);
    
    res.status(200).json({
      success: true,
      data: descuentos,
      message: 'Descuentos obtenidos exitosamente'
    });
  } catch (error) {
    logger.error('Error en getAllDescuentos', { error: error.message, query: req.query });
    res.status(500).json({
      success: false,
      message: 'Error al obtener los descuentos',
      error: error.message
    });
  }
};

const getDescuentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const descuento = await rrhhService.getDescuentoById(id);

    if (!descuento) {
      return res.status(404).json({
        success: false,
        message: 'Descuento no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: descuento,
      message: 'Descuento obtenido exitosamente'
    });
  } catch (error) {
    logger.error('Error en getDescuentoById', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener el descuento',
      error: error.message
    });
  }
};

const createDescuento = async (req, res) => {
  try {
    const descuentoData = req.body;
    const descuento = await rrhhService.createDescuento(descuentoData);

    res.status(201).json({
      success: true,
      data: descuento,
      message: 'Descuento creado exitosamente'
    });
  } catch (error) {
    logger.error('Error en createDescuento', { body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al crear el descuento',
      error: error.message
    });
  }
};

const updateDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    const descuentoData = req.body;
    const descuento = await rrhhService.updateDescuento(id, descuentoData);

    res.status(200).json({
      success: true,
      data: descuento,
      message: 'Descuento actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error en updateDescuento', { id: req.params.id, body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el descuento',
      error: error.message
    });
  }
};

const deleteDescuento = async (req, res) => {
  try {
    const { id } = req.params;
    await rrhhService.deleteDescuento(id);

    res.status(200).json({
      success: true,
      message: 'Descuento eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error en deleteDescuento', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el descuento',
      error: error.message
    });
  }
};

// Controladores para bonos
const getAllBonos = async (req, res) => {
  try {
    const filters = {
      empleado_id: req.query.empleado_id,
      tipo: req.query.tipo,
      fecha_inicio: req.query.fecha_inicio,
      fecha_fin: req.query.fecha_fin
    };

    const bonos = await rrhhService.getAllBonos(filters);
    
    res.status(200).json({
      success: true,
      data: bonos,
      message: 'Bonos obtenidos exitosamente'
    });
  } catch (error) {
    logger.error('Error en getAllBonos', { error: error.message, query: req.query });
    res.status(500).json({
      success: false,
      message: 'Error al obtener los bonos',
      error: error.message
    });
  }
};

const getBonoById = async (req, res) => {
  try {
    const { id } = req.params;
    const bono = await rrhhService.getBonoById(id);

    if (!bono) {
      return res.status(404).json({
        success: false,
        message: 'Bono no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: bono,
      message: 'Bono obtenido exitosamente'
    });
  } catch (error) {
    logger.error('Error en getBonoById', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener el bono',
      error: error.message
    });
  }
};

const createBono = async (req, res) => {
  try {
    const bonoData = req.body;
    const bono = await rrhhService.createBono(bonoData);

    res.status(201).json({
      success: true,
      data: bono,
      message: 'Bono creado exitosamente'
    });
 } catch (error) {
    logger.error('Error en createBono', { body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al crear el bono',
      error: error.message
    });
  }
};

const updateBono = async (req, res) => {
  try {
    const { id } = req.params;
    const bonoData = req.body;
    const bono = await rrhhService.updateBono(id, bonoData);

    res.status(200).json({
      success: true,
      data: bono,
      message: 'Bono actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error en updateBono', { id: req.params.id, body: req.body, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el bono',
      error: error.message
    });
  }
};

const deleteBono = async (req, res) => {
  try {
    const { id } = req.params;
    await rrhhService.deleteBono(id);

    res.status(200).json({
      success: true,
      message: 'Bono eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error en deleteBono', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el bono',
      error: error.message
    });
  }
};

// Controlador para obtener planilla mensual
const getPlanillaMensual = async (req, res) => {
 try {
    const { mes, anio } = req.params;
    
    // Validar mes y año
    if (!mes || !anio || isNaN(mes) || isNaN(anio) || mes < 1 || mes > 12 || anio < 2000 || anio > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Mes y año deben ser números válidos (mes: 1-12, año: 2000-2100)'
      });
    }

    const planilla = await rrhhService.getPlanillaMensual(mes, anio);
    
    res.status(200).json({
      success: true,
      data: planilla,
      message: `Planilla mensual para ${mes}/${anio} obtenida exitosamente`
    });
  } catch (error) {
    logger.error('Error en getPlanillaMensual', { mes: req.params.mes, anio: req.params.anio, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener la planilla mensual',
      error: error.message
    });
  }
};

// Controlador para exportar planilla mensual a Excel
const exportPlanillaExcel = async (req, res) => {
  try {
    const { mes, anio } = req.params;
    
    // Validar mes y año
    if (!mes || !anio || isNaN(mes) || isNaN(anio) || mes < 1 || mes > 12 || anio < 2000 || anio > 2100) {
      return res.status(400).json({
        success: false,
        message: 'Mes y año deben ser números válidos (mes: 1-12, año: 2000-2100)'
      });
    }

    const buffer = await rrhhService.generatePlanillaExcel(mes, anio);
    
    res.status(200).json({
      success: true,
      message: `Planilla mensual para ${mes}/${anio} exportada exitosamente`,
      data: {
        filename: `planilla_${mes}_${anio}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: buffer.toString('base64') // Convertir buffer a base64 para transporte JSON
      }
    });
  } catch (error) {
    logger.error('Error en exportPlanillaExcel', { mes: req.params.mes, anio: req.params.anio, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al exportar la planilla mensual',
      error: error.message
    });
  }
};

module.exports = {
// Controladores para vacaciones
  getAllVacaciones,
  getVacacionById,
  createVacacion,
  updateVacacion,
  deleteVacacion,
  
  // Controladores para inasistencias
  getAllInasistencias,
  getInasistenciaById,
  createInasistencia,
  updateInasistencia,
  deleteInasistencia,
  
 // Controladores para descuentos
 getAllDescuentos,
  getDescuentoById,
  createDescuento,
  updateDescuento,
  deleteDescuento,
  
 // Controladores para bonos
  getAllBonos,
  getBonoById,
  createBono,
  updateBono,
  deleteBono,
  
  // Controladores para planilla
  getPlanillaMensual,
  exportPlanillaExcel
};