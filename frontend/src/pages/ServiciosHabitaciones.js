import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/ServiciosHabitaciones.scss';

const ServiciosHabitaciones = () => {
    const [servicios, setServicios] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [newServicio, setNewServicio] = useState('');
    const [newHabitacion, setNewHabitacion] = useState({ numero: '', servicio_id: '' });

    useEffect(() => {
        const fetchServicios = async () => {
            try {
                const response = await api.get('/servicios/');
                setServicios(response.data);
            } catch (error) {
                console.error('Error fetching servicios:', error);
            }
        };

        const fetchHabitaciones = async () => {
            try {
                const response = await api.get('/habitaciones/');
                setHabitaciones(response.data);
            } catch (error) {
                console.error('Error fetching habitaciones:', error);
            }
        };

        fetchServicios();
        fetchHabitaciones();
    }, []);

    const handleServicioSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/servicios/', { nombre: newServicio });
            setServicios([...servicios, response.data]);
            setNewServicio('');
        } catch (error) {
            console.error('Error creating or updating servicio:', error);
        }
    };

    const handleHabitacionSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/habitaciones/', newHabitacion);
            setHabitaciones([...habitaciones, response.data]);
            setNewHabitacion({ numero: '', servicio_id: '' });
        } catch (error) {
            console.error('Error creating or updating habitacion:', error);
        }
    };

    return (
        <div className="servicios-habitaciones container mt-5">
            <h2>Gestión de Servicios y Habitaciones</h2>
            <div className="row">
                <div className="col-md-6">
                    <h3>Servicios</h3>
                    <form onSubmit={handleServicioSubmit} className="mb-3">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Nombre del Servicio"
                                value={newServicio}
                                onChange={(e) => setNewServicio(e.target.value)}
                                className="form-control"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Agregar Servicio</button>
                    </form>
                    <ul className="list-group">
                        {servicios.map((servicio) => (
                            <li key={servicio.id} className="list-group-item">{servicio.nombre}</li>
                        ))}
                    </ul>
                </div>
                <div className="col-md-6">
                    <h3>Habitaciones</h3>
                    <form onSubmit={handleHabitacionSubmit} className="mb-3">
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Número de la Habitación"
                                value={newHabitacion.numero}
                                onChange={(e) => setNewHabitacion({ ...newHabitacion, numero: e.target.value })}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <select
                                value={newHabitacion.servicio_id}
                                onChange={(e) => setNewHabitacion({ ...newHabitacion, servicio_id: e.target.value })}
                                className="form-control"
                                required
                            >
                                <option value="">Seleccione un Servicio</option>
                                {servicios.map((servicio) => (
                                    <option key={servicio.id} value={servicio.id}>
                                        {servicio.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Agregar Habitación</button>
                    </form>
                    <ul className="list-group">
                        {habitaciones.map((habitacion) => (
                            <li key={habitacion.id} className="list-group-item">
                                {habitacion.numero} - {habitacion.servicio}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ServiciosHabitaciones;
