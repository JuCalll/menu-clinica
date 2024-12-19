import React from 'react';

const PrintableSection = ({ pedido, section }) => {
  const formatTitle = (title) => {
    return title
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Función para formatear las observaciones
  const formatObservaciones = (text) => {
    if (!text) return '';
    // Asegurarse de que las líneas largas se dividan correctamente
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  // Función auxiliar para formatear arrays de objetos (dietas o alergias)
  const formatArrayData = (data) => {
    if (!data) return 'No especificada';
    if (Array.isArray(data)) {
      return data
        .map(item => typeof item === 'object' ? item.nombre : item)
        .filter(Boolean)
        .join(', ') || 'No especificada';
    }
    if (typeof data === 'object' && data !== null) {
      return data.nombre || 'No especificada';
    }
    return data || 'No especificada';
  };

  return (
    <div className="printable-section">
      <div className="print-header">
        <h2>Pedido #{pedido.id}</h2>
        <p>{new Date().toLocaleString()}</p>
      </div>

      <div className="patient-info">
        <h3>Datos del Paciente</h3>
        <p><strong>Nombre:</strong> {pedido.paciente.name}</p>
        <p><strong>Dietas:</strong> {formatArrayData(pedido.paciente.dietas)}</p>
        {pedido.paciente.alergias && (
          <p><strong>Alergias:</strong> {formatArrayData(pedido.paciente.alergias)}</p>
        )}
        <p><strong>Sección:</strong> {formatTitle(section.titulo)} ({pedido.menu.nombre})</p>
      </div>

      <div className="location-info">
        <h3>Ubicación</h3>
        <p><strong>Servicio:</strong> {pedido.paciente.cama.habitacion.servicio.nombre}</p>
        <p><strong>Habitación:</strong> {pedido.paciente.cama.habitacion.nombre}</p>
        <p><strong>Cama:</strong> {pedido.paciente.cama.nombre}</p>
      </div>

      {pedido.observaciones && (
        <div className="observaciones">
          <h3>Observaciones</h3>
          <p>{formatObservaciones(pedido.observaciones)}</p>
        </div>
      )}
    </div>
  );
};

export default PrintableSection;
