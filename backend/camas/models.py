from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
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
    if not instance.activo:
        from pacientes.models import Paciente
        Paciente.objects.filter(cama=instance).update(activo=False)

@receiver(pre_save, sender=Cama)
def validar_activacion_cama(sender, instance, **kwargs):
    if instance.activo and not instance.habitacion.activo:
        raise ValidationError('No se puede activar una cama si la habitación no está activa.')
