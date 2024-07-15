from django.apps import AppConfig

# Configuración de la aplicación 'pedidos'
class PedidosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'  # Tipo de campo auto-incremental predeterminado
    name = 'pedidos'  # Nombre de la aplicación
