const { logger } = require('./logger');

/**
 * Middleware para validar el Content-Type en requests con body
 */
const validateContentType = (req, res, next) => {
  // Solo validar para métodos que típicamente tienen body
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    // Si no hay Content-Type y hay un body, advertir
    if (!contentType && req.headers['content-length'] !== '0') {
      logger.warn('Request sin Content-Type header', {
        method: req.method,
        url: req.url,
        headers: req.headers
      });
      
      return res.status(400).json({
        success: false,
        message: 'Falta el header Content-Type. Para enviar JSON, debe ser application/json',
        hint: 'Asegúrate de agregar el header: Content-Type: application/json'
      });
    }
    
    // Si el Content-Type no es application/json para rutas API
    if (contentType && 
        req.path.startsWith('/api/') && 
        !contentType.includes('application/json') && 
        !contentType.includes('application/x-www-form-urlencoded') &&
        !contentType.includes('multipart/form-data')) {
      
      logger.warn('Content-Type incorrecto para API request', {
        method: req.method,
        url: req.url,
        contentType: contentType
      });
      
      return res.status(400).json({
        success: false,
        message: `Content-Type incorrecto: ${contentType}. Para rutas API, usa application/json`,
        hint: 'Cambia el header a: Content-Type: application/json'
      });
    }
  }
  
  next();
};

/**
 * Middleware para capturar errores de parsing de body
 */
const bodyParserErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('Body Parser Error', {
      message: err.message,
      type: err.type,
      url: req.url,
      method: req.method,
      contentType: req.get('Content-Type')
    });
    
    // Intentar dar un mensaje más específico según el error
    let message = 'Error al parsear el body de la request';
    let hints = [];
    
    if (err.message.includes('JSON')) {
      message = 'JSON malformado';
      hints = [
        'Verifica que el JSON esté correctamente formateado',
        'No debe haber comas finales (trailing commas)',
        'Usa comillas dobles para strings, no simples',
        'No debe haber caracteres extra después del cierre }',
        'Verifica que el Content-Type sea application/json'
      ];
    } else if (err.message.includes('urlencoded')) {
      message = 'Error en los datos URL-encoded';
      hints = [
        'Verifica el formato de los datos URL-encoded',
        'Asegúrate de que el Content-Type sea application/x-www-form-urlencoded'
      ];
    }
    
    return res.status(400).json({
      success: false,
      message: message,
      error: err.message,
      hints: hints,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          type: err.type,
          position: err.message.match(/position (\d+)/)?.[1],
          line: err.message.match(/line (\d+)/)?.[1],
          column: err.message.match(/column (\d+)/)?.[1]
        }
      })
    });
  }
  
  next(err);
};

/**
 * Middleware para registrar el body de las requests (solo en desarrollo)
 * Oculta información sensible como contraseñas
 */
const logRequestBody = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.body) {
    // Crear copia del body para no modificar el original
    const sanitizedBody = { ...req.body };
    
    // Ocultar campos sensibles
    const sensitiveFields = ['password', 'contrasena', 'token', 'secret', 'apiKey'];
    sensitiveFields.forEach(field => {
      if (sanitizedBody[field]) {
        sanitizedBody[field] = '***HIDDEN***';
      }
    });
    
    logger.debug('Request Body', {
      url: req.url,
      method: req.method,
      body: sanitizedBody,
      contentType: req.get('Content-Type')
    });
  }
  next();
};

module.exports = {
  validateContentType,
  bodyParserErrorHandler,
  logRequestBody
};
