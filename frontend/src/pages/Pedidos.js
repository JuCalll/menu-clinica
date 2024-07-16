import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Pedidos = () => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        const fetchPedidos = async () => {
            try {
                const response = await api.get('/pedidos/');
                setPedidos(response.data);
            } catch (error) {
                console.error('Error fetching pedidos:', error);
            }
        };
        fetchPedidos();
    }, []);

    return (
        <div>
            <h2>Pedidos</h2>
            <ul>
                {pedidos.map((pedido) => (
                    <li key={pedido.id}>
                        {pedido.status} - {pedido.menu.name} - {pedido.patient.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Pedidos;
