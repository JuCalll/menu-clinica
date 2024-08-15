// Importamos React y los hooks useEffect y useState para manejar efectos y estado
import React, { useEffect, useState } from 'react';
// Importamos el servicio API para hacer solicitudes HTTP al backend
import api from '../services/api';
// Importamos el archivo de estilos SCSS específico para este componente
import '../styles/DataManagement.scss';

const DataManagement = () => {
    // Estados para manejar pacientes, servicios, y habitaciones
    const [pacientes, setPacientes] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [habitaciones, setHabitaciones] = useState([]);

    // Estados para manejar los formularios de nuevos servicios y habitaciones
    const [newServicio, setNewServicio] = useState('');
    const [newHabitacion, setNewHabitacion] = useState({ numero: '', servicio_id: '' });

    // Estado de carga
    const [loading, setLoading] = useState(true);

    // useEffect para cargar los datos al montar el componente
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pacientesResponse, serviciosResponse, habitacionesResponse] = await Promise.all([
                    api.get('/pacientes/'),
                    api.get('/servicios/'),
                    api.get('/habitaciones/')
                ]);

                console.log('Pacientes:', pacientesResponse.data);
                console.log('Servicios:', serviciosResponse.data);
                console.log('Habitaciones:', habitacionesResponse.data);

                setPacientes(pacientesResponse.data);
                setServicios(serviciosResponse.data);
                setHabitaciones(habitacionesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Manejo del formulario de nuevos servicios
    const handleServicioSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/servicios/', { nombre: newServicio });
            setServicios([...servicios, response.data]);
            setNewServicio('');
            console.log('Nuevo servicio agregado:', response.data);
        } catch (error) {
            console.error('Error creating servicio:', error);
        }
    };

    // Manejo del formulario de nuevas habitaciones
    const handleHabitacionSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/habitaciones/', newHabitacion);
            const nuevaHabitacion = {
                ...response.data,
                servicio: servicios.find(servicio => servicio.id === newHabitacion.servicio_id)
            };
            setHabitaciones([...habitaciones, nuevaHabitacion]);
            setNewHabitacion({ numero: '', servicio_id: '' });
            console.log('Nueva habitación agregada:', nuevaHabitacion);
        } catch (error) {
            console.error('Error creating habitacion:', error);
        }
    };

    // Agrupar habitaciones por servicio
    const habitacionesPorServicio = servicios.map(servicio => {
        const habitacionesFiltradas = habitaciones.filter(habitacion => {
            // Comparamos si el servicio en la habitación es el mismo que el actual
            return habitacion.servicio && habitacion.servicio === servicio.nombre;
        });
        console.log(`Servicio: ${servicio.nombre}, Habitaciones:`, habitacionesFiltradas);
        return {
            ...servicio,
            habitaciones: habitacionesFiltradas,
        };
    });

    // Renderizado del componente
    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="data-management container mt-5">
            <h2>Gestión de Pacientes, Servicios y Habitaciones</h2>
            
            <div className="section">
                <h3>Pacientes</h3>
                <ul className="list-group">
                    {pacientes.map((paciente) => (
                        <li key={paciente.id} className="list-group-item">
                            <h4>{paciente.name}</h4>
                            <p>Habitación: {paciente.room.numero}</p>
                            <p>Servicio: {paciente.room.servicio.nombre}</p>
                            <p>Restricciones: {paciente.recommended_diet}</p>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="section">
                <h3>Servicios y Habitaciones</h3>
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
                {habitacionesPorServicio.map(servicio => (
                    <div key={servicio.id} className="mb-4">
                        <h4>{servicio.nombre}</h4>
                        <ul className="list-group">
                            {servicio.habitaciones.length > 0 ? (
                                servicio.habitaciones.map(habitacion => (
                                    <li key={habitacion.id} className="list-group-item">
                                        Habitación {habitacion.numero}
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item">No hay habitaciones asignadas</li>
                            )}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="section">
                <h3>Agregar Habitación</h3>
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
            </div>
        </div>
    );
};

export default DataManagement;
