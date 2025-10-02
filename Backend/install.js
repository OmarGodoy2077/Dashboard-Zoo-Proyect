#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🦁 Instalando Jungle Planet Zoo Management System Backend...\n');

// Función para ejecutar comandos de manera segura
const runCommand = (command, description) => {
  try {
    console.log(`⏳ ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completado\n`);
  } catch (error) {
    console.error(`❌ Error en ${description}:`, error.message);
    process.exit(1);
  }
};

// Función para crear archivos si no existen
const createFileIfNotExists = (filePath, content, description) => {
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${description} creado`);
    } catch (error) {
      console.error(`❌ Error creando ${description}:`, error.message);
    }
  } else {
    console.log(`ℹ️  ${description} ya existe`);
  }
};

// 1. Verificar Node.js version
console.log('🔍 Verificando versión de Node.js...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 16) {
  console.error('❌ Se requiere Node.js versión 16 o superior. Versión actual:', nodeVersion);
  process.exit(1);
}
console.log(`✅ Node.js ${nodeVersion} es compatible\n`);

// 2. Instalar dependencias
runCommand('npm install', 'Instalación de dependencias');

// 3. Crear archivo .env si no existe
const envContent = `# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Configuración JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
JWT_EXPIRES_IN=24h

# Configuración de bcrypt
BCRYPT_SALT_ROUNDS=12

# Configuración de CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# Configuración de rate limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Configuración de logs
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Configuración de base de datos
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
DB_STATEMENT_TIMEOUT=30000
DB_QUERY_TIMEOUT=30000
`;

createFileIfNotExists('.env', envContent, 'Archivo de configuración (.env)');

// 4. Crear directorio de logs
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Directorio de logs creado');
} else {
  console.log('ℹ️  Directorio de logs ya existe');
}

// 5. Crear directorio de uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Directorio de uploads creado');
} else {
  console.log('ℹ️  Directorio de uploads ya existe');
}

// 6. Verificar estructura de archivos críticos
const criticalFiles = [
  'server.js',
  'package.json',
  'config/database.js',
  'middleware/auth.js',
  'middleware/errorHandler.js',
  'middleware/logger.js',
  'routes/auth.routes.js',
  'controllers/auth.controller.js',
  'services/authService.js'
];

console.log('\n🔍 Verificando archivos críticos...');
let missingFiles = [];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log(`\n⚠️  Faltan ${missingFiles.length} archivos críticos. El sistema podría no funcionar correctamente.`);
} else {
  console.log('\n✅ Todos los archivos críticos están presentes');
}

// 7. Mostrar instrucciones finales
console.log('\n🎉 ¡Instalación completada!\n');
console.log('📋 Pasos siguientes:');
console.log('1. Configurar variables de entorno en el archivo .env');
console.log('2. Configurar tu proyecto de Supabase y ejecutar el schema.sql');
console.log('3. Actualizar las URLs y claves de Supabase en .env');
console.log('4. Ejecutar: npm run dev (para desarrollo) o npm start (para producción)');
console.log('\n📚 Documentación:');
console.log('- README: ./docs/README.md');
console.log('- Documentación técnica: ./docs/DOCUMENTACION_BACKEND.md');
console.log('- API Docs: http://localhost:3000/api-docs (cuando el servidor esté corriendo)');
console.log('\n🔧 Comandos útiles:');
console.log('- npm run dev       # Ejecutar en modo desarrollo');
console.log('- npm start         # Ejecutar en modo producción');
console.log('- npm test          # Ejecutar pruebas');
console.log('- npm run docs      # Generar documentación');
console.log('\n🦁 ¡Bienvenido a Jungle Planet Zoo Management System!');