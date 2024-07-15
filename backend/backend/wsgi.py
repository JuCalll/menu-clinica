"""
WSGI config for backend project.

Expone el callable WSGI como una variable de módulo llamada ``application``.

Para más información sobre este archivo, consulta:
https://docs.djangoproject.com/en/5.0/howto/deployment/wsgi/
"""

import os

# Importa la función para obtener la aplicación WSGI de Django
from django.core.wsgi import get_wsgi_application

# Establece la configuración predeterminada de Django para el entorno de ejecución
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Obtiene la aplicación WSGI para que pueda ser utilizada por los servidores WSGI
application = get_wsgi_application()
