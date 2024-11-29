/**
 * Configuración de métricas Web Vitals
 *
 * Recopila métricas de rendimiento clave:
 * - CLS (Cumulative Layout Shift): Mide la estabilidad visual
 * - FID (First Input Delay): Mide la interactividad
 * - FCP (First Contentful Paint): Mide la velocidad de carga inicial
 * - LCP (Largest Contentful Paint): Mide la velocidad de carga percibida
 * - TTFB (Time to First Byte): Mide la respuesta del servidor
 *
 * @param {Function} onPerfEntry - Callback para procesar los resultados de las métricas
 */
const reportWebVitals = (onPerfEntry) => {
  // Verificar que se proporcione una función válida como callback
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Importación dinámica de web-vitals
    import("web-vitals").then(
      ({
        getCLS, // Cumulative Layout Shift
        getFID, // First Input Delay
        getFCP, // First Contentful Paint
        getLCP, // Largest Contentful Paint
        getTTFB, // Time to First Byte
      }) => {
        // Registrar cada métrica usando el callback proporcionado
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      }
    );
  }
};

export default reportWebVitals;
