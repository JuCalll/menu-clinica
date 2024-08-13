// Importamos React y los hooks useState y useEffect para manejar estado y efectos
import React, { useEffect, useState } from 'react';
// Importamos el servicio API para hacer solicitudes HTTP al backend
import api from '../services/api';
// Importamos el archivo de estilos SCSS específico para este componente
import '../styles/ServiciosHabitaciones.scss';

// Definimos el componente ServiciosHabitaciones
const ServiciosHabitaciones = () => {
    // Estado para manejar la lista de servicios, habitaciones, y los valores de los formularios
    const [servicios, setServicios] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);
    const [newServicio, setNewServicio] = useState('');
    const [newHabitacion, setNewHabitacion] = useState({ numero: '', servicio_id: '' });

    // Efecto para obtener servicios y habitaciones al montar el componente
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
    }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar

    // Función para manejar el envío del formulario de servicios
    const handleServicioSubmit = async (e) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
        try {
            const response = await api.post('/servicios/', { nombre: newServicio });
            // Actualizamos el estado con el nuevo servicio agregado
            setServicios([...servicios, response.data]);
            setNewServicio(''); // Reseteamos el campo de entrada
        } catch (error) {
            console.error('Error creating or updating servicio:', error);
        }
    };

    // Función para manejar el envío del formulario de habitaciones
    const handleHabitacionSubmit = async (e) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
        try {
            const response = await api.post('/habitaciones/', newHabitacion);
            // Actualizamos el estado con la nueva habitación agregada
            setHabitaciones([...habitaciones, response.data]);
            setNewHabitacion({ numero: '', servicio_id: '' }); // Reseteamos los campos de entrada
        } catch (error) {
            console.error('Error creating or updating habitacion:', error);
        }
    };

    // Renderizamos el formulario para agregar servicios y habitaciones, y las listas correspondientes
    return (
        <div className="servicios-habitaciones container mt-5">
            <h2>Gestión de Servicios y Habitaciones</h2>
            <div className="row">
                {/* Sección para gestionar los servicios */}
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
                {/* Sección para gestionar las habitaciones */}
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

// Exportamos el componente ServiciosHabitaciones para que pueda ser utilizado en otras partes de la aplicación
export default ServiciosHabitaciones;
