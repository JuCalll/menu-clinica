import api from "../axiosConfig";

/**
 * Servicios de Autenticación y Usuarios
 */
export const registerUser = async (userData) => {
  const response = await api.post("/auth/register/", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/auth/login/", userData);
  return response.data;
};

export const getUsuarios = async () => {
  const response = await api.get("/auth/users/");
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/auth/users/", userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/auth/users/${id}/`, userData);
  return response.data;
};

/**
 * Servicios de Gestión de Menús
 */
export const getMenus = async () => {
  const response = await api.get("/menus/");
  return response.data;
};

export const createMenu = async (menuData) => {
  const response = await api.post("/menus/", menuData);
  return response.data;
};

export const updateMenu = async (id, menuData) => {
  const response = await api.put(`/menus/${id}/`, menuData);
  return response.data;
};

export const deleteMenu = async (id) => {
  const response = await api.delete(`/menus/${id}/`);
  return response.data;
};

export const getMenuOptions = async () => {
  const response = await api.get("/menus/options/");
  return response.data;
};

export const createMenuOption = async (optionData) => {
  const response = await api.post("/menus/options/", optionData);
  return response.data;
};

/**
 * Servicios de Gestión de Pacientes
 */
export const getPacientes = async () => {
  const response = await api.get("/pacientes/");
  return response.data;
};

export const createPaciente = async (pacienteData) => {
  try {
    const response = await api.post("/pacientes/", pacienteData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePaciente = async (id, pacienteData) => {
  const response = await api.put(`/pacientes/${id}/`, pacienteData);
  return response.data;
};

/**
 * Servicios de Gestión de Dietas
 */
export const getDietas = async () => {
  const response = await api.get("/dietas/dietas/");
  return response.data;
};

export const createDieta = async (dietaData) => {
  const response = await api.post("/dietas/dietas/", dietaData);
  return response.data;
};

export const updateDieta = async (id, dietaData) => {
  const response = await api.put(`/dietas/dietas/${id}/`, dietaData);
  return response.data;
};

export const deleteDieta = async (id) => {
  const response = await api.delete(`/dietas/dietas/${id}/`);
  return response.data;
};

/**
 * Servicios de Gestión de Pedidos
 */
export const getPedidos = async () => {
  const response = await api.get("/pedidos/");
  return response.data;
};

export const createPedido = async (pedidoData) => {
  const response = await api.post("/pedidos/", pedidoData);
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

export const getPedidosCompletados = async (searchTerm = "") => {
  const response = await api.get(
    `/pedidos/completados/?paciente=${searchTerm}`
  );
  return response.data;
};

/**
 * Servicios de Gestión de Infraestructura
 */
export const updateServicio = async (id, servicioData) => {
  const response = await api.put(`/servicios/${id}/`, servicioData);
  return response.data;
};

export const createServicio = async (servicioData) => {
  const response = await api.post("/servicios/", servicioData);
  return response.data;
};

export const createHabitacion = async (habitacionData) => {
  const response = await api.post("/habitaciones/", habitacionData);
  return response.data;
};

export const updateHabitacion = async (id, habitacionData) => {
  const response = await api.put(`/habitaciones/${id}/`, habitacionData);
  return response.data;
};

export const getCamas = async () => {
  const response = await api.get("/camas/");
  return response.data;
};

export const createCama = async (camaData) => {
  const response = await api.post("/camas/", camaData);
  return response.data;
};

export const updateCama = async (id, camaData) => {
  const response = await api.put(`/camas/${id}/`, camaData);
  return response.data;
};

export const deleteCama = async (id) => {
  const response = await api.delete(`/camas/${id}/`);
  return response.data;
};

/**
 * Servicios de Gestión de Alergias
 */
export const getAlergias = async () => {
  const response = await api.get("/dietas/alergias/");
  return response.data;
};

export const createAlergia = async (alergiaData) => {
  const response = await api.post("/dietas/alergias/", alergiaData);
  return response.data;
};

export const updateAlergia = async (id, alergiaData) => {
  const response = await api.put(`/dietas/alergias/${id}/`, alergiaData);
  return response.data;
};

export const deleteAlergia = async (id) => {
  const response = await api.delete(`/dietas/alergias/${id}/`);
  return response.data;
};

export default api;
