import pytest
from django.core.exceptions import ValidationError
from servicios.models import Servicio
from habitaciones.models import Habitacion
from camas.models import Cama

@pytest.mark.django_db
def test_habitacion_desactiva_camas():
    # Crear servicio activo
    servicio = Servicio.objects.create(nombre="Cardiología", activo=True)
    
    # Crear habitación activa
    habitacion = Habitacion.objects.create(nombre="Habitación 101", servicio=servicio, activo=True)
    
    # Crear camas activas asociadas a la habitación
    cama1 = Cama.objects.create(nombre="Cama 1", habitacion=habitacion, activo=True)
    cama2 = Cama.objects.create(nombre="Cama 2", habitacion=habitacion, activo=True)
    
    # Desactivar la habitación
    habitacion.activo = False
    habitacion.save()
    
    # Verificar que las camas asociadas se desactivan
    cama1.refresh_from_db()
    cama2.refresh_from_db()
    assert not cama1.activo
    assert not cama2.activo

@pytest.mark.django_db
def test_no_activar_cama_si_habitacion_desactivada():
    # Crear servicio activo
    servicio = Servicio.objects.create(nombre="Neurología", activo=True)
    
    # Crear habitación desactivada
    habitacion = Habitacion.objects.create(nombre="Habitación 202", servicio=servicio, activo=False)
    
    # Crear cama asociada a la habitación
    cama = Cama.objects.create(nombre="Cama 1", habitacion=habitacion, activo=False)
    
    # Intentar activar la cama
    cama.activo = True
    with pytest.raises(ValidationError):
        cama.save()

@pytest.mark.django_db
def test_no_activar_habitacion_si_servicio_desactivado():
    # Crear servicio desactivado
    servicio = Servicio.objects.create(nombre="Oncología", activo=False)
    
    # Crear habitación asociada al servicio
    habitacion = Habitacion.objects.create(nombre="Habitación 303", servicio=servicio, activo=False)
    
    # Intentar activar la habitación
    habitacion.activo = True
    with pytest.raises(ValidationError):
        habitacion.save()

@pytest.mark.django_db
def test_activar_habitacion_reactiva_camas():
    # Crear servicio activo
    servicio = Servicio.objects.create(nombre="Pediatría", activo=True)
    
    # Crear habitación y camas desactivadas
    habitacion = Habitacion.objects.create(nombre="Habitación 404", servicio=servicio, activo=False)
    cama1 = Cama.objects.create(nombre="Cama 1", habitacion=habitacion, activo=False)
    cama2 = Cama.objects.create(nombre="Cama 2", habitacion=habitacion, activo=False)
    
    # Activar la habitación
    habitacion.activo = True
    habitacion.save()

    # Activar las camas
    cama1.activo = True
    cama1.save()
    cama2.activo = True
    cama2.save()

    # Verificar que las camas se reactivan solo si la habitación está activa
    cama1.refresh_from_db()
    cama2.refresh_from_db()
    assert cama1.activo
    assert cama2.activo
