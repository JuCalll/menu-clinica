"""
Define patrones de URL para vistas de habitaciones.

Estos patrones de URL proporcionan operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para habitaciones.

Ejemplos de uso:
    - Para crear una nueva habitación, envíe una solicitud POST a `/habitaciones/` con los datos de la habitación.
    - Para recuperar una lista de todas las habitaciones, envíe una solicitud GET a `/habitaciones/`.
    - Para recuperar una habitación específica, envíe una solicitud GET a `/habitaciones/<id>/`.
"""

from django.urls import path
from .views import HabitacionListCreateView, HabitacionDetailView

"""
Patrones de URL para habitaciones.

Attributes:
    urlpatterns (list): Lista de patrones de URL.
"""

urlpatterns = [
    path('', HabitacionListCreateView.as_view(), name='habitacion-list-create'),
    path('<int:pk>/', HabitacionDetailView.as_view(), name='habitacion-detail'),
]