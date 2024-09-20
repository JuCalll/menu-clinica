function inactivityTime(showWarningCallback) {
  let warningTimeout;

  function resetTimer() {
    clearTimeout(warningTimeout);
    startTimer();
  }

  function startTimer() {
    warningTimeout = setTimeout(() => {
      if (typeof showWarningCallback === "function") {
        showWarningCallback(true);
      }
    }, 30 * 60 * 1000); 
  }

  const events = [
    'load',
    'mousemove',
    'mousedown',
    'click',
    'scroll',
    'keypress',
    'keydown',
    'touchstart',
  ];

  events.forEach(event => {
    window.addEventListener(event, resetTimer);
  });

  startTimer();

  return () => {
    events.forEach(event => {
      window.removeEventListener(event, resetTimer);
    });
    clearTimeout(warningTimeout);
  };
}

export default inactivityTime;
