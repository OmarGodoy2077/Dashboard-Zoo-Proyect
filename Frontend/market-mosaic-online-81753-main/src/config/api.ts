// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Socket.io usa la misma URL que la API, no necesita conversión
const WS_BASE_URL = API_BASE_URL;

export { API_BASE_URL, WS_BASE_URL };