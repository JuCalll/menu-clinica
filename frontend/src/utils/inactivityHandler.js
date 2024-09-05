let inactivityTime = function (showWarningCallback) {
    let time;
    let warningTimeout;

    function resetTimer() {
        console.log("Timer reset."); // Log para depuración
        clearTimeout(time);
        clearTimeout(warningTimeout);
        startTimer();
    }

    function startTimer() {
        // Mostrar alerta después de 50 minutos de inactividad
        warningTimeout = setTimeout(() => {
            console.log("Inactivity detected, showing warning."); // Log para depuración
            if (typeof showWarningCallback === 'function') {
                showWarningCallback(true);
            }
        }, 50 * 60 * 1000);  // 50 minutos antes de mostrar la alerta
    }

    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onclick = resetTimer;
    document.onscroll = resetTimer;
    document.onresize = resetTimer;

    startTimer();
};

export default inactivityTime;
