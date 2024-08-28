// Importamos la configuración de Axios personalizada
import api from '../axiosConfig';

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

// Función para obtener todos los usuarios
export const getUsuarios = async () => {
    const response = await api.get('/auth/users/');
    return response.data;
};

// Función para crear un nuevo usuario
export const createUser = async (userData) => {
    const response = await api.post('/auth/users/', userData);
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

// Función para actualizar un menú existente
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

// Función para obtener todos los pacientes
export const getPacientes = async () => {
    const response = await api.get('/pacientes/');
    return response.data;
};

// Función para crear un nuevo paciente
export const createPaciente = async (pacienteData) => {
    const response = await api.post('/pacientes/', pacienteData);
    return response.data;
};

// Funciones CRUD para pedidos
export const getPedidos = async () => {
    const response = await api.get('/pedidos/');
    return response.data;
};

export const createPedido = async (pedidoData) => {
    const response = await api.post('/pedidos/', pedidoData);
    return response.data;
};

export const updatePedido = async (id, pedidoData) => {
    const response = await api.put(`/pedidos/${id}/`, pedidoData);
    return response.data;
};

export const deletePedido = async (id) => {
    const response = await api.delete(`/pedidos/${id}/`);
    return response.data;
};

export const getPedidosCompletados = async (searchTerm = '') => {
    const response = await api.get(`/pedidos/completados/?paciente=${searchTerm}`);
    return response.data;
};

// Función para actualizar un servicio existente (activar/desactivar)
export const updateServicio = async (id, servicioData) => {
    const response = await api.put(`/servicios/${id}/`, servicioData);
    return response.data;
};

// Función para crear un nuevo servicio
export const createServicio = async (servicioData) => {
    const response = await api.post('/servicios/', servicioData);
    return response.data;
};

// Función para crear una nueva habitación con camas
export const createHabitacion = async (habitacionData) => {
    const response = await api.post('/habitaciones/', habitacionData);
    return response.data;
};

// Función para actualizar una habitación existente (con camas)
export const updateHabitacion = async (id, habitacionData) => {
    const response = await api.put(`/habitaciones/${id}/`, habitacionData);
    return response.data;
};

// Función para obtener todas las camas
export const getCamas = async () => {
    const response = await api.get('/camas/');
    return response.data;
};

// Función para crear una nueva cama
export const createCama = async (camaData) => {
    const response = await api.post('/camas/', camaData);
    return response.data;
};

// Función para actualizar una cama existente
export const updateCama = async (id, camaData) => {
    const response = await api.put(`/camas/${id}/`, camaData);
    return response.data;
};

// Función para eliminar una cama
export const deleteCama = async (id) => {
    const response = await api.delete(`/camas/${id}/`);
    return response.data;
};

// Función para actualizar un paciente existente (activar/desactivar)
export const updatePaciente = async (id, pacienteData) => {
    const response = await api.put(`/pacientes/${id}/`, pacienteData);
    return response.data;
};

// Exportamos la configuración de Axios por defecto
export default api;
