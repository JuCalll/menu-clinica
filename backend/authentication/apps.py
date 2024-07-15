from django.apps import AppConfig

# Definición de la configuración para la aplicación 'authentication'
class AuthenticationConfig(AppConfig):
    # Especifica el tipo de campo de clave primaria predeterminado para los modelos de esta aplicación
    default_auto_field = 'django.db.models.BigAutoField'
    # Nombre de la aplicación
    name = 'authentication'
