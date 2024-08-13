# Importamos el módulo AppConfig de Django
from django.apps import AppConfig

# Definimos la configuración de la aplicación 'habitaciones'
class HabitacionesConfig(AppConfig):
    # Especificamos el tipo de campo por defecto para los modelos en esta aplicación
    default_auto_field = 'django.db.models.BigAutoField'
    # Especificamos el nombre de la aplicación
    name = 'habitaciones'
