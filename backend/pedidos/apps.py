"""
Configuración de la aplicación Pedidos.

Este módulo define la configuración básica de la aplicación Pedidos, 
que maneja todo lo relacionado con la gestión de pedidos de comidas y bebidas
en el sistema hospitalario.

Attributes:
    default_auto_field (str): Campo automático predeterminado para modelos.
    name (str): Nombre de la aplicación.
"""

from django.apps import AppConfig

class PedidosConfig(AppConfig):
    """
    Clase de configuración para la aplicación Pedidos.
    
    Esta clase hereda de AppConfig y proporciona la configuración básica
    necesaria para que Django reconozca y gestione la aplicación Pedidos.
    
    Attributes:
        default_auto_field (str): Define el tipo de campo automático para las 
            claves primarias en los modelos.
        name (str): Nombre de la aplicación como está registrada en INSTALLED_APPS.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pedidos'
