import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Orders() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        api.get('/pedidos/')
            .then(response => {
                setOrders(response.data);
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
            });
    }, []);

    return (
        <div>
            <h1>Pedidos</h1>
            <ul>
                {orders.map(order => (
                    <li key={order.id}>
                        Pedido {order.id}: {order.status} - Paciente: {order.patient.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Orders;
