# Importamos el módulo generics de Django REST framework para utilizar vistas genéricas basadas en clases
from rest_framework import generics
# Importamos el modelo Paciente desde el archivo models
from .models import Paciente
# Importamos el serializer PacienteSerializer desde el archivo serializers
from .serializers import PacienteSerializer

# Definimos una vista genérica para listar todos los pacientes y crear uno nuevo
class PacienteListCreateView(generics.ListCreateAPIView):
    # Especificamos el queryset que será utilizado para recuperar todos los pacientes
    queryset = Paciente.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = PacienteSerializer

# Definimos una vista genérica para recuperar, actualizar y eliminar un paciente específico
class PacienteDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Especificamos el queryset que será utilizado para recuperar un paciente específico
    queryset = Paciente.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = PacienteSerializer
