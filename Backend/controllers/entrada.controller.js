const entradaService = require('../services/entrada.service');
const { logger } = require('../middleware/logger');

// Controlador para entradas
const entradaController = {
  async getAllEntradas(req, res) {
    try {
      logger.info('getAllEntradas called', { query: req.query, user: req.user?.id });
      
      const filters = {
        tipo_ticket: req.query.tipo_ticket,
        metodo_pago: req.query.metodo_pago,
        fecha_venta: req.query.fecha_venta,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const entradas = await entradaService.getAllEntradas(filters);
      
      logger.info('Entradas fetched successfully', { count: entradas.length });
      
      res.status(200).json({
        success: true,
        data: entradas,
        count: entradas.length
      });
    } catch (error) {
      logger.error('Error obteniendo entradas:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo entradas',
        error: error.message
      });
    }
  },

  async getEstadisticas(req, res) {
    try {
      const { fecha_inicio, fecha_fin } = req.query;
      const stats = await entradaService.getEstadisticas(fecha_inicio, fecha_fin);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de entradas:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  },

  async createEntrada(req, res) {
    try {
      const nuevaEntrada = await entradaService.createEntrada(req.body);
      res.status(201).json({
        success: true,
        data: nuevaEntrada,
        message: 'Entrada creada exitosamente'
      });
    } catch (error) {
      logger.error('Error creando entrada:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creando entrada',
        error: error.message
      });
    }
  },

  async getEntradaById(req, res) {
    try {
      const { id } = req.params;
      const entrada = await entradaService.getEntradaById(id);
      
      if (!entrada) {
        return res.status(404).json({
          success: false,
          message: 'Entrada no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        data: entrada
      });
    } catch (error) {
      logger.error('Error obteniendo entrada por ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo entrada',
        error: error.message
      });
    }
  },

  async updateEntrada(req, res) {
    try {
      const { id } = req.params;
      const entradaActualizada = await entradaService.updateEntrada(id, req.body);
      
      if (!entradaActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Entrada no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        data: entradaActualizada,
        message: 'Entrada actualizada exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando entrada:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error actualizando entrada',
        error: error.message
      });
    }
  },

  async deleteEntrada(req, res) {
    try {
      const { id } = req.params;
      const resultado = await entradaService.deleteEntrada(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Entrada no encontrada'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Entrada eliminada exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando entrada:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error eliminando entrada',
        error: error.message
      });
    }
  }
};

module.exports = entradaController;