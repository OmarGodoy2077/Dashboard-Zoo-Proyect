const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const writeLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    meta,
    pid: process.pid
  };

  const logString = JSON.stringify(logEntry) + '\n';
  
  // Log a consola
  console.log(`[${timestamp}] ${level}: ${message}`, meta);
  
  // Log a archivo en producción
  if (process.env.NODE_ENV === 'production') {
    const logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logString);
  }
};

const logger = {
  error: (message, meta) => writeLog('ERROR', message, meta),
  warn: (message, meta) => writeLog('WARN', message, meta),
  info: (message, meta) => writeLog('INFO', message, meta),
  debug: (message, meta) => writeLog('DEBUG', message, meta)
};

// Middleware para logging de requests
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, url, ip, headers } = req;
  
  // Log de request entrante
  logger.info(`${method} ${url}`, {
    ip,
    userAgent: headers['user-agent'],
    requestId: req.headers['x-request-id'] || 'no-id'
  });
  
  // Capturar respuesta
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    
    logger.info(`${method} ${url} - ${statusCode}`, {
      duration: `${duration}ms`,
      statusCode,
      ip,
      requestId: req.headers['x-request-id'] || 'no-id'
    });
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
};