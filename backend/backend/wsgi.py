"""
Configuración WSGI para el proyecto backend.

Expone el callable WSGI como una variable de módulo llamada 'application'.

Para más información sobre este archivo, ver:
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

# Configura la variable de entorno para las configuraciones de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Obtiene la aplicación WSGI
application = get_wsgi_application()
