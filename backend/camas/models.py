from django.db import models
from habitaciones.models import Habitacion

class Cama(models.Model):
    nombre = models.CharField(max_length=50)
    habitacion = models.ForeignKey(Habitacion, related_name='camas', on_delete=models.CASCADE)
    activo = models.BooleanField(default=True)

    class Meta:
        unique_together = ('nombre', 'habitacion')

    def __str__(self):
        return f'{self.nombre} - {self.habitacion.nombre}'
