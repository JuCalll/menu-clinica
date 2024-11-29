"""
Configuración de la aplicación de dietas.
Este módulo define la configuración básica de la aplicación 'dietas'.
"""

from django.apps import AppConfig

class DietasConfig(AppConfig):
    """
    Clase de configuración para la aplicación de dietas.
    
    Atributos:
        default_auto_field (str): Define el tipo de campo automático para las claves primarias.
        name (str): Nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dietas'
