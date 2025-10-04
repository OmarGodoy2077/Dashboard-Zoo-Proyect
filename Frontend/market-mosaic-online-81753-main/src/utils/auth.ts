// Utilidades de autenticación para el frontend
export const getToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    // Verificar si el token es válido antes de devolverlo
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Si el token ha expirado, eliminarlo y devolver null
      if (payload.exp < currentTime) {
        localStorage.removeItem('token');
        console.warn('Token expirado, eliminado del almacenamiento local');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      localStorage.removeItem('token');
      return null;
    }
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error al eliminar el token:', error);
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null;
};

export const getUserRole = (): string | null => {
  try {
    const token = getToken();
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.rol || null;
  } catch (error) {
    console.error('Error al obtener el rol del usuario:', error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    const token = getToken();
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      email: payload.email,
      rol: payload.rol,
      nombre: payload.nombre || 'Usuario' // Si no está en el token, usar default
    };
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
};