"""
Configuración de la aplicación de camas.
Este módulo define la configuración básica de la aplicación 'camas'.
"""

from django.apps import AppConfig

class CamasConfig(AppConfig):
    """
    Clase de configuración para la aplicación de camas.
    
    Atributos:
        default_auto_field (str): Define el tipo de campo automático para las claves primarias.
        name (str): Nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'camas'
