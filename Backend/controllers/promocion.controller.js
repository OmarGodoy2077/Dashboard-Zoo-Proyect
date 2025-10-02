const promocionService = require('../services/promocion.service');
const { logger } = require('../middleware/logger');

// Controlador para promociones
const promocionController = {
  async getAllPromociones(req, res) {
    try {
      const promociones = await promocionService.getAllPromociones();
      res.status(200).json({
        success: true,
        data: promociones
      });
    } catch (error) {
      logger.error('Error obteniendo promociones:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo promociones',
        error: error.message
      });
    }
  },

  async createPromocion(req, res) {
    try {
      const nuevaPromocion = await promocionService.createPromocion(req.body);
      res.status(201).json({
        success: true,
        data: nuevaPromocion,
        message: 'Promoción creada exitosamente'
      });
    } catch (error) {
      logger.error('Error creando promoción:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creando promoción',
        error: error.message
      });
    }
  },

  async getPromocionById(req, res) {
    try {
      const { id } = req.params;
      const promocion = await promocionService.getPromocionById(id);
      
      if (!promocion) {
        return res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        data: promocion
      });
    } catch (error) {
      logger.error('Error obteniendo promoción por ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo promoción',
        error: error.message
      });
    }
  },

  async updatePromocion(req, res) {
    try {
      const { id } = req.params;
      const promocionActualizada = await promocionService.updatePromocion(id, req.body);
      
      if (!promocionActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        data: promocionActualizada,
        message: 'Promoción actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando promoción:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error actualizando promoción',
        error: error.message
      });
    }
  },

  async deletePromocion(req, res) {
    try {
      const { id } = req.params;
      const resultado = await promocionService.deletePromocion(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Promoción no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Promoción eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando promoción:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error eliminando promoción',
        error: error.message
      });
    }
  }
};

module.exports = promocionController;