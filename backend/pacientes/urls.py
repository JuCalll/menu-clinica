"""
Define patrones de URL para vistas de Paciente.

Patrones de URL:
- ``paciente-list-create``: Devuelve una lista de todos los pacientes o crea un nuevo paciente.
- ``paciente-detail``: Devuelve los detalles de un paciente según su clave primaria (pk).
"""

from django.urls import path
from .views import PacienteListCreateView, PacienteDetailView

"""
Patrones de URL para Paciente.
"""

urlpatterns = [
    path('', PacienteListCreateView.as_view(), name='paciente-list-create'),
    path('<int:pk>/', PacienteDetailView.as_view(), name='paciente-detail'),
]
