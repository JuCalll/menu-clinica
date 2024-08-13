# Importamos el módulo admin de django.contrib para la administración del sitio
from django.contrib import admin
# Importamos las funciones path e include desde django.urls para definir rutas
from django.urls import path, include

# Definimos las rutas principales del proyecto
urlpatterns = [
    # Ruta para acceder a la interfaz de administración de Django
    path('admin/', admin.site.urls),
    # Rutas relacionadas con la autenticación, incluyendo las definidas en authentication.urls
    path('api/auth/', include('authentication.urls')),
    # Rutas relacionadas con la gestión de pacientes, incluyendo las definidas en pacientes.urls
    path('api/pacientes/', include('pacientes.urls')),
    # Rutas relacionadas con la gestión de habitaciones, incluyendo las definidas en habitaciones.urls
    path('api/habitaciones/', include('habitaciones.urls')),
    # Rutas relacionadas con la gestión de servicios, incluyendo las definidas en servicios.urls
    path('api/servicios/', include('servicios.urls')),
    # Rutas relacionadas con la gestión de menús, incluyendo las definidas en menus.urls
    path('api/menus/', include('menus.urls')),
    # Rutas relacionadas con la gestión de pedidos, incluyendo las definidas en pedidos.urls
    path('api/pedidos/', include('pedidos.urls')),
]
