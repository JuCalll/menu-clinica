import React from "react";
import "../styles/Home.scss";
import sanjuan from "../assets/sanjuan.png";  

const Home = () => {
  return (
    <div className="home text-center">
      <h1>Menú Preferencial - Clínica San Juan de Dios</h1>
      <img src={sanjuan} alt="San Juan de Dio" className="home-logo" />  
    </div>
  );
};

export default Home;
