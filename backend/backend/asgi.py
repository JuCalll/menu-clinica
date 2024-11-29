"""
Configuración ASGI para el proyecto backend.

Expone el callable ASGI como una variable de módulo llamada 'application'.

Para más información sobre este archivo, ver:
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

# Configura la variable de entorno para las configuraciones de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Obtiene la aplicación ASGI
application = get_asgi_application()
