import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/DataList.scss';

const Pacientes = () => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await api.get('/pacientes/');
                setPacientes(response.data);
            } catch (error) {
                console.error('Error fetching pacientes:', error);
            }
        };
        fetchPacientes();
    }, []);

    return (
        <div className="data-list container mt-5">
            <h2>Pacientes</h2>
            <ul className="list-group">
                {pacientes.map((paciente) => (
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

export default Pacientes;
