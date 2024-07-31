import api from '.././axiosConfig';

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

// Función para actualizar un menú
export const updateMenu = async (id, menuData) => {
    const response = await api.put(`/menus/${id}/`, menuData);
    return response.data;
};

// Función para eliminar un menú
export const deleteMenu = async (id) => {
    const response = await api.delete(`/menus/${id}/`);
    return response.data;
};

// Función para obtener todas las opciones de menú
export const getMenuOptions = async () => {
    const response = await api.get('/menus/options/');
    return response.data;
};

// Función para crear una nueva opción de menú
export const createMenuOption = async (optionData) => {
    const response = await api.post('/menus/options/', optionData);
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

export default api;
