from django.db import models

# Definición del modelo Paciente
class Paciente(models.Model):
    # Nombre del paciente, campo de texto con longitud máxima de 100 caracteres
    name = models.CharField(max_length=100)
    # Habitación del paciente, campo de texto con longitud máxima de 10 caracteres
    room = models.CharField(max_length=10)
    # Dieta recomendada para el paciente, campo de texto con longitud máxima de 255 caracteres
    recommended_diet = models.CharField(max_length=255)

    # Método para devolver el nombre del paciente como representación en cadena del objeto
    def __str__(self):
        return self.name
