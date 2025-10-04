const authService = require('../services/authService');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwtUtils');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../middleware/logger');

const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await authService.getUserByEmail(email);
    if (existingUser) {
      return next(new AppError('El usuario ya existe con este email', 400));
    }

    // Crear el nuevo usuario
    const user = await authService.createUser({ 
      nombre, 
      email, 
      password, 
      rol: rol || 'empleado' 
    });
    
    // Generar token
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      rol: user.rol,
      nombre: user.nombre
    });

    logger.info('User registered successfully', { 
      userId: user.id, 
      email: user.email, 
      rol: user.rol 
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          fecha_creacion: user.fecha_creacion
        },
        token
      }
    });
  } catch (error) {
    logger.error('Error in user registration', { 
      email: req.body.email, 
      error: error.message 
    });
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por email
    const user = await authService.getUserByEmail(email);
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      return next(new AppError('Credenciales inválidas', 401));
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.contraseña_hash);
    if (!isMatch) {
      logger.warn('Login attempt with wrong password', { email });
      return next(new AppError('Credenciales inválidas', 401));
    }

    // Generar token
    const token = generateToken({ 
      userId: user.id, 
      email: user.email, 
      rol: user.rol,
      nombre: user.nombre
    });

    logger.info('User logged in successfully', { 
      userId: user.id, 
      email: user.email 
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        },
        token
      }
    });
  } catch (error) {
    logger.error('Error in user login', { 
      email: req.body.email, 
      error: error.message 
    });
    next(error);
  }
};

const logout = (req, res) => {
  logger.info('User logged out', { userId: req.user?.id });
  res.json({ 
    success: true,
    message: 'Sesión cerrada exitosamente' 
  });
};

const getProfile = async (req, res, next) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware auth
    const user = await authService.getUserById(req.user.id);
    
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          fecha_creacion: user.fecha_creacion,
          fecha_actualizacion: user.fecha_actualizacion
        }
      }
    });
  } catch (error) {
    logger.error('Error getting user profile', { 
      userId: req.user?.id, 
      error: error.message 
    });
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { nombre, email } = req.body;
    const userId = req.user.id;

    // Verificar si el nuevo email ya existe (si se está cambiando)
    if (email && email !== req.user.email) {
      const existingUser = await authService.getUserByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return next(new AppError('El email ya está en uso por otro usuario', 400));
      }
    }

    const updatedUser = await authService.updateUser(userId, { nombre, email });
    
    if (!updatedUser) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    logger.info('User profile updated', { userId, changes: { nombre, email } });

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: {
          id: updatedUser.id,
          nombre: updatedUser.nombre,
          email: updatedUser.email,
          rol: updatedUser.rol,
          fecha_actualizacion: updatedUser.fecha_actualizacion
        }
      }
    });
  } catch (error) {
    logger.error('Error updating user profile', { 
      userId: req.user?.id, 
      error: error.message 
    });
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Obtener usuario actual
    const user = await authService.getUserById(userId);
    if (!user) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.contraseña_hash);
    if (!isCurrentPasswordValid) {
      return next(new AppError('Contraseña actual incorrecta', 400));
    }

    // Actualizar contraseña
    await authService.updatePassword(userId, newPassword);

    logger.info('User password changed', { userId });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error changing password', { 
      userId: req.user?.id, 
      error: error.message 
    });
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token es requerido', 401));
    }

    const result = await authService.refreshToken(refreshToken);

    logger.info('Token refreshed successfully');

    res.json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    logger.error('Error refreshing token', { error: error.message });
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken
};