const userService = require('../services/user.service');
const { logger } = require('../middleware/logger');

// Controlador para gestión de usuarios (solo administradores)
const userController = {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo usuarios',
        error: error.message
      });
    }
  },

  async createUser(req, res) {
    try {
      const nuevoUsuario = await userService.createUser(req.body);
      res.status(201).json({
        success: true,
        data: nuevoUsuario,
        message: 'Usuario creado exitosamente'
      });
    } catch (error) {
      logger.error('Error creando usuario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creando usuario',
        error: error.message
      });
    }
  },

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await userService.getUserById(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      logger.error('Error obteniendo usuario por ID:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo usuario',
        error: error.message
      });
    }
  },

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const usuarioActualizado = await userService.updateUser(id, req.body);

      if (!usuarioActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: usuarioActualizado,
        message: 'Usuario actualizado exitosamente'
      });
    } catch (error) {
      logger.error('Error actualizando usuario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error actualizando usuario',
        error: error.message
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const resultado = await userService.deleteUser(id);

      if (!resultado) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando usuario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error eliminando usuario',
        error: error.message
      });
    }
  },

  async changeUserRole(req, res) {
    try {
      const { id } = req.params;
      const { rol } = req.body;

      if (!rol) {
        return res.status(400).json({
          success: false,
          message: 'El rol es requerido'
        });
      }

      const usuarioActualizado = await userService.changeUserRole(id, rol);

      if (!usuarioActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: usuarioActualizado,
        message: 'Rol de usuario cambiado exitosamente'
      });
    } catch (error) {
      logger.error('Error cambiando rol de usuario:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error cambiando rol de usuario',
        error: error.message
      });
    }
  }
};

module.exports = userController;