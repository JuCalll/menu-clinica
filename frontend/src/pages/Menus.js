// src/pages/Menus.js

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Menus.scss';

// Componente funcional Menus
// Maneja la visualización y manipulación de menús
const Menus = () => {
    const [menus, setMenus] = useState([]); // Estado para almacenar la lista de menús
    const [showForm, setShowForm] = useState(false); // Estado para mostrar/ocultar el formulario
    const [newMenu, setNewMenu] = useState({ name: '', description: '' }); // Estado para el nuevo menú
    const [editMenu, setEditMenu] = useState(null); // Estado para editar un menú existente

    // useEffect para obtener la lista de menús cuando se carga el componente
    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await api.get('/menus/'); // Solicita la lista de menús a la API
                setMenus(response.data); // Actualiza el estado con los datos recibidos
            } catch (error) {
                console.error('Error fetching menus:', error); // Manejo de errores
            }
        };
        fetchMenus(); // Llama a la función para obtener los menús
    }, []);

    // Maneja los cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMenu({ ...newMenu, [name]: value }); // Actualiza el estado del nuevo menú
    };

    // Maneja el envío del formulario para crear o actualizar un menú
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editMenu) {
                await api.put(`/menus/${editMenu.id}/`, newMenu); // Actualiza el menú existente
            } else {
                await api.post('/menus/', newMenu); // Crea un nuevo menú
            }
            setShowForm(false); // Oculta el formulario
            setEditMenu(null); // Resetea el estado de edición
            setNewMenu({ name: '', description: '' }); // Resetea el formulario
            const response = await api.get('/menus/'); // Obtiene la lista actualizada de menús
            setMenus(response.data); // Actualiza el estado con la lista actualizada
        } catch (error) {
            console.error('Error creating or updating menu:', error); // Manejo de errores
        }
    };

    // Maneja la edición de un menú
    const handleEdit = (menu) => {
        setEditMenu(menu); // Establece el menú a editar
        setShowForm(true); // Muestra el formulario
        setNewMenu({ name: menu.name, description: menu.description }); // Rellena el formulario con los datos del menú
    };

    // Maneja la eliminación de un menú
    const handleDelete = async (id) => {
        try {
            await api.delete(`/menus/${id}/`); // Solicita la eliminación del menú a la API
            const response = await api.get('/menus/'); // Obtiene la lista actualizada de menús
            setMenus(response.data); // Actualiza el estado con la lista actualizada
        } catch (error) {
            console.error('Error deleting menu:', error); // Manejo de errores
        }
    };

    return (
        <div className="menus">
            <h2>Menús</h2>
            <button onClick={() => {
                setShowForm(!showForm); // Alterna la visibilidad del formulario
                setEditMenu(null); // Resetea el estado de edición
                setNewMenu({ name: '', description: '' }); // Resetea el formulario
            }}>
                {editMenu ? 'Editar Menú' : 'Crear Nuevo Menú'}
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} className="menu-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre del Menú"
                        value={newMenu.name}
                        onChange={handleInputChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Descripción"
                        value={newMenu.description}
                        onChange={handleInputChange}
                        required
                    ></textarea>
                    <button type="submit">{editMenu ? 'Actualizar' : 'Crear'}</button>
                </form>
            )}
            <div className="menu-list">
                {menus.map((menu) => (
                    <div key={menu.id} className="menu-item">
                        <h3>{menu.name}</h3>
                        <p>{menu.description}</p>
                        <button onClick={() => handleEdit(menu)}>Editar</button>
                        <button onClick={() => handleDelete(menu.id)}>Eliminar</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menus;
