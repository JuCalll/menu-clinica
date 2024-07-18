import axios from 'axios';

// URL base de la API
const API_URL = 'http://127.0.0.1:8000/api';

// Crear una instancia de axios con la configuración base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor de solicitudes para agregar el token de autenticación
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;

// Función para registrar un usuario
export const registerUser = async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
};

// Función para iniciar sesión
export const loginUser = async (userData) => {
    const response = await api.post('/auth/login/', userData);
    return response.data;
};

// Función para obtener todos los menús
export const getMenus = async () => {
    const response = await api.get('/menus/');
    return response.data;
};

// Función para crear un nuevo menú
export const createMenu = async (menuData) => {
    const response = await api.post('/menus/', menuData);
    return response.data;
};

// Función para obtener todos los pedidos
export const getPedidos = async () => {
    const response = await api.get('/pedidos/');
    return response.data;
};

// Función para crear un nuevo pedido
export const createPedido = async (pedidoData) => {
    const response = await api.post('/pedidos/', pedidoData);
    return response.data;
};

// Función para obtener todos los pacientes
export const getPacientes = async () => {
    const response = await api.get('/pacientes/pacientes/');
    return response.data;
};

// Función para crear un nuevo paciente
export const createPaciente = async (pacienteData) => {
    const response = await api.post('/pacientes/pacientes/', pacienteData);
    return response.data;
};
