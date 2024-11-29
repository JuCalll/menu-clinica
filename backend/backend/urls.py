"""
Configuración de URLs principal del proyecto.

Define las rutas principales y su mapeo a las diferentes aplicaciones:
- Panel de administración
- API de autenticación
- API de gestión de pacientes
- API de gestión de habitaciones
- API de gestión de servicios
- API de gestión de menús
- API de gestión de pedidos
- API de gestión de camas
- API de gestión de dietas
"""

from django.contrib import admin
from django.urls import path, include

# Patrones de URL principales del proyecto
urlpatterns = [
    # Panel de administración de Django
    path('admin/', 
         admin.site.urls),

    # APIs de la aplicación
    path('api/auth/', 
         include('authentication.urls')),  # Autenticación y gestión de usuarios
    
    path('api/pacientes/', 
         include('pacientes.urls')),  # Gestión de pacientes
    
    path('api/habitaciones/', 
         include('habitaciones.urls')),  # Gestión de habitaciones
    
    path('api/servicios/', 
         include('servicios.urls')),  # Gestión de servicios
    
    path('api/menus/', 
         include('menus.urls')),  # Gestión de menús
    
    path('api/pedidos/', 
         include('pedidos.urls')),  # Gestión de pedidos
    
    path('api/camas/', 
         include('camas.urls')),  # Gestión de camas
    
    path('api/dietas/', 
         include('dietas.urls')),  # Gestión de dietas
]
