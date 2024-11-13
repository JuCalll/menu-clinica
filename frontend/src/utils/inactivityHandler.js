function inactivityTime(showWarningCallback, onActivity) {
  let warningTimeout;
  let logoutTimeout;
  const WARNING_TIME = 50 * 60 * 1000;  // 50 minutos
  const LOGOUT_TIME = 55 * 60 * 1000;   // 55 minutos

  function handleActivity() {
    if (typeof onActivity === "function") {
      onActivity();
    }
    resetTimer();
  }

  function resetTimer() {
    clearTimeout(warningTimeout);
    clearTimeout(logoutTimeout);
    startTimer();
  }

  function startTimer() {
    warningTimeout = setTimeout(() => {
      if (typeof showWarningCallback === "function") {
        showWarningCallback(true);
        // Iniciar el temporizador para el cierre de sesión automático
        logoutTimeout = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('tokenExpired'));
        }, LOGOUT_TIME - WARNING_TIME);
      }
    }, WARNING_TIME);
  }

  const events = [
    'mousemove',
    'mousedown',
    'click',
    'scroll',
    'keypress',
    'keydown',
    'touchstart',
  ];

  events.forEach(event => {
    window.addEventListener(event, handleActivity);
  });

  startTimer();

  return () => {
    events.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    clearTimeout(warningTimeout);
    clearTimeout(logoutTimeout);
  };
}

export default inactivityTime;
