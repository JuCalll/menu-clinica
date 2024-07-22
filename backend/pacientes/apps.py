"""
Configuración de la aplicación 'pacientes'

Este módulo define la configuración para la aplicación 'pacientes'.
"""

from django.apps import AppConfig

"""
Configuración de la aplicación 'pacientes'
"""
class PacientesConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'pacientes'.
    
    Atributos:
        default_auto_field (str): El tipo de campo auto-incremental predeterminado.
        name (str): El nombre de la aplicación.
    
    Ejemplo:
        En el archivo settings.py de su proyecto de Django, puede agregar la siguiente línea
        para incluir esta aplicación en su proyecto:
        
        INSTALLED_APPS = [
            ...
            'pacientes.apps.PacientesConfig',
            ...
        ]
    """
    # Define el tipo de campo auto incremental predeterminado
    default_auto_field = 'django.db.models.BigAutoField'
    # Nombre de la aplicación
    name = 'pacientes'