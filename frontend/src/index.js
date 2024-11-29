/**
 * Punto de entrada principal de la aplicación React
 *
 * Configura:
 * - Renderizado del componente raíz
 * - Modo estricto de React
 * - Métricas de rendimiento
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Crear el punto de montaje de la aplicación
const root = ReactDOM.createRoot(document.getElementById("root"));

// Renderizar la aplicación dentro de StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Iniciar medición de métricas de rendimiento
// Se puede pasar una función como callback para procesar los resultados
// Por ejemplo: reportWebVitals(console.log)
reportWebVitals();
