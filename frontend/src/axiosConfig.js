import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/api'  // En desarrollo, usa localhost
        : 'http://172.168.11.176:8000/api',  // En producción o red local, usa la IP del servidor
});

// Interceptores de respuestas para manejar el error 401 (token expirado)
api.interceptors.response.use(
    response => response,  // Retorna la respuesta directamente si es exitosa
    async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && error.response.data.code === 'token_not_valid') {
            const refreshToken = localStorage.getItem('refresh');

            if (refreshToken) {
                try {
                    const { data } = await axios.post('/auth/token/refresh/', { refresh: refreshToken });

                    localStorage.setItem('token', data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${data.access}`;

                    return api(originalRequest);  // Reintenta la solicitud original
                } catch (refreshError) {
                    console.error('Error al refrescar el token:', refreshError);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh');
                    window.location.href = '/login';  // Redirige al login si falla el refresco
                }
            }
        }

        return Promise.reject(error);  // Si no es un error de token, lo propaga
    }
);

export default api;
