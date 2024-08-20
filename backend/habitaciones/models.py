from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from servicios.models import Servicio  # Esto puede quedarse igual porque no crea un ciclo
from django.core.exceptions import ValidationError

class Habitacion(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        if self.activo and not self.servicio.activo:
            raise ValidationError('No se puede activar una habitación si el servicio no está activo.')
        super().save(*args, **kwargs)

@receiver(post_save, sender=Habitacion)
def desactivar_camas_y_pacientes(sender, instance, **kwargs):
    if not instance.activo:
        from camas.models import Cama  # Importación dentro de la función para evitar ciclo
        from pacientes.models import Paciente  # Importación dentro de la función para evitar ciclo

        instance.camas.update(activo=False)
        Paciente.objects.filter(cama__habitacion=instance).update(activo=False)
