from django.db import models
from django.core.exceptions import ValidationError
from habitaciones.models import Habitacion

class Paciente(models.Model):
    name = models.CharField(max_length=100)
    room = models.ForeignKey(Habitacion, on_delete=models.CASCADE)
    recommended_diet = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)  # Nuevo campo para controlar el estado de habilitación

    def save(self, *args, **kwargs):
        if Paciente.objects.filter(room=self.room, activo=True).count() >= 2:
            raise ValidationError('No se pueden asignar más de 2 pacientes activos a esta habitación.')
        super(Paciente, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
