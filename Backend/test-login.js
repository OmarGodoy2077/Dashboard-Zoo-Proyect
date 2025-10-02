// Script para probar el endpoint de login y verificar JSON
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Función para imprimir con color
const print = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Función para verificar JSON
const verifyJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (e) {
    return { 
      valid: false, 
      error: e.message,
      position: e.message.match(/position (\d+)/)?.[1]
    };
  }
};

// Función para probar el login
async function testLogin(email, password) {
  print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  print('🔐 Probando Login', 'cyan');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // Crear el objeto de datos
  const loginData = {
    email: email,
    password: password
  };

  // Convertir a JSON string
  const jsonString = JSON.stringify(loginData, null, 2);
  
  print('📝 JSON a enviar:', 'blue');
  console.log(jsonString);
  
  // Verificar que el JSON es válido
  const jsonCheck = verifyJSON(jsonString);
  if (!jsonCheck.valid) {
    print(`\n❌ ERROR: JSON inválido`, 'red');
    print(`Detalle: ${jsonCheck.error}`, 'red');
    if (jsonCheck.position) {
      print(`Posición del error: ${jsonCheck.position}`, 'red');
    }
    return;
  }
  
  print('\n✅ JSON válido', 'green');

  try {
    print('\n🚀 Enviando request...', 'yellow');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    print('\n✅ LOGIN EXITOSO', 'green');
    print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.token) {
      print('\n🔑 Token obtenido:', 'cyan');
      print(response.data.data.token.substring(0, 50) + '...', 'cyan');
    }

  } catch (error) {
    if (error.response) {
      // El servidor respondió con un código de error
      print('\n❌ ERROR EN LA RESPUESTA', 'red');
      print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
      print(`Status: ${error.response.status}`, 'red');
      print(`Mensaje: ${error.response.data.message}`, 'red');
      
      if (error.response.data.stack) {
        print('\n📚 Stack trace:', 'yellow');
        console.log(error.response.data.stack);
      }
      
      if (error.response.status === 400 && error.response.data.message.includes('JSON malformado')) {
        print('\n💡 SUGERENCIAS:', 'yellow');
        print('1. Verifica que el Content-Type sea application/json', 'yellow');
        print('2. Asegúrate de no tener caracteres extra después del JSON', 'yellow');
        print('3. Verifica que no haya comas finales (trailing commas)', 'yellow');
        print('4. Usa comillas dobles, no simples', 'yellow');
        print('5. Revisa el archivo LOGIN_REQUEST_EXAMPLE.md para más detalles', 'yellow');
      }
      
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      print('\n❌ ERROR: No se recibió respuesta del servidor', 'red');
      print('Verifica que el servidor esté corriendo en ' + BASE_URL, 'yellow');
    } else {
      // Algo pasó al configurar la petición
      print('\n❌ ERROR:', 'red');
      print(error.message, 'red');
    }
  }
}

// Función para probar JSON malformado (para demostración)
async function testMalformedJSON() {
  print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  print('🔍 Probando JSON Malformado (Demo)', 'cyan');
  print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  const malformedExamples = [
    {
      name: 'Coma final',
      json: '{"email":"test@test.com","password":"test",}'
    },
    {
      name: 'Comillas simples',
      json: "{'email':'test@test.com','password':'test'}"
    },
    {
      name: 'Caracteres extra',
      json: '{"email":"test@test.com","password":"test"}extra'
    }
  ];

  for (const example of malformedExamples) {
    print(`\n📝 Ejemplo: ${example.name}`, 'yellow');
    console.log(example.json);
    
    const check = verifyJSON(example.json);
    if (check.valid) {
      print('✅ Este JSON es válido', 'green');
    } else {
      print(`❌ JSON inválido: ${check.error}`, 'red');
    }
  }
}

// Programa principal
async function main() {
  const args = process.argv.slice(2);
  
  print('\n╔════════════════════════════════════════════╗', 'cyan');
  print('║     Prueba de Login - JSON Validator      ║', 'cyan');
  print('╚════════════════════════════════════════════╝\n', 'cyan');

  if (args.includes('--demo')) {
    await testMalformedJSON();
    return;
  }

  const email = args[0] || 'admin@zoologico.com';
  const password = args[1] || 'Admin123!';

  print(`📧 Email: ${email}`, 'blue');
  print(`🔒 Password: ${'*'.repeat(password.length)}`, 'blue');

  await testLogin(email, password);

  print('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

// Ejecutar
main().catch(error => {
  print('\n❌ Error inesperado:', 'red');
  console.error(error);
  process.exit(1);
});
