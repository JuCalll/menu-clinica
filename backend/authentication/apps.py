"""
Configuración de la aplicación de autenticación.
Este módulo define la configuración básica de la aplicación 'authentication'.
"""

from django.apps import AppConfig

class AuthenticationConfig(AppConfig):
    """
    Clase de configuración para la aplicación de autenticación.
    
    Atributos:
        default_auto_field (str): Define el tipo de campo automático para las claves primarias.
        name (str): Nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
