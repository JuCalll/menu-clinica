# Importamos el módulo de modelos de Django
from django.db import models

# Definimos un modelo para representar un menú
class Menu(models.Model):
    # El menú tiene un nombre, que es un campo de texto con un máximo de 255 caracteres
    nombre = models.CharField(max_length=255)

    # Representamos el menú como una cadena de texto
    def __str__(self):
        # Devolvemos el nombre del menú
        return self.nombre

# Definimos un modelo para representar una sección de un menú
class MenuSection(models.Model):
    # La sección pertenece a un menú, por lo que creamos una relación ForeignKey
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='sections')
    # La sección tiene un título, que es un campo de texto con un máximo de 255 caracteres
    titulo = models.CharField(max_length=255)

    # Representamos la sección como una cadena de texto
    def __str__(self):
        # Devolvemos el título de la sección
        return self.titulo

# Definimos un modelo para representar una opción de un menú
class MenuOption(models.Model):
    # La opción pertenece a una sección, por lo que creamos una relación ForeignKey
    section = models.ForeignKey(MenuSection, on_delete=models.CASCADE, related_name='options')
    # La opción tiene un texto, que es un campo de texto con un máximo de 255 caracteres
    texto = models.CharField(max_length=255)
    # La opción tiene un tipo, que es un campo de texto con un máximo de 50 caracteres
    # Este campo puede ser usado para categorizar la opción (por ejemplo, 'opciones', 'bebida', 'adicional', etc.)
    tipo = models.CharField(max_length=50)

    # Representamos la opción como una cadena de texto
    def __str__(self):
        # Devolvemos el texto de la opción
        return self.texto
