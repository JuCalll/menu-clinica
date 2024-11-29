"""
Configuración de la aplicación de logs.
Este módulo define la configuración básica de la aplicación 'logs' para el registro
de actividades del sistema.
"""

from django.apps import AppConfig

class LogsConfig(AppConfig):
    """
    Clase de configuración para la aplicación de logs.
    
    Atributos:
        default_auto_field (str): Define el tipo de campo automático para las claves primarias.
        name (str): Nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'logs'
