from django.contrib import admin
from django.urls import path, include

# Definición de las rutas URL para el proyecto backend
urlpatterns = [
    path('admin/', admin.site.urls),  # Ruta para la interfaz de administración de Django
    path('api/auth/', include('authentication.urls')),  # Incluye las URLs del módulo de autenticación
    path('api/menus/', include('menu.urls')),  # Incluye las URLs del módulo de menús
    path('api/pedidos/', include('pedidos.urls')),  # Incluye las URLs del módulo de pedidos
    path('api/pacientes/', include('pacientes.urls')),  # Incluye las URLs del módulo de pacientes
]
