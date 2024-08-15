from django.db import models

class Servicio(models.Model):
    nombre = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)  # Nuevo campo para controlar el estado de habilitación

    def __str__(self):
        return self.nombre
