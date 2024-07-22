"""
Configuración de la aplicación 'menu'.

Esta clase de configuración se utiliza para definir el tipo de campo automático predeterminado y el nombre de la aplicación.

Ejemplo:
    En el archivo `settings.py` de su proyecto de Django, puede agregar la siguiente línea para incluir esta aplicación:

    INSTALLED_APPS = [
       ...
        'menu.MenuConfig',
       ...
    ]
"""

# Importamos AppConfig desde django.apps
from django.apps import AppConfig

"""
MenuConfig

Configuración de la aplicación 'menu'.
"""
class MenuConfig(AppConfig):
    """
    Configura la aplicación 'menu'.
    
    Atributos:
        default_auto_field (str): El tipo de campo automático predeterminado.
        name (str): El nombre de la aplicación.
    """
    # Especificamos el tipo de campo automático predeterminado
    default_auto_field = 'django.db.models.BigAutoField'
    # Nombre de la aplicación
    name = 'menu'