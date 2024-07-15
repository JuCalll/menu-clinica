from rest_framework import generics
from .models import Paciente
from .serializers import PacienteSerializer

class PacienteListCreateView(generics.ListCreateAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
