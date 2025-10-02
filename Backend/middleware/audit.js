const { logger } = require('./logger');
const { getSupabaseClient } = require('../config/database');

/**
 * Middleware de auditoría para registrar todas las acciones de los usuarios
 */
const auditLogger = async (req, res, next) => {
  // Guardar el método original de res.json
  const originalJson = res.json.bind(res);

  // Capturar el tiempo de inicio
  const startTime = Date.now();

  // Sobrescribir res.json para capturar la respuesta
  res.json = function(body) {
    const responseTime = Date.now() - startTime;
    
    // Registrar la auditoría de forma asíncrona (no bloquear la respuesta)
    setImmediate(async () => {
      try {
        const auditData = {
          user_id: req.user?.userId || null,
          user_email: req.user?.email || 'anonymous',
          user_rol: req.user?.rol || 'guest',
          action: `${req.method} ${req.originalUrl}`,
          resource: extractResource(req.originalUrl),
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.headers['user-agent'],
          request_method: req.method,
          request_path: req.originalUrl,
          request_body: sanitizeBody(req.body),
          response_status: res.statusCode,
          response_time_ms: responseTime,
          success: res.statusCode < 400,
          timestamp: new Date().toISOString(),
        };

        // Guardar en base de datos (si existe la tabla)
        const supabase = getSupabaseClient();
        await supabase.from('audit_logs').insert([auditData]);

        // También registrar en logs
        logger.info('Audit Log', {
          user: auditData.user_email,
          action: auditData.action,
          status: auditData.response_status,
          responseTime: `${responseTime}ms`,
        });
      } catch (error) {
        logger.error('Error saving audit log:', error);
      }
    });

    // Llamar al método original
    return originalJson(body);
  };

  next();
};

/**
 * Extrae el recurso de la URL
 */
function extractResource(url) {
  const parts = url.split('/').filter(Boolean);
  if (parts.length >= 2 && parts[0] === 'api') {
    return parts[1];
  }
  return 'unknown';
}

/**
 * Sanitiza el body para no guardar información sensible
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'contraseña', 'token', 'secret', 'currentPassword', 'newPassword'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Crea la tabla de auditoría si no existe
 */
async function createAuditTable() {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase.rpc('create_audit_table', {
      table_sql: `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          user_email VARCHAR(255),
          user_rol VARCHAR(50),
          action VARCHAR(255) NOT NULL,
          resource VARCHAR(100),
          ip_address VARCHAR(45),
          user_agent TEXT,
          request_method VARCHAR(10),
          request_path VARCHAR(500),
          request_body JSONB,
          response_status INTEGER,
          response_time_ms INTEGER,
          success BOOLEAN DEFAULT true,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource);
      `
    });

    if (error) {
      logger.warn('Audit table might already exist or RPC not available');
    } else {
      logger.info('Audit table created successfully');
    }
  } catch (error) {
    logger.warn('Could not create audit table:', error.message);
  }
}

/**
 * Obtiene logs de auditoría con filtros
 */
async function getAuditLogs(filters = {}) {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (filters.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters.resource) {
    query = query.eq('resource', filters.resource);
  }

  if (filters.start_date) {
    query = query.gte('timestamp', filters.start_date);
  }

  if (filters.end_date) {
    query = query.lte('timestamp', filters.end_date);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Error fetching audit logs: ${error.message}`);
  }

  return data;
}

module.exports = {
  auditLogger,
  createAuditTable,
  getAuditLogs,
};
