from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Ruta para el panel de administración de Django
    path('api/auth/', include('authentication.urls')),  # Incluye las URLs del módulo de autenticación
    path('api/menus/', include('menu.urls')),  # Incluye las URLs del módulo de menú
    path('api/pedidos/', include('pedidos.urls')),  # Incluye las URLs del módulo de pedidos
    path('api/pacientes/', include('pacientes.urls')),  # Incluye las URLs del módulo de pacientes
]
