// src/utils/inactivityHandler.js

let inactivityTime = function () {
    let time;
    let warningTimeout;

    // Restablecer el temporizador en caso de actividad del usuario
    function resetTimer() {
        clearTimeout(time);
        clearTimeout(warningTimeout);
        startTimer();
    }

    // Configurar eventos para detectar actividad del usuario
    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onclick = resetTimer;
    document.onscroll = resetTimer;
    document.onresize = resetTimer;
    
    // Iniciar el temporizador de inactividad
    function startTimer() {
        // Mostrar alerta después de 50 minutos de inactividad
        warningTimeout = setTimeout(showWarning, 50 * 60 * 1000);
    }

    // Mostrar alerta de confirmación
    function showWarning() {
        alert("Ha pasado un tiempo desde su última actividad. Por favor, confirme que sigue aquí.");
        resetTimer();  // Si el usuario cierra la alerta, reiniciar el temporizador
    }

    startTimer();  // Iniciar el temporizador al cargar la página
};

export default inactivityTime;
