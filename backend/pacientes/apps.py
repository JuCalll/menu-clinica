"""
Configuración de la aplicación de pacientes.

Este módulo define la configuración básica de la aplicación 'pacientes'
para la gestión de pacientes hospitalarios y sus datos asociados.
"""

from django.apps import AppConfig

class PacientesConfig(AppConfig):
    """
    Clase de configuración para la aplicación de pacientes.
    
    Atributos:
        default_auto_field (str): Define el tipo de campo automático para las claves primarias.
        name (str): Nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pacientes'
