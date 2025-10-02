// Servicio de autenticación para Jungle Planet Zoo Management System

const { supabase } = require('../config/database');
const bcrypt = require('bcrypt');
const { logger } = require('../middleware/logger');
const { generateToken, generateRefreshToken } = require('../utils/jwtUtils');

const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
     
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }
     
    return data;
  } catch (error) {
    logger.error('Error getting user by email', { email, error: error.message });
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
     
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
     
    return data;
  } catch (error) {
    logger.error('Error getting user by id', { id, error: error.message });
    throw error;
  }
};

const createUser = async (userData) => {
  try {
    const { nombre, email, password, rol } = userData;
     
    // Encriptar la contraseña
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
     
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nombre,
        email,
        contraseña_hash: hashedPassword,
        rol: rol || 'empleado'
      }])
      .select('id, nombre, email, rol, fecha_creacion')
      .single();
     
    if (error) {
      throw error;
    }
     
    logger.info('User created successfully', { userId: data.id, email, rol });
    return data;
  } catch (error) {
    logger.error('Error creating user', { userData: { ...userData, password: '[HIDDEN]' }, error: error.message });
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    const { nombre, email, rol } = userData;
     
    // Preparar objeto de actualización con solo campos definidos
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (email !== undefined) updateData.email = email;
    if (rol !== undefined) updateData.rol = rol;
    updateData.fecha_actualizacion = new Date().toISOString();
     
    const { data, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', userId)
      .select('id, nombre, email, rol, fecha_actualizacion')
      .single();
     
    if (error) {
      throw error;
    }
     
    logger.info('User updated successfully', { userId, changes: userData });
    return data;
  } catch (error) {
    logger.error('Error updating user', { userId, userData, error: error.message });
    throw error;
  }
};

const updatePassword = async (userId, newPassword) => {
  try {
    // Encriptar la nueva contraseña
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
     
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        contraseña_hash: hashedPassword,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id')
      .single();
     
    if (error) {
      throw error;
    }
     
    logger.info('User password updated successfully', { userId });
    return data;
  } catch (error) {
    logger.error('Error updating password', { userId, error: error.message });
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', userId)
      .select('id, email')
      .single();
     
    if (error) {
      throw error;
    }
     
    logger.info('User deleted successfully', { userId, email: data.email });
    return { message: 'Usuario eliminado exitosamente' };
  } catch (error) {
    logger.error('Error deleting user', { userId, error: error.message });
    throw error;
  }
};

const getAllUsers = async (filters = {}) => {
  try {
    let query = supabase
      .from('usuarios')
      .select('id, nombre, email, rol, fecha_creacion, fecha_actualizacion');

    // Filtros opcionales
    if (filters.rol) {
      query = query.eq('rol', filters.rol);
    }

    if (filters.search) {
      query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    // Ordenamiento
    const sortBy = filters.sortBy || 'fecha_creacion';
    const sortOrder = filters.sortOrder === 'ASC' ? { ascending: true } : { ascending: false };
    query = query.order(sortBy, sortOrder);

    // Paginación
    if (filters.limit) {
      query = query.limit(parseInt(filters.limit));

      if (filters.offset) {
        query = query.range(parseInt(filters.offset), parseInt(filters.offset) + parseInt(filters.limit) - 1);
      }
    }

    const { data, error } = await query;
     
    if (error) {
      throw error;
    }
     
    return data;
  } catch (error) {
    logger.error('Error getting all users', { filters, error: error.message });
    throw error;
  }
};

// Función para autenticar usuario y generar tokens
const authenticateUser = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.contraseña_hash);
    
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar tokens
    const accessToken = generateToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    logger.info('User authenticated successfully', { userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    logger.error('Error authenticating user', { email, error: error.message });
    throw error;
  }
};

// Función para refrescar token
const refreshToken = async (refreshToken) => {
  try {
    const { refreshAccessToken } = require('../utils/jwtUtils');
    const newAccessToken = refreshAccessToken(refreshToken);
    
    return {
      accessToken: newAccessToken
    };
  } catch (error) {
    logger.error('Error refreshing token', { error: error.message });
    throw error;
  }
};

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
  getAllUsers,
  authenticateUser,
  refreshToken
};