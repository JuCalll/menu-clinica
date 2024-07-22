import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/ServiciosHabitaciones.scss';

const ServiciosHabitaciones = () => {
    const [servicios, setServicios] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [showServicioForm, setShowServicioForm] = useState(false);
    const [showHabitacionForm, setShowHabitacionForm] = useState(false);
    const [newServicio, setNewServicio] = useState({ nombre: '' });
    const [newHabitacion, setNewHabitacion] = useState({ numero: '', servicio_id: '' });
    const [editServicio, setEditServicio] = useState(null);
    const [editHabitacion, setEditHabitacion] = useState(null);

    useEffect(() => {
        fetchServicios();
    }, []);

    const fetchServicios = async () => {
        try {
            const response = await api.get('/servicios/');
            setServicios(response.data);
        } catch (error) {
            console.error('Error fetching servicios:', error);
        }
    };

    const fetchHabitaciones = async (servicioId) => {
        try {
            const response = await api.get('/habitaciones/', { params: { servicio_id: servicioId } });
            setHabitaciones(response.data);
        } catch (error) {
            console.error('Error fetching habitaciones:', error);
        }
    };

    const handleServicioInputChange = (e) => {
        const { name, value } = e.target;
        setNewServicio({ ...newServicio, [name]: value });
    };

    const handleHabitacionInputChange = (e) => {
        const { name, value } = e.target;
        setNewHabitacion({ ...newHabitacion, [name]: value });
    };

    const handleServicioSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editServicio) {
                await api.put(`/servicios/${editServicio.id}/`, newServicio);
            } else {
                await api.post('/servicios/', newServicio);
            }
            setShowServicioForm(false);
            setEditServicio(null);
            setNewServicio({ nombre: '' });
            fetchServicios();
        } catch (error) {
            console.error('Error creating or updating servicio:', error);
        }
    };

    const handleHabitacionSubmit = async (e) => {
        e.preventDefault();
        console.log('Habitacion Data:', newHabitacion); // Log data to check
        try {
            if (editHabitacion) {
                await api.put(`/habitaciones/${editHabitacion.id}/`, newHabitacion);
            } else {
                await api.post('/habitaciones/', newHabitacion);
            }
            setShowHabitacionForm(false);
            setEditHabitacion(null);
            setNewHabitacion({ numero: '', servicio_id: '' });
            fetchHabitaciones(newHabitacion.servicio_id);
        } catch (error) {
            console.error('Error creating or updating habitacion:', error);
            console.log(error.response.data); // Log error response data
        }
    };

    const handleServicioEdit = (servicio) => {
        setEditServicio(servicio);
        setShowServicioForm(true);
        setNewServicio({ nombre: servicio.nombre });
    };

    const handleHabitacionEdit = (habitacion) => {
        setEditHabitacion(habitacion);
        setShowHabitacionForm(true);
        setNewHabitacion({ numero: habitacion.numero, servicio_id: habitacion.servicio.id });
    };

    const handleServicioDelete = async (id) => {
        try {
            await api.delete(`/servicios/${id}/`);
            fetchServicios();
        } catch (error) {
            console.error('Error deleting servicio:', error);
        }
    };

    const handleHabitacionDelete = async (id) => {
        try {
            await api.delete(`/habitaciones/${id}/`);
            fetchHabitaciones(newHabitacion.servicio_id);
        } catch (error) {
            console.error('Error deleting habitacion:', error);
        }
    };

    return (
        <div className="servicios-habitaciones">
            <h2>Servicios y Habitaciones</h2>
            <div className="servicios-section">
                <button onClick={() => {
                    setShowServicioForm(!showServicioForm);
                    setEditServicio(null);
                    setNewServicio({ nombre: '' });
                }}>
                    {editServicio ? 'Editar Servicio' : 'Crear Nuevo Servicio'}
                </button>
                {showServicioForm && (
                    <form onSubmit={handleServicioSubmit} className="data-form">
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre del Servicio"
                            value={newServicio.nombre}
                            onChange={handleServicioInputChange}
                            required
                        />
                        <button type="submit">{editServicio ? 'Actualizar' : 'Crear'}</button>
                    </form>
                )}
                <ul>
                    {servicios.map((servicio) => (
                        <li key={servicio.id}>
                            <h3>{servicio.nombre}</h3>
                            <button onClick={() => handleServicioEdit(servicio)}>Editar</button>
                            <button onClick={() => handleServicioDelete(servicio.id)}>Eliminar</button>
                            <button onClick={() => fetchHabitaciones(servicio.id)}>Ver Habitaciones</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="habitaciones-section">
                <button onClick={() => {
                    setShowHabitacionForm(!showHabitacionForm);
                    setEditHabitacion(null);
                    setNewHabitacion({ numero: '', servicio_id: '' });
                }}>
                    {editHabitacion ? 'Editar Habitación' : 'Crear Nueva Habitación'}
                </button>
                {showHabitacionForm && (
                    <form onSubmit={handleHabitacionSubmit} className="data-form">
                        <input
                            type="text"
                            name="numero"
                            placeholder="Número de la Habitación"
                            value={newHabitacion.numero}
                            onChange={handleHabitacionInputChange}
                            required
                        />
                        <select
                            name="servicio_id"
                            value={newHabitacion.servicio_id}
                            onChange={handleHabitacionInputChange}
                            required
                        >
                            <option value="">Seleccione un Servicio</option>
                            {servicios.map((servicio) => (
                                <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                            ))}
                        </select>
                        <button type="submit">{editHabitacion ? 'Actualizar' : 'Crear'}</button>
                    </form>
                )}
                <ul>
                    {habitaciones.map((habitacion) => (
                        <li key={habitacion.id}>
                            <h3>{habitacion.numero}</h3>
                            <p>Servicio: {habitacion.servicio}</p>
                            <button onClick={() => handleHabitacionEdit(habitacion)}>Editar</button>
                            <button onClick={() => handleHabitacionDelete(habitacion.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ServiciosHabitaciones;
