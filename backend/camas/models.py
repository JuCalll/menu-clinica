"""
Módulo de modelos para la gestión de camas.

Define el modelo Cama y sus señales asociadas para mantener la integridad
de las relaciones entre camas, habitaciones y pacientes.
"""

from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from habitaciones.models import Habitacion

class Cama(models.Model):
    """
    Modelo que representa una cama hospitalaria.
    
    Una cama está asociada a una habitación específica y puede estar activa o inactiva.
    La desactivación de una cama implica la desactivación de los pacientes asociados.
    
    Atributos:
        nombre (str): Identificador único de la cama dentro de una habitación.
        habitacion (Habitacion): Habitación a la que pertenece la cama.
        activo (bool): Estado de la cama (activa/inactiva).
    """
    nombre = models.CharField(max_length=50)
    habitacion = models.ForeignKey(
        Habitacion, 
        related_name='camas', 
        on_delete=models.CASCADE
    )
    activo = models.BooleanField(default=True)

    class Meta:
        unique_together = ('nombre', 'habitacion')

    def __str__(self):
        return f'{self.nombre} - {self.habitacion.nombre}'

@receiver(post_save, sender=Cama)
def desactivar_paciente(sender, instance, **kwargs):
    """
    Señal que desactiva automáticamente los pacientes asociados cuando se desactiva una cama.
    
    Args:
        sender: Modelo que envía la señal (Cama).
        instance: Instancia de Cama que fue guardada.
        kwargs: Argumentos adicionales de la señal.
    """
    if not instance.activo:
        from pacientes.models import Paciente
        Paciente.objects.filter(cama=instance).update(activo=False)

@receiver(pre_save, sender=Cama)
def validar_activacion_cama(sender, instance, **kwargs):
    """
    Señal que valida que una cama solo pueda activarse si su habitación está activa.
    
    Args:
        sender: Modelo que envía la señal (Cama).
        instance: Instancia de Cama que será guardada.
        kwargs: Argumentos adicionales de la señal.
    
    Raises:
        ValidationError: Si se intenta activar una cama con habitación inactiva.
    """
    if instance.activo and not instance.habitacion.activo:
        raise ValidationError('No se puede activar una cama si la habitación no está activa.')
