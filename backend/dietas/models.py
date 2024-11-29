"""
Módulo de modelos para la gestión de dietas y alergias.

Define los modelos para manejar las dietas recomendadas y alergias
de los pacientes en el sistema hospitalario.
"""

from django.db import models

class Dieta(models.Model):
    """
    Modelo que representa una dieta hospitalaria.
    
    Una dieta puede ser asignada a múltiples pacientes y contiene
    información sobre el régimen alimenticio recomendado.
    
    Atributos:
        nombre (str): Nombre único de la dieta.
        descripcion (str): Descripción detallada de la dieta.
        activo (bool): Estado de la dieta (activa/inactiva).
    """
    nombre = models.CharField(max_length=255, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class Alergia(models.Model):
    """
    Modelo que representa una alergia alimentaria.
    
    Registra las alergias que pueden tener los pacientes para
    considerarlas en la preparación de sus alimentos.
    
    Atributos:
        nombre (str): Nombre único de la alergia.
        descripcion (str): Descripción detallada de la alergia.
        activo (bool): Estado de la alergia (activa/inactiva).
    """
    nombre = models.CharField(max_length=255, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
