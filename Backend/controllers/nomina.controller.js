const nominaService = require('../services/nomina.service');
const { logger } = require('../middleware/logger');

// Controlador para nóminas
const nominaController = {
  async getAllNominas(req, res) {
    try {
      const nominas = await nominaService.getAllNominas();
      res.status(200).json({
        success: true,
        data: nominas
      });
    } catch (error) {
      logger.error('Error obteniendo nóminas:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo nóminas',
        error: error.message
      });
    }
  },

  async createNomina(req, res) {
    try {
      const nuevaNomina = await nominaService.createNomina(req.body);
      res.status(201).json({
        success: true,
        data: nuevaNomina,
        message: 'Nómina creada exitosamente'
      });
    } catch (error) {
      logger.error('Error creando nómina:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creando nómina',
        error: error.message
      });
    }
  },

  async getNominaById(req, res) {
    try {
      const { id } = req.params;
      const nomina = await nominaService.getNominaById(id);
      
      if (!nomina) {
        return res.status(404).json({
          success: false,
          message: 'Nómina no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        data: nomina
      });
    } catch (error) {
      logger.error('Error obteniendo nómina por ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo nómina',
        error: error.message
      });
    }
  },

  async updateNomina(req, res) {
    try {
      const { id } = req.params;
      const nominaActualizada = await nominaService.updateNomina(id, req.body);
      
      if (!nominaActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Nómina no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        data: nominaActualizada,
        message: 'Nómina actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando nómina:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error actualizando nómina',
        error: error.message
      });
    }
  },

  async deleteNomina(req, res) {
    try {
      const { id } = req.params;
      const resultado = await nominaService.deleteNomina(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Nómina no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Nómina eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando nómina:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error eliminando nómina',
        error: error.message
      });
    }
  }
};

module.exports = nominaController;