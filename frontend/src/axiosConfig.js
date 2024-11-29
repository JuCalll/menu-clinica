/**
 * Configuración de Axios para las peticiones HTTP
 *
 * Establece:
 * - URL base según el entorno (desarrollo/producción)
 * - Headers por defecto
 * - Interceptores para manejo de tokens
 * - Refresco automático de tokens expirados
 */

import axios from "axios";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:8000/api"
      : "https://172.168.2.217/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de peticiones
 * Añade el token de autorización a cada petición si existe
 */
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas
 * Maneja:
 * - Refresco automático de tokens expirados
 * - Redirección al login en caso de error de autenticación
 * - Reintentos de peticiones fallidas por token expirado
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Verificar si es error 401 y si podemos intentar refrescar el token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !window.isRefreshing &&
      !originalRequest.url.includes("/auth/token/refresh/") &&
      !originalRequest.url.includes("/auth/logout/")
    ) {
      originalRequest._retry = true;
      window.isRefreshing = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) throw new Error("No refresh token available");

        // Intentar refrescar el token
        const response = await api.post("/auth/token/refresh/", { refresh });

        if (response.data && response.data.access) {
          // Actualizar tokens en localStorage
          localStorage.setItem("token", response.data.access);
          if (response.data.refresh) {
            localStorage.setItem("refresh", response.data.refresh);
          }

          // Actualizar headers con el nuevo token
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${response.data.access}`;
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${response.data.access}`;

          window.isRefreshing = false;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Limpiar sesión y redireccionar al login en caso de error
        window.isRefreshing = false;
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
