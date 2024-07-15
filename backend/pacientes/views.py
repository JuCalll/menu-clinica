from rest_framework import generics
from .models import Paciente
from .serializers import PacienteSerializer

# Vista para listar y crear pacientes
class PacienteListCreateView(generics.ListCreateAPIView):
    queryset = Paciente.objects.all()  # Consulta para obtener todos los pacientes
    serializer_class = PacienteSerializer  # Serializador a utilizar

# Vista para obtener, actualizar y eliminar un paciente específico
class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paciente.objects.all()  # Consulta para obtener todos los pacientes
    serializer_class = PacienteSerializer  # Serializador a utilizar
