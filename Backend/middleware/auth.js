const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');

const auth = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Acceso denegado. No se proporcionó header de autorización.' });
    }
    
    // Verificar que el header tiene el formato correcto
    if (!authHeader.startsWith('Bearer ')) {
      logger.warn('Formato de token incorrecto', { authHeader });
      return res.status(401).json({ message: 'Formato de token inválido. Debe ser "Bearer <token>".' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_zoologico_jungle_planet_secreto_2024_backend_jwt_key');
     
    // Obtener usuario desde la base de datos
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, nombre, email, rol')
      .eq('id', decoded.userId)
      .single();
     
    if (error || !user) {
      logger.warn('Usuario no encontrado en la base de datos', { userId: decoded.userId, error });
      return res.status(401).json({ message: 'Token no válido. Usuario no encontrado.' });
    }
     
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Token expirado', { error: error.message });
      return res.status(401).json({ message: 'Token expirado.' });
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Token inválido', { error: error.message });
      return res.status(401).json({ message: 'Token inválido. El token no pudo ser verificado.' });
    } else if (error.name === 'NotBeforeError') {
      logger.warn('Token no activo aún', { error: error.message });
      return res.status(401).json({ message: 'Token aún no activo.' });
    } else {
      logger.error('Error en autenticación', { error: error.message });
      return res.status(401).json({ message: 'Token no válido.' });
    }
 }
};

// Middleware para verificar roles
const authorize = (...roles) => {
   return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Acceso denegado. Autenticación requerida.' });
    }
     
    if (!roles.includes(req.user.rol)) {
      logger.warn('Acceso denegado por rol', { userId: req.user.id, rol: req.user.rol, requiredRoles: roles });
      return res.status(403).json({ message: 'Acceso denegado. Permisos insuficientes.' });
    }
     
    next();
  };
};

module.exports = {
  auth,
  authorize
};