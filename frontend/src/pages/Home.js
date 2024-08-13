// Importamos React para crear componentes
import React from 'react';
// Importamos el archivo de estilos SCSS específico para este componente
import '../styles/Home.scss';

// Definimos el componente Home que representa la página de inicio
const Home = () => {
    return (
        // Contenedor principal con la clase "home" para aplicar estilos específicos
        // "text-center" es una clase de Bootstrap para centrar el texto
        <div className="home text-center">
            {/* Título de la página de inicio */}
            <h1>Menú Preferencial - Clínica San Juan de Dios</h1>
        </div>
    );
};

// Exportamos el componente Home para que pueda ser utilizado en otras partes de la aplicación
export default Home;
