from django.db import models
from django.core.exceptions import ValidationError
from camas.models import Cama  # Actualizamos la importación de Cama desde la nueva aplicación

class Paciente(models.Model):
    id = models.CharField(max_length=20, primary_key=True)  # Número de cédula
    name = models.CharField(max_length=100)
    cama = models.ForeignKey(Cama, on_delete=models.CASCADE)
    recommended_diet = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if Paciente.objects.filter(cama=self.cama, activo=True).exists():
            raise ValidationError('No se puede asignar más de un paciente activo a la misma cama.')
        super(Paciente, self).save(*args, **kwargs)

    def __str__(self):
        return self.name
