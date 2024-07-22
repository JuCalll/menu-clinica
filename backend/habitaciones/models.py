from django.db import models
from servicios.models import Servicio

class Habitacion(models.Model):
    """
    Representa una habitación de la clínica.

    Atributos:
        numero (CharField): El número de la habitación (por ejemplo, "101", "202", etc.).
        servicio (ForeignKey): El servicio asociado con la habitación (por ejemplo, "Juan Ciudad", "Piso Mujeres", etc.).

    Ejemplo:
        >>> habitacion = Habitacion(numero="101", servicio=Servicio.objects.get(id=1))
        >>> print(habitacion)  # Salida: 101
    """
    numero = models.CharField(max_length=10)
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)

    def __str__(self):
        return self.numero