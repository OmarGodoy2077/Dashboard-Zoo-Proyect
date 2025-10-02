# Ejemplo de Request para Login

## ⚠️ Problema Común: JSON Malformado

El error "JSON malformado en posición 78 (línea 5, columna 1)" indica que hay caracteres extra o formato incorrecto en el JSON.

## ✅ Formato Correcto

### Request Headers
```
Content-Type: application/json
```

### Request Body (CORRECTO)
```json
{
  "email": "usuario@ejemplo.com",
  "password": "TuPassword123!"
}
```

## ❌ Formatos Incorrectos Comunes

### Error 1: Caracteres extra después del JSON
```json
{
  "email": "usuario@ejemplo.com",
  "password": "TuPassword123!"
}
<-- Caracteres extra aquí -->
```

### Error 2: Comas finales (trailing commas)
```json
{
  "email": "usuario@ejemplo.com",
  "password": "TuPassword123!",  <-- Coma extra
}
```

### Error 3: Comillas incorrectas
```json
{
  'email': 'usuario@ejemplo.com',  <-- Usar comillas dobles, no simples
  'password': 'TuPassword123!'
}
```

### Error 4: Saltos de línea dentro de strings
```json
{
  "email": "usuario@ejemplo.com",
  "password": "TuPassword
  123!"  <-- No permitido
}
```

## 🔧 Soluciones

### 1. Si usas Thunder Client / Postman / Insomnia:
- Asegúrate de que el **Content-Type** sea `application/json`
- Usa la pestaña **Body** → **JSON**
- Copia y pega el JSON correcto sin modificar

### 2. Si usas curl:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"usuario@ejemplo.com\",\"password\":\"TuPassword123!\"}"
```

### 3. Si usas JavaScript fetch:
```javascript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'TuPassword123!'
  })
})
```

### 4. Si usas axios:
```javascript
axios.post('http://localhost:3000/api/auth/login', {
  email: 'usuario@ejemplo.com',
  password: 'TuPassword123!'
}, {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## 🔍 Cómo Verificar tu JSON

### Opción 1: Usa un validador online
- https://jsonlint.com/
- Pega tu JSON y verifica que sea válido

### Opción 2: Usa VS Code
- Crea un archivo `.json`
- Pega tu contenido
- VS Code te mostrará errores de sintaxis

### Opción 3: Usa Node.js
```javascript
try {
  JSON.parse('tu json aquí');
  console.log('JSON válido');
} catch (e) {
  console.error('JSON inválido:', e.message);
}
```

## 📋 Checklist antes de hacer el request

- [ ] El Content-Type está configurado como `application/json`
- [ ] El JSON está correctamente formateado (usa jsonlint.com)
- [ ] No hay comillas simples, solo dobles
- [ ] No hay comas finales (trailing commas)
- [ ] No hay caracteres extra después del cierre `}`
- [ ] El email tiene formato válido
- [ ] La contraseña no está vacía

## 🎯 Ejemplo Completo con Thunder Client

1. Abre Thunder Client en VS Code
2. Crea un nuevo request
3. Configura:
   - **Method**: POST
   - **URL**: `http://localhost:3000/api/auth/login`
   - **Headers**: 
     ```
     Content-Type: application/json
     ```
   - **Body** (selecciona JSON):
     ```json
     {
       "email": "admin@zoologico.com",
       "password": "Admin123!"
     }
     ```
4. Click en **Send**

## 📝 Respuesta Esperada

### Si el login es exitoso:
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "uuid-del-usuario",
      "nombre": "Nombre del Usuario",
      "email": "usuario@ejemplo.com",
      "rol": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Si las credenciales son inválidas:
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

### Si el JSON está malformado:
```json
{
  "success": false,
  "message": "JSON malformado. Verifica que el Content-Type sea application/json y que el JSON esté correctamente formateado"
}
```
