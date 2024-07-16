import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Patients() {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
        api.get('/pacientes/')
            .then(response => {
                setPatients(response.data);
            })
            .catch(error => {
                console.error('Error fetching patients:', error);
            });
    }, []);

    return (
        <div>
            <h1>Pacientes</h1>
            <ul>
                {patients.map(patient => (
                    <li key={patient.id}>
                        {patient.name} - Habitación: {patient.room} - Dieta: {patient.recommended_diet}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Patients;
