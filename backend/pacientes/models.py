# Importamos el módulo models de Django para crear modelos
from django.db import models
# Importamos ValidationError desde django.core.exceptions para manejar errores de validación
from django.core.exceptions import ValidationError
# Importamos el modelo Habitacion desde habitaciones.models
from habitaciones.models import Habitacion

# Definimos un modelo para representar un paciente
class Paciente(models.Model):
    # Campo para almacenar el nombre del paciente, es un campo de texto con un máximo de 100 caracteres
    name = models.CharField(max_length=100)
    # Relación de clave foránea a la tabla Habitacion, indicando que un paciente está asociado a una habitación
    # on_delete=models.CASCADE asegura que si una habitación es eliminada, los pacientes asociados también lo sean
    room = models.ForeignKey(Habitacion, on_delete=models.CASCADE)
    # Campo para almacenar la dieta recomendada para el paciente, es un campo de texto con un máximo de 255 caracteres
    recommended_diet = models.CharField(max_length=255)

    # Sobrescribimos el método save para agregar validación personalizada antes de guardar el modelo
    def save(self, *args, **kwargs):
        # Verificamos si ya existen 2 pacientes asignados a la misma habitación
        if Paciente.objects.filter(room=self.room).count() >= 2:
            # Si ya hay 2 pacientes, lanzamos un error de validación
            raise ValidationError('No se pueden asignar más de 2 pacientes a esta habitación.')
        # Si pasa la validación, llamamos al método save del padre para guardar la instancia
        super(Paciente, self).save(*args, **kwargs)

    # Definimos una función para representar el paciente como una cadena de texto
    def __str__(self):
        # Devolvemos el nombre del paciente como su representación en cadena
        return self.name
