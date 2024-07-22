from django.db import models
from django.core.exceptions import ValidationError
from habitaciones.models import Habitacion

class Paciente(models.Model):
    name = models.CharField(max_length=100)
    room = models.ForeignKey(Habitacion, on_delete=models.CASCADE)
    recommended_diet = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        if Paciente.objects.filter(room=self.room).count() >= 2:
            raise ValidationError('No se pueden asignar más de 2 pacientes a esta habitación.')
        super(Paciente, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
