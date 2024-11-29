"""
Módulo de modelos para la gestión de habitaciones hospitalarias.

Define el modelo Habitación y sus señales asociadas para mantener la integridad
de las relaciones entre servicios, habitaciones, camas y pacientes.
"""

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from servicios.models import Servicio  
from django.core.exceptions import ValidationError

class Habitacion(models.Model):
    """
    Modelo que representa una habitación hospitalaria.
    
    Una habitación está asociada a un servicio específico y puede estar activa o inactiva.
    La desactivación de una habitación implica la desactivación de las camas y pacientes asociados.
    
    Atributos:
        nombre (str): Identificador único de la habitación.
        servicio (Servicio): Servicio al que pertenece la habitación.
        activo (bool): Estado de la habitación (activa/inactiva).
    """
    nombre = models.CharField(max_length=255, unique=True)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        """
        Guarda la habitación verificando las reglas de negocio.
        
        Raises:
            ValidationError: Si se intenta activar una habitación con servicio inactivo.
        """
        if self.activo and not self.servicio.activo:
            raise ValidationError('No se puede activar una habitación si el servicio no está activo.')
        super().save(*args, **kwargs)

@receiver(post_save, sender=Habitacion)
def desactivar_camas_y_pacientes(sender, instance, **kwargs):
    """
    Señal que maneja la desactivación en cascada de camas y pacientes.
    
    Cuando una habitación se desactiva, todas sus camas y los pacientes
    asociados también se desactivan automáticamente.
    
    Args:
        sender: Modelo que envía la señal (Habitacion).
        instance: Instancia de Habitacion que fue guardada.
        kwargs: Argumentos adicionales de la señal.
    """
    if not instance.activo:
        from camas.models import Cama  
        from pacientes.models import Paciente  

        instance.camas.update(activo=False)
        Paciente.objects.filter(cama__habitacion=instance).update(activo=False)
