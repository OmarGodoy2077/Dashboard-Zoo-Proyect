const dietaService = require('../services/dieta.service');
const { logger } = require('../middleware/logger');

// Controlador para módulo de dietas
const dietaController = {
  // Obtener todos los horarios de alimentación
  async getAllHorarios(req, res) {
    try {
      const filters = {
        animal_id: req.query.animal_id,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      };

      const horarios = await dietaService.getAllHorarios(filters);

      res.status(200).json({
        success: true,
        data: horarios,
        count: horarios.length
      });
    } catch (error) {
      logger.error('Error obteniendo horarios de alimentación:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo horarios de alimentación',
        error: error.message
      });
    }
  },

  // Obtener horarios por animal
  async getHorariosByAnimal(req, res) {
    try {
      const { animalId } = req.params;
      const horarios = await dietaService.getHorariosByAnimal(animalId);

      res.status(200).json({
        success: true,
        data: horarios
      });
    } catch (error) {
      logger.error('Error obteniendo horarios por animal:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo horarios por animal',
        error: error.message
      });
    }
  },

  // Obtener horario por ID
  async getHorarioById(req, res) {
    try {
      const { id } = req.params;
      const horario = await dietaService.getHorarioById(id);

      if (!horario) {
        return res.status(404).json({
          success: false,
          message: 'Horario de alimentación no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: horario
      });
    } catch (error) {
      logger.error('Error obteniendo horario por ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo horario de alimentación',
        error: error.message
      });
    }
  },

  // Crear nuevo horario de alimentación
  async createHorario(req, res) {
    try {
      const horario = await dietaService.createHorario(req.body);

      res.status(201).json({
        success: true,
        message: 'Horario de alimentación creado exitosamente',
        data: horario
      });
    } catch (error) {
      logger.error('Error creando horario de alimentación:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creando horario de alimentación',
        error: error.message
      });
    }
  },

  // Actualizar horario de alimentación
  async updateHorario(req, res) {
    try {
      const { id } = req.params;
      const horario = await dietaService.updateHorario(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Horario de alimentación actualizado exitosamente',
        data: horario
      });
    } catch (error) {
      logger.error('Error actualizando horario de alimentación:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error actualizando horario de alimentación',
        error: error.message
      });
    }
  },

  // Eliminar horario de alimentación
  async deleteHorario(req, res) {
    try {
      const { id } = req.params;
      await dietaService.deleteHorario(id);

      res.status(200).json({
        success: true,
        message: 'Horario de alimentación eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando horario de alimentación:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error eliminando horario de alimentación',
        error: error.message
      });
    }
  },

  // Obtener estadísticas de dietas
  async getEstadisticasDietas(req, res) {
    try {
      const estadisticas = await dietaService.getEstadisticasDietas();

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de dietas:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de dietas',
        error: error.message
      });
    }
  }
};

module.exports = dietaController;