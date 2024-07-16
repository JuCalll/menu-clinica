import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Menu() {
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        api.get('/menus/')
            .then(response => {
                setMenus(response.data);
            })
            .catch(error => {
                console.error('Error fetching menus:', error);
            });
    }, []);

    return (
        <div>
            <h1>Menús</h1>
            <ul>
                {menus.map(menu => (
                    <li key={menu.id}>{menu.name} - {menu.description}</li>
                ))}
            </ul>
        </div>
    );
}

export default Menu;
