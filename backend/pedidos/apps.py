"""
Configuración de la aplicación 'pedidos'

Este módulo define la configuración para la aplicación 'pedidos'.

Example:
    En el archivo `settings.py`, agregar 'pedidos' a la lista de INSTALLED_APPS para habilitar esta aplicación.
    ```
    python
    INSTALLED_APPS = [
        # ...
        'pedidos',
        # ...
    ]
    ```
"""

from django.apps import AppConfig

"""
Configuración de la aplicación 'pedidos'
"""
class PedidosConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'pedidos'.

    Atributos:
        default_auto_field (str): El tipo de campo auto-incremental predeterminado.
        name (str): El nombre de la aplicación.
    """
    default_auto_field = 'django.db.models.BigAutoField'  # Tipo de campo auto-incremental predeterminado
    name = 'pedidos'  # Nombre de la aplicación