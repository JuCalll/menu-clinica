from django.db import models

class Servicio(models.Model):
    """
    Modelo que representa un servicio de la clínica.

    Attributes:
        nombre (CharField): El nombre del servicio.

    Returns:
        str: El nombre del servicio como cadena de texto.

    Example:
        >>> servicio = Servicio(nombre="Juan Ciudad")
        >>> print(servicio)  # Output: Juan Ciudad
    """
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre