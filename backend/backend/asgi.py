# Importamos el módulo os para interactuar con las variables de entorno del sistema operativo
import os

# Importamos la función get_asgi_application de django.core.asgi para configurar la aplicación ASGI
from django.core.asgi import get_asgi_application

# Establecemos la variable de entorno 'DJANGO_SETTINGS_MODULE' con el valor 'backend.settings'
# Esto indica a Django qué archivo de configuración debe usar
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Llamamos a get_asgi_application para obtener la aplicación ASGI que Django utilizará
application = get_asgi_application()
