# authentication/apps.py

"""
Archivo de configuración para la aplicación 'authentication'.
"""

from django.apps import AppConfig

class AuthenticationConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'authentication'.

    Atributos:
        default_auto_field (str): El tipo de campo de clave primaria predeterminado para los modelos de esta aplicación.
        name (str): El nombre de la aplicación.
    """

    # Especifica el tipo de campo de clave primaria predeterminado para los modelos de esta aplicación
    default_auto_field = 'django.db.models.BigAutoField'

    # Nombre de la aplicación
    name = 'authentication'
