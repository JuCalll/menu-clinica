import React from "react";
import "../styles/Home.scss";
import sanjuan from "../assets/sanjuan.png";  // Importamos la imagen desde la carpeta assets

const Home = () => {
  return (
    <div className="home text-center">
      <h1>Menú Preferencial - Clínica San Juan de Dios</h1>
      <img src={sanjuan} alt="San Juan de Dios" className="home-logo" />  {/* Agregamos la imagen */}
    </div>
  );
};

export default Home;
