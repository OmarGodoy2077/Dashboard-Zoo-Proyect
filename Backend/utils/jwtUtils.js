const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Almacenamiento simple de refresh tokens (en producción usar Redis o base de datos)
let refreshTokens = {};

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign({ ...payload, jti: uuidv4() }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
  
  // Almacenar el refresh token
  refreshTokens[refreshToken] = {
    userId: payload.userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 1000) // 7 días
  };
  
  return refreshToken;
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'mi_zoologico_jungle_planet_secreto_2024_backend_jwt_key');
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh');
    // Verificar que el refresh token esté en nuestro almacenamiento
    if (!refreshTokens[refreshToken] || refreshTokens[refreshToken].userId !== decoded.userId) {
      throw new Error('Refresh token inválido');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

const revokeRefreshToken = (refreshToken) => {
  delete refreshTokens[refreshToken];
};

const refreshAccessToken = (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  // Generar nuevo access token
  const newAccessToken = generateToken({ userId: decoded.userId });
  return newAccessToken;
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  revokeRefreshToken,
  refreshAccessToken
};