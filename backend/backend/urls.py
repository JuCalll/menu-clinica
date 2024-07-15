from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/menus/', include('menu.urls')),
    path('api/pedidos/', include('pedidos.urls')),
    path('api/pacientes/', include('pacientes.urls')),  # Asegúrate de incluir esta línea
]
