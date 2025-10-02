const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { logger } = require('./logger');

// Rate limiter general
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiter más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por ventana
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación, por favor intenta de nuevo en 15 minutos.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body.email || 'unknown'
    });
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de autenticación, por favor intenta de nuevo en 15 minutos.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiter para endpoints de creación
const createLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 creaciones por minuto
  message: {
    success: false,
    message: 'Demasiadas solicitudes de creación, por favor espera un momento.',
    code: 'CREATE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para dashboard y reportes
const dashboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // máximo 30 requests al dashboard por minuto
  message: {
    success: false,
    message: 'Demasiadas solicitudes al dashboard, intenta nuevamente en 1 minuto.',
    code: 'DASHBOARD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Dashboard rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes al dashboard, intenta nuevamente en 1 minuto.',
      code: 'DASHBOARD_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiter para operaciones sensibles
const sensitiveOperationsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 operaciones sensibles por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de modificación, intenta nuevamente en 5 minutos.',
    code: 'SENSITIVE_OPERATIONS_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Sensitive operations rate limit exceeded', {
      ip: req.ip,
      method: req.method,
      path: req.path
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas operaciones de modificación, intenta nuevamente en 5 minutos.',
      code: 'SENSITIVE_OPERATIONS_LIMIT_EXCEEDED'
    });
  }
});

// Slow down middleware para requests frecuentes
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // permitir 50 requests a velocidad completa
  delayMs: 500, // agregar 500ms de delay por request después del límite
  maxDelayMs: 20000, // máximo delay de 20 segundos
  headers: true,
  onLimitReached: (req, res, options) => {
    logger.warn('Speed limit reached', {
      ip: req.ip,
      delay: options.delay,
      path: req.path
    });
  }
});

// Rate limiter para búsquedas
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20, // máximo 20 búsquedas por minuto
  message: {
    success: false,
    message: 'Demasiadas búsquedas, intenta nuevamente en 1 minuto.',
    code: 'SEARCH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Search rate limit exceeded', {
      ip: req.ip,
      query: req.query
    });
    res.status(429).json({
      success: false,
      message: 'Demasiadas búsquedas, intenta nuevamente en 1 minuto.',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  dashboardLimiter,
  sensitiveOperationsLimiter,
  speedLimiter,
  searchLimiter
};