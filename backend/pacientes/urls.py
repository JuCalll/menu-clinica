from django.urls import path
from .views import PacienteListCreateView, PacienteDetailView

urlpatterns = [
    path('pacientes/', PacienteListCreateView.as_view(), name='paciente-list-create'),
    path('pacientes/<int:pk>/', PacienteDetailView.as_view(), name='paciente-detail'),
]
