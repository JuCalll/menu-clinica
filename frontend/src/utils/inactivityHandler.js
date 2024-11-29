/**
 * Manejador de inactividad del usuario que controla los tiempos de advertencia y cierre de sesión
 * @param {Function} showWarningCallback - Función que muestra la advertencia de inactividad
 * @param {Function} onActivity - Función que se ejecuta cuando hay actividad del usuario
 * @returns {Function} Función de limpieza que remueve los event listeners
 */
function inactivityTime(showWarningCallback, onActivity) {
  // Temporizadores para advertencia y cierre de sesión
  let warningTimeout;
  let logoutTimeout;

  // Constantes de tiempo en milisegundos
  const WARNING_TIME = 50 * 60 * 1000;  // 50 minutos para mostrar advertencia
  const LOGOUT_TIME = 55 * 60 * 1000;   // 55 minutos para cerrar sesión

  /**
   * Maneja cualquier actividad del usuario
   * Ejecuta el callback onActivity y reinicia los temporizadores
   */
  function handleActivity() {
    if (typeof onActivity === "function") {
      onActivity();
    }
    resetTimer();
  }

  /**
   * Reinicia los temporizadores de advertencia y cierre de sesión
   */
  function resetTimer() {
    clearTimeout(warningTimeout);
    clearTimeout(logoutTimeout);
    startTimer();
  }

  /**
   * Inicia el temporizador de inactividad
   * Muestra la advertencia después de WARNING_TIME
   * Cierra la sesión después de LOGOUT_TIME
   */
  function startTimer() {
    warningTimeout = setTimeout(() => {
      if (typeof showWarningCallback === "function") {
        showWarningCallback(true);
        // Inicia el temporizador para el cierre de sesión
        logoutTimeout = setTimeout(() => {
          window.dispatchEvent(new CustomEvent('tokenExpired'));
        }, LOGOUT_TIME - WARNING_TIME);
      }
    }, WARNING_TIME);
  }

  // Lista de eventos que se consideran como actividad del usuario
  const events = [
    'mousemove',    // Movimiento del mouse
    'mousedown',    // Clic del mouse presionado
    'click',        // Clic completo
    'scroll',       // Desplazamiento
    'keypress',     // Tecla presionada
    'keydown',      // Tecla hacia abajo
    'touchstart',   // Toque en pantalla
  ];

  // Agregar listeners para todos los eventos
  events.forEach(event => {
    window.addEventListener(event, handleActivity);
  });

  // Iniciar el temporizador
  startTimer();

  /**
   * Función de limpieza que remueve todos los event listeners
   * y limpia los temporizadores pendientes
   */
  return () => {
    events.forEach(event => {
      window.removeEventListener(event, handleActivity);
    });
    clearTimeout(warningTimeout);
    clearTimeout(logoutTimeout);
  };
}

export default inactivityTime;
