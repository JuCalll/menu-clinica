from django.db import models
from servicios.models import Servicio

class Habitacion(models.Model):
    numero = models.CharField(max_length=10)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)

    def __str__(self):
        return self.numero