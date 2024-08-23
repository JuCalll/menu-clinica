from rest_framework import generics
from .models import Paciente
from .serializers import PacienteSerializer

class PacienteListCreateView(generics.ListCreateAPIView):
    serializer_class = PacienteSerializer

    def get_queryset(self):
        return Paciente.objects.filter(activo=True)  # Solo mostrar pacientes activos en la vista de listado

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
