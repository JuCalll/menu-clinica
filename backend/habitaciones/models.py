from django.db import models
from servicios.models import Servicio

class Habitacion(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
