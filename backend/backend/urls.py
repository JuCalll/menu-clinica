"""
Define la configuración principal de URLs para el proyecto.

Este módulo define la configuración de URLs raíz para el proyecto, incluyendo
la interfaz de administración, autenticación y puntos de acceso API para
varios recursos.

Ejemplo:
    Para acceder a la interfaz de administración, navegue a `http://example.com/admin/`
    Para acceder al punto de acceso API para menús, navegue a `http://example.com/api/menus/`
"""
from django.contrib import admin
from django.urls import path, include

"""
Lista de patrones de URL para el proyecto
"""

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/menus/', include('menu.urls')),
    path('api/pedidos/', include('pedidos.urls')),
    path('api/pacientes/', include('pacientes.urls')),
    path('api/habitaciones/', include('habitaciones.urls')),
    path('api/servicios/', include('servicios.urls')),
]
