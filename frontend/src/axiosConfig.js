// frontend/src/services/axiosConfig.js
import axios from 'axios';

// Crear una instancia de axios con la URL base para la API
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
});

// Agregar un interceptor para incluir el token de autenticación en cada solicitud
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
