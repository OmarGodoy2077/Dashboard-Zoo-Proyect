const authService = require('./authService');
const { logger } = require('../middleware/logger');

// Servicio para gestión de usuarios (solo para administradores)
const userService = {
  async getAllUsers() {
    try {
      logger.info('Obteniendo todos los usuarios');
      const users = await authService.getAllUsers();
      // Excluir contraseñas por seguridad
      return users.map(user => ({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        fecha_creacion: user.fecha_creacion,
        fecha_actualizacion: user.fecha_actualizacion
      }));
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error.message);
      throw error;
    }
  },

  async createUser(data) {
    try {
      logger.info('Creando nuevo usuario', { data: { ...data, password: '[REDACTED]' } });
      const user = await authService.createUser(data);
      // Excluir contraseña
      const { contraseña_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Error creando usuario:', error.message);
      throw error;
    }
  },

  async getUserById(id) {
    try {
      logger.info('Obteniendo usuario por ID', { id });
      const user = await authService.getUserById(id);
      if (user) {
        const { contraseña_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      logger.error('Error obteniendo usuario por ID:', error.message);
      throw error;
    }
  },

  async updateUser(id, data) {
    try {
      logger.info('Actualizando usuario', { id, data });
      const updatedUser = await authService.updateUser(id, data);
      if (updatedUser) {
        const { contraseña_hash, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      logger.error('Error actualizando usuario:', error.message);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      logger.info('Eliminando usuario', { id });
      return await authService.deleteUser(id);
    } catch (error) {
      logger.error('Error eliminando usuario:', error.message);
      throw error;
    }
  },

  async changeUserRole(id, newRole) {
    try {
      logger.info('Cambiando rol de usuario', { id, newRole });
      return await authService.updateUser(id, { rol: newRole });
    } catch (error) {
      logger.error('Error cambiando rol de usuario:', error.message);
      throw error;
    }
  }
};

module.exports = userService;