// Importamos la configuración de Axios personalizada
import api from '../axiosConfig';

// Función para registrar un usuario
export const registerUser = async (userData) => {
    // Enviamos una solicitud POST a la API para registrar un nuevo usuario
    const response = await api.post('/auth/register/', userData);
    // Devolvemos los datos de la respuesta
    return response.data;
};

// Función para iniciar sesión
export const loginUser = async (userData) => {
    // Enviamos una solicitud POST a la API para iniciar sesión
    const response = await api.post('/auth/login/', userData);
    // Devolvemos los datos de la respuesta, que incluyen el token de acceso
    return response.data;
};

// Función para obtener todos los menús
export const getMenus = async () => {
    // Enviamos una solicitud GET a la API para obtener la lista de menús
    const response = await api.get('/menus/');
    // Devolvemos los datos de la respuesta, que contienen la lista de menús
    return response.data;
};

// Función para crear un nuevo menú
export const createMenu = async (menuData) => {
    // Enviamos una solicitud POST a la API para crear un nuevo menú
    const response = await api.post('/menus/', menuData);
    // Devolvemos los datos del menú recién creado
    return response.data;
};

// Función para actualizar un menú existente
export const updateMenu = async (id, menuData) => {
    // Enviamos una solicitud PUT a la API para actualizar un menú por su ID
    const response = await api.put(`/menus/${id}/`, menuData);
    // Devolvemos los datos del menú actualizado
    return response.data;
};

// Función para eliminar un menú
export const deleteMenu = async (id) => {
    // Enviamos una solicitud DELETE a la API para eliminar un menú por su ID
    const response = await api.delete(`/menus/${id}/`);
    // Devolvemos los datos de la respuesta de la eliminación
    return response.data;
};

// Función para obtener todas las opciones de menú
export const getMenuOptions = async () => {
    // Enviamos una solicitud GET a la API para obtener la lista de opciones de menú
    const response = await api.get('/menus/options/');
    // Devolvemos los datos de la respuesta, que contienen la lista de opciones de menú
    return response.data;
};

// Función para crear una nueva opción de menú
export const createMenuOption = async (optionData) => {
    // Enviamos una solicitud POST a la API para crear una nueva opción de menú
    const response = await api.post('/menus/options/', optionData);
    // Devolvemos los datos de la nueva opción de menú creada
    return response.data;
};

// Función para obtener todos los pacientes
export const getPacientes = async () => {
    // Enviamos una solicitud GET a la API para obtener la lista de pacientes
    const response = await api.get('/pacientes/');
    // Devolvemos los datos de la respuesta, que contienen la lista de pacientes
    return response.data;
};

// Función para crear un nuevo paciente
export const createPaciente = async (pacienteData) => {
    // Enviamos una solicitud POST a la API para crear un nuevo paciente
    const response = await api.post('/pacientes/', pacienteData);
    // Devolvemos los datos del nuevo paciente creado
    return response.data;
};

// Funciones CRUD para pedidos
export const getPedidos = async () => {
    // Enviamos una solicitud GET a la API para obtener la lista de pedidos
    const response = await api.get('/pedidos/');
    // Devolvemos los datos de la respuesta, que contienen la lista de pedidos
    return response.data;
};

export const createPedido = async (pedidoData) => {
    // Enviamos una solicitud POST a la API para crear un nuevo pedido
    const response = await api.post('/pedidos/', pedidoData);
    // Devolvemos los datos del nuevo pedido creado
    return response.data;
};

export const updatePedido = async (id, pedidoData) => {
    // Enviamos una solicitud PUT a la API para actualizar un pedido por su ID
    const response = await api.put(`/pedidos/${id}/`, pedidoData);
    // Devolvemos los datos del pedido actualizado
    return response.data;
};

export const deletePedido = async (id) => {
    // Enviamos una solicitud DELETE a la API para eliminar un pedido por su ID
    const response = await api.delete(`/pedidos/${id}/`);
    // Devolvemos los datos de la respuesta de la eliminación
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

// Función para actualizar una habitación existente (activar/desactivar)
export const updateHabitacion = async (id, habitacionData) => {
    const response = await api.put(`/habitaciones/${id}/`, habitacionData);
    return response.data;
};

// Función para actualizar un paciente existente (activar/desactivar)
export const updatePaciente = async (id, pacienteData) => {
    const response = await api.put(`/pacientes/${id}/`, pacienteData);
    return response.data;
};

// Exportamos la configuración de Axios por defecto
export default api;
