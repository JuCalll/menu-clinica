import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/DataList.scss';

const Pacientes = () => {
    const [pacientes, setPacientes] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await api.get('/pacientes/pacientes/');
                setPacientes(response.data);
            } catch (error) {
                console.error('Error fetching pacientes:', error);
            }
        };
        fetchPacientes();
    }, []);

    return (
        <div className="data-list">
            <h2>Pacientes</h2>
            <ul>
                {pacientes.map((paciente) => (
                    <li key={paciente.id}>
                        <h3>{paciente.name}</h3>
                        <p>Room: {paciente.room}</p>
                        <p>Diet: {paciente.recommended_diet}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Pacientes;
