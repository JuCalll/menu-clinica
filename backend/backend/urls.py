from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/pacientes/', include('pacientes.urls')),
    path('api/habitaciones/', include('habitaciones.urls')),
    path('api/servicios/', include('servicios.urls')),
    path('api/menus/', include('menus.urls')),
    path('api/pedidos/', include('pedidos.urls')),
    path('api/camas/', include('camas.urls')),
    path('api/dietas/', include('dietas.urls')),  
]
