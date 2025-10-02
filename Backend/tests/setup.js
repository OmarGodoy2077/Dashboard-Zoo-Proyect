// Setup para pruebas
require('dotenv').config({ path: '.env.test' });

// Configurar variables de entorno para testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.BCRYPT_SALT_ROUNDS = '4'; // Usar menos rounds para tests más rápidos

// Mock de console en tests si es necesario
// console.log = jest.fn();
// console.error = jest.fn();

// Configurar timeout global para pruebas
jest.setTimeout(30000);

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});