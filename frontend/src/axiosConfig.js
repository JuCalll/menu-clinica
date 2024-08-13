// Importamos axios para realizar solicitudes HTTP
import axios from 'axios';

// Creamos una instancia de axios con la URL base de la API
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // URL base para las solicitudes
});

// Agregamos un interceptor de solicitudes a la instancia de axios
api.interceptors.request.use(
    (config) => {
        // Obtenemos el token de autenticación del almacenamiento local
        const token = localStorage.getItem('token');
        
        // Si el token existe, lo agregamos al encabezado de la solicitud
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Retornamos la configuración de la solicitud
        return config;
    },
    // Manejo de errores en la solicitud
    (error) => Promise.reject(error) // Rechazamos la promesa en caso de error
);

// Exportamos la instancia de axios configurada
export default api;
