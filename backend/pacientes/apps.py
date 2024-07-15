from django.apps import AppConfig

# Configuración de la aplicación 'pacientes'
class PacientesConfig(AppConfig):
    # Define el tipo de campo auto incremental predeterminado
    default_auto_field = 'django.db.models.BigAutoField'
    # Nombre de la aplicación
    name = 'pacientes'
