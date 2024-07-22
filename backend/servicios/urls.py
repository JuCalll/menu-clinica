"""
Define patrones de URL para servicios.

Patrones de URL:
- `/`: Devuelve una lista de todos los servicios o crea un nuevo servicio.
- `/<int:pk>/`: Devuelve el detalle de un servicio con la clave primaria (pk) especificada.

Ejemplo de uso:
>>> from django.urls import include
>>> urlpatterns = [
...     path('servicios/', include('servicios.urls')),
... ]
"""

from django.urls import path
from .views import ServicioListCreateView, ServicioDetailView

urlpatterns = [
    path('', ServicioListCreateView.as_view(), name='servicio-list-create'),
    path('<int:pk>/', ServicioDetailView.as_view(), name='servicio-detail'),
]
