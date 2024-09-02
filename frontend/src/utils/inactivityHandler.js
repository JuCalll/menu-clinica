let inactivityTime = function (showWarningCallback) {
    let time;
    let warningTimeout;

    function resetTimer() {
        clearTimeout(time);
        clearTimeout(warningTimeout);
        startTimer();
    }

    function startTimer() {
        // Mostrar alerta después de 30 minutos de inactividad
        warningTimeout = setTimeout(() => showWarningCallback(true), 30 * 60 * 1000);
    }

    window.onload = resetTimer;
    document.onmousemove = resetTimer;
    document.onkeypress = resetTimer;
    document.onclick = resetTimer;
    document.onscroll = resetTimer;
    document.onresize = resetTimer;

    startTimer();
};

export default inactivityTime;
