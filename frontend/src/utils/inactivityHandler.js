import { jwtDecode } from 'jwt-decode';  // Importamos jwt-decode para decodificar el token

let inactivityTime = function (showWarningCallback) {
  let time;
  let warningTimeout;

  // Función para verificar si el token es válido
  function isTokenValid() {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    return decodedToken.exp > currentTime; // Compara la expiración del token con el tiempo actual
  }

  // Función para refrescar el token si está a punto de expirar
  async function refreshToken() {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return;

    try {
      const response = await fetch("/api/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access); // Guardamos el nuevo token
      } else {
        console.error("Error al intentar refrescar el token");
      }
    } catch (error) {
      console.error("Error en la solicitud de refresco del token", error);
    }
  }

  function resetTimer() {
    clearTimeout(time);
    clearTimeout(warningTimeout);
    
    // Verificamos si el token sigue siendo válido
    if (!isTokenValid()) {
      // Si el token ha expirado, mostramos advertencia o forzamos un cierre de sesión
      showWarningCallback(true);
    } else {
      startTimer();
    }
  }

  function startTimer() {
    warningTimeout = setTimeout(() => {
      if (typeof showWarningCallback === "function") {
        showWarningCallback(true);  // Mostramos advertencia en caso de inactividad
        refreshToken();  // Intentamos refrescar el token al mostrar la advertencia
      }
    }, 50 * 60 * 1000);  // Ajustar el tiempo de inactividad aquí (50 minutos)
  }

  window.onload = resetTimer;
  document.onmousemove = resetTimer;
  document.onclick = resetTimer;
  document.onscroll = resetTimer;
  document.onresize = resetTimer;

  startTimer();
};

export default inactivityTime;
