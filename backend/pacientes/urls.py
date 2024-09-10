from django.urls import path
from .views import PacienteListCreateView, PacienteDetailView

urlpatterns = [
    path('', PacienteListCreateView.as_view(), name='paciente-list-create'),
    path('<int:pk>/', PacienteDetailView.as_view(), name='paciente-detail'),  
]
