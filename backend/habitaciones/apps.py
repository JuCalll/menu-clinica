from django.apps import AppConfig

"""
Configuración del app 'habitaciones'.

Esta clase hereda de AppConfig y se utiliza para configurar el app 'habitaciones' en un proyecto de Django.

Atributos:
    default_auto_field (str): El tipo de campo de autoincremento predeterminado para los modelos de este app.
    name (str): El nombre del app.

Ejemplo:
    Para utilizar esta configuración, agrega la siguiente línea a la lista de INSTALLED_APPS en tu archivo settings.py:

    INSTALLED_APPS = [
        ...
        'habitaciones.apps.HabitacionesConfig',
        ...
    ]
"""
class HabitacionesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'habitaciones'