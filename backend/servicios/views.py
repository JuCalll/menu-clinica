# Importamos el módulo generics de Django REST framework para utilizar vistas genéricas basadas en clases
from rest_framework import generics
# Importamos el modelo Servicio desde el archivo models
from .models import Servicio
# Importamos el serializer ServicioSerializer desde el archivo serializers
from .serializers import ServicioSerializer

# Definimos una vista genérica para listar todos los servicios y crear uno nuevo
class ServicioListCreateView(generics.ListCreateAPIView):
    # Especificamos el queryset que será utilizado para recuperar todos los servicios
    queryset = Servicio.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = ServicioSerializer

# Definimos una vista genérica para recuperar, actualizar y eliminar un servicio específico
class ServicioDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Especificamos el queryset que será utilizado para recuperar un servicio específico
    queryset = Servicio.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = ServicioSerializer
