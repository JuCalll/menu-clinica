// src/pages/Pedidos.js

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Pedidos.scss';

// Componente funcional Pedidos
// Maneja la visualización y actualización del estado de los pedidos
const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]); // Estado para almacenar los pedidos pendientes
    const [historicalPedidos, setHistoricalPedidos] = useState([]); // Estado para almacenar los pedidos completados

    // useEffect para obtener la lista de pedidos cuando se carga el componente
    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await api.get('/pedidos/'); // Solicita la lista de pedidos a la API
                setPedidos(response.data.filter(pedido => pedido.status === 'Pending')); // Filtra los pedidos pendientes
                setHistoricalPedidos(response.data.filter(pedido => pedido.status === 'Completed')); // Filtra los pedidos completados
            } catch (error) {
                console.error('Error fetching pedidos:', error); // Manejo de errores
            }
        };
        fetchPedidos(); // Llama a la función para obtener los pedidos
    }, []);

    // Función para manejar la actualización del estado del pedido
    const handleStatusUpdate = async (id) => {
        try {
            await api.patch(`/pedidos/${id}/status/`, { status: 'Completed' }); // Actualiza el estado del pedido a 'Completed'
            const response = await api.get('/pedidos/'); // Vuelve a obtener la lista de pedidos
            setPedidos(response.data.filter(pedido => pedido.status === 'Pending')); // Actualiza los pedidos pendientes
            setHistoricalPedidos(response.data.filter(pedido => pedido.status === 'Completed')); // Actualiza los pedidos completados
        } catch (error) {
            console.error('Error updating pedido status:', error); // Manejo de errores
        }
    };

    return (
        <div className="pedidos">
            <h2>Pedidos</h2>
            <ul>
                {pedidos.map((pedido) => (
                    <li key={pedido.id}>
                        {pedido.status} - {pedido.menu.name} - {pedido.patient.name}
                        <button onClick={() => handleStatusUpdate(pedido.id)}>Marcar como Completado</button>
                    </li>
                ))}
            </ul>
            <h2>Historial de Pedidos Completados</h2>
            <ul>
                {historicalPedidos.map((pedido) => (
                    <li key={pedido.id}>
                        {pedido.status} - {pedido.menu.name} - {pedido.patient.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Pedidos;
