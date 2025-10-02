const inventarioService = require('../services/inventario.service');
const { logger } = require('../middleware/logger');

// Controlador para inventario
const inventarioController = {
  async getAllItems(req, res) {
    try {
      const items = await inventarioService.getAllItems();
      res.status(200).json({
        success: true,
        data: items
      });
    } catch (error) {
      logger.error('Error obteniendo items de inventario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo items de inventario',
        error: error.message
      });
    }
  },

  async createItem(req, res) {
    try {
      const nuevoItem = await inventarioService.createItem(req.body);
      res.status(201).json({
        success: true,
        data: nuevoItem,
        message: 'Item de inventario creado exitosamente'
      });
    } catch (error) {
      logger.error('Error creando item de inventario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creando item de inventario',
        error: error.message
      });
    }
  },

  async getItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await inventarioService.getItemById(id);
      
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item de inventario no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: item
      });
    } catch (error) {
      logger.error('Error obteniendo item de inventario por ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo item de inventario',
        error: error.message
      });
    }
  },

  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const itemActualizado = await inventarioService.updateItem(id, req.body);
      
      if (!itemActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Item de inventario no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: itemActualizado,
        message: 'Item de inventario actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando item de inventario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error actualizando item de inventario',
        error: error.message
      });
    }
  },

  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const resultado = await inventarioService.deleteItem(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Item de inventario no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Item de inventario eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando item de inventario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error eliminando item de inventario',
        error: error.message
      });
    }
  }
};

module.exports = inventarioController;