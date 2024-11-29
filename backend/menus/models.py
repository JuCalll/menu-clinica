"""
Módulo de modelos para la gestión de menús hospitalarios.

Define los modelos para estructurar los menús del hospital:
- Menús principales
- Secciones de menú
- Opciones específicas por sección
"""

from django.db import models

class Menu(models.Model):
    """
    Modelo que representa un menú hospitalario.
    
    Un menú es una colección de secciones que organizan las diferentes
    opciones de alimentación disponibles.
    
    Atributos:
        nombre (str): Nombre identificativo del menú.
    """
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class MenuSection(models.Model):
    """
    Modelo que representa una sección dentro de un menú.
    
    Cada sección agrupa opciones relacionadas del menú, como entradas,
    platos principales, postres, etc.
    
    Atributos:
        menu (Menu): Menú al que pertenece la sección.
        titulo (str): Título descriptivo de la sección.
    """
    menu = models.ForeignKey(
        Menu, 
        related_name='sections', 
        on_delete=models.CASCADE
    )
    titulo = models.CharField(max_length=255)

    def __str__(self):
        return self.titulo

class MenuOption(models.Model):
    """
    Modelo que representa una opción específica dentro de una sección del menú.
    
    Cada opción tiene un tipo específico que determina su categoría
    dentro del menú (entrada, plato principal, postre, etc.).
    
    Atributos:
        section (MenuSection): Sección a la que pertenece la opción.
        texto (str): Descripción de la opción del menú.
        tipo (str): Categoría de la opción (entrada, plato principal, etc.).
    """
    TIPO_OPCION_CHOICES = [
        ('entrada', 'Entrada'),
        ('huevos', 'Huevos'),
        ('acompanante', 'Acompañante'),
        ('toppings', 'Toppings'),
        ('bebidas', 'Bebidas'),
        ('media_manana_fit', 'Media Mañana Fit'),
        ('media_manana_tradicional', 'Media Mañana Tradicional'),
        ('bebidas_calientes', 'Bebidas Calientes'),
        ('bebidas_frias', 'Bebidas Frías'),
        ('sopa_del_dia', 'Sopa del Día'),
        ('plato_principal', 'Plato Principal'),
        ('vegetariano', 'Vegetariano'),
        ('vegetales', 'Vegetales'),
        ('postre', 'Postre'),
        ('refrigerio_fit', 'Refrigerio Fit'),
        ('refrigerio_tradicional', 'Refrigerio Tradicional'),
        ('adicionales', 'Adicionales'),
    ]

    section = models.ForeignKey(
        MenuSection, 
        related_name='options', 
        on_delete=models.CASCADE
    )
    texto = models.CharField(max_length=255)
    tipo = models.CharField(
        max_length=50, 
        choices=TIPO_OPCION_CHOICES
    )

    def __str__(self):
        return self.texto
