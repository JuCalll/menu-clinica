let inactivityTime = function (showWarningCallback) {
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
        warningTimeout = setTimeout(() => showWarningCallback(true), 50 * 60 * 1000);
    }

    startTimer();  // Iniciar el temporizador al cargar la página
};

export default inactivityTime;
