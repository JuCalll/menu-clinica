# Importamos el módulo models de Django para crear modelos
from django.db import models

# Definimos un modelo para representar un servicio
class Servicio(models.Model):
    # Campo para almacenar el nombre del servicio, es un campo de texto con un máximo de 255 caracteres
    nombre = models.CharField(max_length=255)

    # Definimos una función para representar el servicio como una cadena de texto
    def __str__(self):
        # Devolvemos el nombre del servicio como su representación en cadena
        return self.nombre
