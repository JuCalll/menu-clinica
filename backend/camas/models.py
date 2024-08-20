from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save  # Importación de post_save
from django.dispatch import receiver  # Importación de receiver
from habitaciones.models import Habitacion

class Cama(models.Model):
    nombre = models.CharField(max_length=50)
    habitacion = models.ForeignKey(Habitacion, related_name='camas', on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)

    class Meta:
        unique_together = ('nombre', 'habitacion')

    def __str__(self):
        return f'{self.nombre} - {self.habitacion.nombre}'

@receiver(post_save, sender=Cama)
def desactivar_paciente(sender, instance, **kwargs):
    if not instance.activo:  # Si la cama se desactiva
        from pacientes.models import Paciente  # Importación dentro de la función para evitar ciclo
        # Desactivar el paciente asociado
        Paciente.objects.filter(cama=instance).update(activo=False)

@receiver(post_save, sender=Cama)
def validar_activacion_cama(sender, instance, **kwargs):
    if instance.activo and not instance.habitacion.activo:
        raise ValidationError('No se puede activar una cama si la habitación no está activa.')