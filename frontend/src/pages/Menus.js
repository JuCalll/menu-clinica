import React, { useEffect, useState } from 'react';
import api from '../services/api';
import '../styles/DataList.scss';

const Menus = () => {
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await api.get('/menus/');
                setMenus(response.data);
            } catch (error) {
                console.error('Error fetching menus:', error);
            }
        };
        fetchMenus();
    }, []);

    return (
        <div className="data-list">
            <h2>Menus</h2>
            <ul>
                {menus.map((menu) => (
                    <li key={menu.id}>
                        <h3>{menu.name}</h3>
                        <p>{menu.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Menus;
