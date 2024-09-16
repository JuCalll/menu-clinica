import axios from "axios";
import { jwtDecode } from 'jwt-decode'; // Para decodificar y verificar el token

// Crear instancia de axios
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000/api"
      : "http://172.168.11.176:8000/api",
});

// Función para verificar si el token de refresco ha expirado
const isTokenExpired = (token) => {
  if (!token) return true;
  const decodedToken = jwtDecode(token);
  const currentTime = Date.now() / 1000; // Tiempo actual en segundos
  return decodedToken.exp < currentTime; // Compara la expiración con el tiempo actual
};

// Interceptor de respuesta para manejar la expiración del token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es por un token no válido o expirado
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data.code === "token_not_valid"
    ) {
      const refreshToken = localStorage.getItem("refresh");

      // Verificar si hay un token de refresco válido
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          // Intentar refrescar el token de acceso
          const response = await api.post("/auth/token/refresh/", {
            refresh: refreshToken,
          });

          if (response.data && response.data.access) {
            // Guardar el nuevo token de acceso
            localStorage.setItem("token", response.data.access);

            // Actualizar los encabezados con el nuevo token
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${response.data.access}`;
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${response.data.access}`;

            console.log("Token refreshed successfully");

            // Reintentar la solicitud original con el nuevo token
            return await api(originalRequest);
          } else {
            console.error("Invalid response from token refresh endpoint");
            throw error;
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          // Si el token de refresco también falla, cerrar sesión
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      } else {
        // Si no hay un token de refresco válido, redirigir al login
        localStorage.removeItem("token");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    // Manejar otros errores no relacionados con la autenticación
    console.error("Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para agregar el token de acceso a todas las solicitudes automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
