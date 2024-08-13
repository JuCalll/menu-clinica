# Importamos el módulo models de Django para crear modelos
from django.db import models
# Importamos el modelo Servicio desde el archivo servicios.models
from servicios.models import Servicio

# Definimos un modelo para representar una habitación
class Habitacion(models.Model):
    # Campo para almacenar el número de la habitación, es un campo de texto con un máximo de 10 caracteres
    numero = models.CharField(max_length=10)
    # Relación de clave foránea a la tabla Servicio, indicando que una habitación está asociada a un servicio
    # on_delete=models.CASCADE asegura que si un servicio es eliminado, las habitaciones asociadas también lo sean
    servicio = models.ForeignKey(Servicio, on_delete=models.CASCADE)

    # Definimos una función para representar la habitación como una cadena de texto
    def __str__(self):
        # Devolvemos el número de la habitación como su representación en cadena
        return self.numero
