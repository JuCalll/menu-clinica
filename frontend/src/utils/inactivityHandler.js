let inactivityTime = function (showWarningCallback) {
  let time;
  let warningTimeout;

  function resetTimer() {
    clearTimeout(time);
    clearTimeout(warningTimeout);
    startTimer();
  }

  function startTimer() {
    warningTimeout = setTimeout(() => {
      if (typeof showWarningCallback === "function") {
        showWarningCallback(true);  // Mostramos advertencia en caso de inactividad
      }
    }, 50 * 60 * 1000);  // Ajustar el tiempo de inactividad aquí
  }

  window.onload = resetTimer;
  document.onmousemove = resetTimer;
  document.onclick = resetTimer;
  document.onscroll = resetTimer;
  document.onresize = resetTimer;

  startTimer();
};

export default inactivityTime;
