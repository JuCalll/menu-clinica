from django.db import models
from django.core.exceptions import ValidationError
from camas.models import Cama

class Paciente(models.Model):
    id = models.CharField(max_length=20, primary_key=True)  # Número de cédula
    name = models.CharField(max_length=100)
    cama = models.ForeignKey(Cama, on_delete=models.CASCADE)
    recommended_diet = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if self.activo:
            if not self.cama.activo:
                raise ValidationError('No se puede activar un paciente porque la cama no está activa.')
            if not self.cama.habitacion.activo:
                raise ValidationError('No se puede activar un paciente porque la habitación no está activa.')
            if not self.cama.habitacion.servicio.activo:
                raise ValidationError('No se puede activar un paciente porque el servicio no está activo.')
        super(Paciente, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
