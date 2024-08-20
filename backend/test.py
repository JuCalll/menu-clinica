import pytest
from django.core.exceptions import ValidationError
from camas.models import Cama
from habitaciones.models import Habitacion
from servicios.models import Servicio
from pacientes.models import Paciente

@pytest.mark.django_db
def test_paciente_no_puede_activarse_con_cama_desactivada():
    # Crear un servicio y una habitación activa
    servicio = Servicio.objects.create(nombre="Cardiología", activo=True)
    habitacion = Habitacion.objects.create(nombre="Habitación 101", servicio=servicio, activo=True)
    
    # Crear una cama desactivada
    cama = Cama.objects.create(nombre="Cama 1", habitacion=habitacion, activo=False)
    
    # Crear un paciente que intenta activarse
    paciente = Paciente.objects.create(id="1234567890", name="Juan Pérez", cama=cama, recommended_diet="Hipoglucida", activo=False)
    
    # Intentar activar el paciente
    paciente.activo = True
    
    with pytest.raises(ValidationError):
        paciente.save()

@pytest.mark.django_db
def test_paciente_no_puede_activarse_con_habitacion_desactivada():
    # Crear un servicio activo y una habitación desactivada
    servicio = Servicio.objects.create(nombre="Cardiología", activo=True)
    habitacion = Habitacion.objects.create(nombre="Habitación 101", servicio=servicio, activo=False)
    
    # Crear una cama activa en la habitación desactivada
    cama = Cama.objects.create(nombre="Cama 1", habitacion=habitacion, activo=True)
    
    # Crear un paciente que intenta activarse
    paciente = Paciente.objects.create(id="1234567890", name="Juan Pérez", cama=cama, recommended_diet="Hipoglucida", activo=False)
    
    # Intentar activar el paciente
    paciente.activo = True
    
    with pytest.raises(ValidationError):
        paciente.save()

@pytest.mark.django_db
def test_paciente_no_puede_activarse_con_servicio_desactivado():
    # Crear un servicio desactivado y una habitación
    servicio = Servicio.objects.create(nombre="Cardiología", activo=False)
    habitacion = Habitacion.objects.create(nombre="Habitación 101", servicio=servicio, activo=True)
    
    # Crear una cama activa en la habitación activa
    cama = Cama.objects.create(nombre="Cama 1", habitacion=habitacion, activo=True)
    
    # Crear un paciente que intenta activarse
    paciente = Paciente.objects.create(id="1234567890", name="Juan Pérez", cama=cama, recommended_diet="Hipoglucida", activo=False)
    
    # Intentar activar el paciente
    paciente.activo = True
    
    with pytest.raises(ValidationError):
        paciente.save()

@pytest.mark.django_db
def test_paciente_puede_activarse_correctamente():
    # Crear un servicio, habitación y cama activos
    servicio = Servicio.objects.create(nombre="Cardiología", activo=True)
    habitacion = Habitacion.objects.create(nombre="Habitación 101", servicio=servicio, activo=True)
    cama = Cama.objects.create(nombre="Cama 1", habitacion=habitacion, activo=True)
    
    # Crear un paciente que se puede activar
    paciente = Paciente.objects.create(id="1234567890", name="Juan Pérez", cama=cama, recommended_diet="Hipoglucida", activo=False)
    
    # Activar el paciente
    paciente.activo = True
    paciente.save()
    
    # Verificar que el paciente se haya activado correctamente
    paciente.refresh_from_db()
    assert paciente.activo is True

