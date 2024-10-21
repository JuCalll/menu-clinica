from django.db import models

class Menu(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class MenuSection(models.Model):
    menu = models.ForeignKey(
        Menu, related_name='sections', on_delete=models.CASCADE
    )
    titulo = models.CharField(max_length=255)

    def __str__(self):
        return self.titulo

class MenuOption(models.Model):
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
        MenuSection, related_name='options', on_delete=models.CASCADE
    )
    texto = models.CharField(max_length=255)
    tipo = models.CharField(
        max_length=50, choices=TIPO_OPCION_CHOICES
    )

    def __str__(self):
        return self.texto
