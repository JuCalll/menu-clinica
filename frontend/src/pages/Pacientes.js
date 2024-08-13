// Importamos React y los hooks useEffect y useState para manejar efectos y estado
import React, { useEffect, useState } from 'react';
// Importamos el servicio API para hacer solicitudes HTTP al backend
import api from '../services/api';
// Importamos el archivo de estilos SCSS específico para este componente
import '../styles/DataList.scss';

// Definimos el componente Pacientes
const Pacientes = () => {
    // Estado para manejar la lista de pacientes
    const [pacientes, setPacientes] = useState([]);

    // useEffect se ejecuta una vez cuando el componente se monta
    useEffect(() => {
        // Función asincrónica para obtener los pacientes desde la API
        const fetchPacientes = async () => {
            try {
                // Hacemos una solicitud GET a la API para obtener la lista de pacientes
                const response = await api.get('/pacientes/');
                // Actualizamos el estado con los datos recibidos
                setPacientes(response.data);
            } catch (error) {
                // Manejo de errores en caso de que falle la solicitud
                console.error('Error fetching pacientes:', error);
            }
        };
        // Llamamos a la función fetchPacientes para obtener los datos
        fetchPacientes();
    }, []); // El array vacío como dependencia asegura que useEffect se ejecute solo una vez

    // Renderizamos la lista de pacientes
    return (
        <div className="data-list container mt-5">
            <h2>Pacientes</h2>
            <ul className="list-group">
                {pacientes.map((paciente) => (
                    // Cada paciente se representa como un elemento de lista
                    <li key={paciente.id} className="list-group-item">
                        <h3>{paciente.name}</h3>
                        <p>Habitación: {paciente.room.numero}</p>
                        <p>Servicio: {paciente.room.servicio.nombre}</p>
                        <p>Restricciones: {paciente.recommended_diet}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Exportamos el componente Pacientes para que pueda ser utilizado en otras partes de la aplicación
export default Pacientes;
