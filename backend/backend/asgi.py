"""
Configuración ASGI para el proyecto backend.

Expone la aplicación ASGI como una variable de módulo llamada ``application``.

Para obtener más información sobre este archivo, consulte:
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/

Este módulo configura la aplicación ASGI para el proyecto Django.

Ejemplo:
    Para utilizar esta aplicación ASGI con un servidor como Daphne, puede ejecutar el siguiente comando:

    ```
    daphne -b 0.0.0.0 -p 8000 backend.asgi:application
    ```

    Esto iniciará la aplicación ASGI en `http://0.0.0.0:8000/`.
"""

import os

# Importa la función para obtener la aplicación ASGI de Django
from django.core.asgi import get_asgi_application

# Establece la configuración predeterminada de Django para el entorno de ejecución
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Obtiene la aplicación ASGI para que pueda ser utilizada por los servidores ASGI
application = get_asgi_application()