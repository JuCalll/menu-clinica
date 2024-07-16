import React, { useEffect, useState } from 'react';
import api from '../services/api';

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
        <div>
            <h2>Menus</h2>
            <ul>
                {menus.map((menu) => (
                    <li key={menu.id}>
                        {menu.name} - {menu.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Menus;
