"""
ASGI config for backend project.

Expone el callable ASGI como una variable de módulo llamada ``application``.

Para más información sobre este archivo, consulta:
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

# Importa la función para obtener la aplicación ASGI de Django
from django.core.asgi import get_asgi_application

# Establece la configuración predeterminada de Django para el entorno de ejecución
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Obtiene la aplicación ASGI para que pueda ser utilizada por los servidores ASGI
application = get_asgi_application()
