import React, { useEffect, useState } from 'react';
import api from '../services/api';

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
        <div>
            <h2>Pacientes</h2>
            <ul>
                {pacientes.map((paciente) => (
                    <li key={paciente.id}>
                        {paciente.name} - {paciente.room} - {paciente.recommended_diet}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Pacientes;
