"""
Configuración de la aplicación de menús.
Este módulo define la configuración básica de la aplicación 'menus'
para la gestión de menús hospitalarios.
"""

from django.apps import AppConfig

class MenusConfig(AppConfig):
    """
    Clase de configuración para la aplicación de menús.
    
    Atributos:
        default_auto_field (str): Define el tipo de campo automático para las claves primarias.
        name (str): Nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'menus'
