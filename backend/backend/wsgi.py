# Importamos el módulo os para interactuar con variables de entorno del sistema operativo
import os

# Importamos la función get_wsgi_application de django.core.wsgi para configurar la aplicación WSGI
from django.core.wsgi import get_wsgi_application

# Establecemos la variable de entorno 'DJANGO_SETTINGS_MODULE' con el valor 'backend.settings'
# Esto indica a Django qué archivo de configuración debe usar
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Llamamos a get_wsgi_application para obtener la aplicación WSGI que Django utilizará
application = get_wsgi_application()
