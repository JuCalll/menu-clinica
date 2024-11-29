"""
Configuración de la aplicación de servicios hospitalarios.

Este módulo define la configuración básica de la aplicación 'servicios'
que gestiona los diferentes servicios o departamentos del hospital.

Attributes:
    default_auto_field (str): Campo automático predeterminado para modelos.
    name (str): Nombre de la aplicación.
"""

from django.apps import AppConfig

class ServiciosConfig(AppConfig):
    """
    Clase de configuración para la aplicación de servicios.
    
    Esta clase hereda de AppConfig y proporciona la configuración básica
    necesaria para que Django reconozca y gestione la aplicación Servicios.
    
    Attributes:
        default_auto_field (str): Define el tipo de campo automático para las 
            claves primarias en los modelos.
        name (str): Nombre de la aplicación como está registrada en INSTALLED_APPS.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'servicios'
