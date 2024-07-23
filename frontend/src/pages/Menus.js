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
        <div className="menus container mt-5">
            <h2>Menús</h2>
            <button className="btn btn-primary mb-3" onClick={() => {
                setShowForm(!showForm);
                setEditMenu(null);
                setNewMenu({ name: '', description: '' });
            }}>
                {editMenu ? 'Editar Menú' : 'Crear Nuevo Menú'}
            </button>
            {showForm && (
                <form onSubmit={handleSubmit} className="menu-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Nombre del Menú"
                            value={newMenu.name}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            name="description"
                            placeholder="Descripción"
                            value={newMenu.description}
                            onChange={handleInputChange}
                            className="form-control"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-success">{editMenu ? 'Actualizar' : 'Crear'}</button>
                </form>
            )}
            <div className="menu-list row">
                {menus.map((menu) => (
                    <div key={menu.id} className="menu-item col-md-4">
                        <div className="card mb-3">
                            <div className="card-body">
                                <h3 className="card-title">{menu.name}</h3>
                                <p className="card-text">{menu.description}</p>
                                <button className="btn btn-warning" onClick={() => handleEdit(menu)}>Editar</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(menu.id)}>Eliminar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Menus;
