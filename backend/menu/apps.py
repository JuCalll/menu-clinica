# Importamos AppConfig desde django.apps
from django.apps import AppConfig

# Definimos la configuración de la aplicación 'menu'
class MenuConfig(AppConfig):
    # Especificamos el tipo de campo automático predeterminado
    default_auto_field = 'django.db.models.BigAutoField'
    # Nombre de la aplicación
    name = 'menu'
