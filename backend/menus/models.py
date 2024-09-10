from django.db import models

class Menu(models.Model):
    nombre = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre

class MenuSection(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='sections')
    titulo = models.CharField(max_length=255)

    def __str__(self):
        return self.titulo

class MenuOption(models.Model):
    section = models.ForeignKey(MenuSection, on_delete=models.CASCADE, related_name='options')
    texto = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50)

    def __str__(self):
        return self.texto
