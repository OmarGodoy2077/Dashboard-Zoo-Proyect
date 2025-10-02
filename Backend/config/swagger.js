const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jungle Planet Zoo Management System API',
      version: '1.0.0',
      description: 'API completa para el sistema de gestión del zoológico Jungle Planet',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'desarrollo@jungleplanet.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.jungleplanet.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' ? 'Servidor de Producción' : 'Servidor de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso faltante o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Token no válido' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado por permisos insuficientes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Permisos insuficientes' }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Recurso no encontrado' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación de datos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Errores de validación' }
                }
              }
            }
          }
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', format: 'email', example: 'juan@example.com' },
            rol: { type: 'string', enum: ['admin', 'empleado', 'veterinario', 'contador'], example: 'empleado' },
            fecha_creacion: { type: 'string', format: 'date-time' },
            fecha_actualizacion: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'nombre', 'email', 'rol']
        },
        Animal: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Simba' },
            especie: { type: 'string', example: 'León Africano' },
            habitat: { type: 'string', example: 'Sabana' },
            dieta: { type: 'string', example: 'Carne, pollo' },
            estado_salud: { type: 'string', enum: ['sano', 'enfermo', 'en tratamiento'], example: 'sano' },
            veterinario_id: { type: 'integer', example: 2 },
            fecha_nacimiento: { type: 'string', format: 'date' },
            sexo: { type: 'string', enum: ['macho', 'hembra', 'desconocido'], example: 'macho' },
            peso: { type: 'number', format: 'float', example: 180.5 },
            altura: { type: 'number', format: 'float', example: 1.2 },
            observaciones: { type: 'string' },
            fecha_registro: { type: 'string', format: 'date-time' },
            fecha_actualizacion: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'nombre', 'especie']
        },
        Alimento: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Carne de res' },
            tipo: { type: 'string', example: 'carnivoro' },
            descripcion: { type: 'string' },
            unidad_medida: { type: 'string', enum: ['kg', 'g', 'litros', 'ml', 'unidades'], example: 'kg' },
            stock_actual: { type: 'number', format: 'float', example: 100.0 },
            stock_minimo: { type: 'number', format: 'float', example: 20.0 },
            proveedor_id: { type: 'integer', example: 1 },
            precio_unitario: { type: 'number', format: 'float', example: 30.00 },
            fecha_registro: { type: 'string', format: 'date-time' },
            fecha_actualizacion: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'nombre', 'tipo', 'unidad_medida']
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints para autenticación y gestión de usuarios'
      },
      {
        name: 'Animales',
        description: 'Gestión de animales del zoológico'
      },
      {
        name: 'Alimentos',
        description: 'Gestión de alimentos y stock'
      },
      {
        name: 'Limpieza',
        description: 'Gestión de tareas de limpieza'
      },
      {
        name: 'Clínico',
        description: 'Control clínico y tratamientos veterinarios'
      },
      {
        name: 'Empleados',
        description: 'Gestión de recursos humanos'
      },
      {
        name: 'Inventario',
        description: 'Control de inventario y productos'
      },
      {
        name: 'Entradas',
        description: 'Gestión de entradas y ventas'
      },
      {
        name: 'Promociones',
        description: 'Gestión de promociones y descuentos'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'], // rutas donde están los comentarios de JSDoc para Swagger
};

const specs = swaggerJsdoc(options);

const swaggerConfig = {
  swaggerDefinition: specs,
  explorer: true,
  customCss: `
    .swagger-ui .topbar { 
      background-color: #2c5234; 
    }
    .swagger-ui .topbar .topbar-wrapper .link {
      content: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSI+PC9zdmc+');
    }
  `,
  customSiteTitle: "Jungle Planet Zoo API Documentation"
};

module.exports = {
  specs,
  swaggerUi,
  swaggerConfig
};