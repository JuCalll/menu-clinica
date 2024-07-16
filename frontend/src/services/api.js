import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
};

export const loginUser = async (userData) => {
    const response = await api.post('/auth/login/', userData);
    return response.data;
};

export const getMenus = async () => {
    const response = await api.get('/menus/');
    return response.data;
};

export const createMenu = async (menuData) => {
    const response = await api.post('/menus/', menuData);
    return response.data;
};

export const getPedidos = async () => {
    const response = await api.get('/pedidos/');
    return response.data;
};

export const createPedido = async (pedidoData) => {
    const response = await api.post('/pedidos/', pedidoData);
    return response.data;
};

export const getPacientes = async () => {
    const response = await api.get('/pacientes/pacientes/');
    return response.data;
};

export const createPaciente = async (pacienteData) => {
    const response = await api.post('/pacientes/pacientes/', pacienteData);
    return response.data;
};
