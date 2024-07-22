from django.apps import AppConfig


class ServiciosConfig(AppConfig):
    """
    Clase de configuración para la aplicación 'servicios'.

    Esta clase hereda de `django.apps.AppConfig` y se utiliza para configurar la aplicación 'servicios'.

    Atributos:
        default_auto_field (str): El campo automático predeterminado que se utilizará para los modelos en esta aplicación.
        name (str): El nombre de la aplicación.

    Ejemplo:
        En el archivo `settings.py` de su proyecto de Django, agregaría la siguiente línea para incluir esta aplicación:

        ```
        INSTALLED_APPS = [
            #...
            'servicios.apps.ServiciosConfig',
            #...
        ]
        ```
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'servicios'