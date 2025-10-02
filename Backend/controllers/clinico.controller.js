const clinicoService = require('../services/clinico.service');
const { logger } = require('../middleware/logger');

// Controlador para módulo clínico
const clinicoController = {
  // ===== TRATAMIENTOS =====
  
  async getAllTratamientos(req, res) {
    try {
      const filters = {
        estado: req.query.estado,
        animal_id: req.query.animal_id,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin
      };

      const tratamientos = await clinicoService.getAllTratamientos(filters);
      
      res.status(200).json({
        success: true,
        data: tratamientos,
        count: tratamientos.length
      });
    } catch (error) {
      logger.error('Error obteniendo tratamientos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tratamientos',
        error: error.message
      });
    }
  },

  async getTratamientoById(req, res) {
    try {
      const { id } = req.params;
      const tratamiento = await clinicoService.getTratamientoById(id);
      
      if (!tratamiento) {
        return res.status(404).json({
          success: false,
          message: 'Tratamiento no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: tratamiento
      });
    } catch (error) {
      logger.error('Error obteniendo tratamiento por ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo tratamiento',
        error: error.message
      });
    }
  },

  async createTratamiento(req, res) {
    try {
      const nuevoTratamiento = await clinicoService.createTratamiento(req.body);
      
      res.status(201).json({
        success: true,
        data: nuevoTratamiento,
        message: 'Tratamiento creado exitosamente'
      });
    } catch (error) {
      logger.error('Error creando tratamiento:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creando tratamiento',
        error: error.message
      });
    }
  },

  async updateTratamiento(req, res) {
    try {
      const { id } = req.params;
      const tratamientoActualizado = await clinicoService.updateTratamiento(id, req.body);
      
      if (!tratamientoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Tratamiento no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        data: tratamientoActualizado,
        message: 'Tratamiento actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando tratamiento:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error actualizando tratamiento',
        error: error.message
      });
    }
  },

  async deleteTratamiento(req, res) {
    try {
      const { id } = req.params;
      const resultado = await clinicoService.deleteTratamiento(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Tratamiento no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Tratamiento eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando tratamiento:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error eliminando tratamiento',
        error: error.message
      });
    }
  },

  async getEstadisticasTratamientos(req, res) {
    try {
      const estadisticas = await clinicoService.getEstadisticasTratamientos();
      
      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de tratamientos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  },

  // ===== COMPATIBILIDAD CON REGISTROS CLÍNICOS =====
  
  async getAllRegistros(req, res) {
    return this.getAllTratamientos(req, res);
  },

  async createRegistro(req, res) {
    return this.createTratamiento(req, res);
  },

  async getRegistroById(req, res) {
    return this.getTratamientoById(req, res);
  },

  async updateRegistro(req, res) {
    return this.updateTratamiento(req, res);
  },

  async deleteRegistro(req, res) {
    return this.deleteTratamiento(req, res);
  }
};

module.exports = clinicoController;