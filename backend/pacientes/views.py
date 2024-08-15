from rest_framework import generics
from .models import Paciente
from .serializers import PacienteSerializer

class PacienteListCreateView(generics.ListCreateAPIView):
    serializer_class = PacienteSerializer

    def get_queryset(self):
        # Filtramos solo los pacientes que están activos
        return Paciente.objects.filter(activo=True)

class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
