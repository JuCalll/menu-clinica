from django.db import models

# Definimos el modelo Menu
class Menu(models.Model):
    # Campo de texto para el nombre del menú con un máximo de 255 caracteres
    name = models.CharField(max_length=255)
    # Campo de texto para la descripción del menú
    description = models.TextField()
    # Campo booleano para indicar si el menú está disponible, por defecto es True
    is_available = models.BooleanField(default=True)

    # Método para representar el objeto Menu como una cadena
    def __str__(self):
        return self.name
