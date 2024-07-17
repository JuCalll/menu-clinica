import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Menus.scss';

const Menus = () => {
    const [menus, setMenus] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newMenu, setNewMenu] = useState({ name: '', description: '' });
    const [editMenu, setEditMenu] = useState(null);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await api.get('/menus/');
                setMenus(response.data);
            } catch (error) {
                console.error('Error fetching menus:', error);
            }
        };
        fetchMenus();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMenu({ ...newMenu, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editMenu) {
                await api.put(`/menus/${editMenu.id}/`, newMenu);
            } else {
                await api.post('/menus/', newMenu);
            }
            setShowForm(false);
            setEditMenu(null);
            setNewMenu({ name: '', description: '' });
            const response = await api.get('/menus/');
            setMenus(response.data);
        } catch (error) {
            console.error('Error creating or updating menu:', error);
        }
    };

    const handleEdit = (menu) => {
        setEditMenu(menu);
        setShowForm(true);
        setNewMenu({ name: menu.name, description: menu.description });
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/menus/${id}/`);
            const response = await api.get('/menus/');
            setMenus(response.data);
        } catch (error) {
            console.error('Error deleting menu:', error);
        }
    };

    return (
        <div className="menus">
            <h2>Menús</h2>
            <button onClick={() => {
                setShowForm(!showForm);
                setEditMenu(null);
                setNewMenu({ name: '', description: '' });
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
