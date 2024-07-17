import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/Pedidos.scss';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [historicalPedidos, setHistoricalPedidos] = useState([]);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await api.get('/pedidos/');
                setPedidos(response.data.filter(pedido => pedido.status === 'Pending'));
                setHistoricalPedidos(response.data.filter(pedido => pedido.status === 'Completed'));
            } catch (error) {
                console.error('Error fetching pedidos:', error);
            }
        };
        fetchPedidos();
    }, []);

    const handleStatusUpdate = async (id) => {
        try {
            await api.patch(`/pedidos/${id}/status/`, { status: 'Completed' });
            const response = await api.get('/pedidos/');
            setPedidos(response.data.filter(pedido => pedido.status === 'Pending'));
            setHistoricalPedidos(response.data.filter(pedido => pedido.status === 'Completed'));
        } catch (error) {
            console.error('Error updating pedido status:', error);
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
