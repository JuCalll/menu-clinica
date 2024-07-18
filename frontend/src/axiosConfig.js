import axios from 'axios';

// Crear una instancia de axios con la URL base para la API
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Agregar un interceptor para incluir el token de autenticación en cada solicitud
api.interceptors.request.use(
    (config) => {
        // Obtener el token de autenticación del almacenamiento local
        const token = localStorage.getItem('token');
        // Si existe un token, agregarlo a los encabezados de la solicitud
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error) // Manejar errores en la configuración de la solicitud
);

export default api;
