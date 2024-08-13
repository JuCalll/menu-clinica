# Importamos el módulo generics de Django REST framework para utilizar vistas genéricas basadas en clases
from rest_framework import generics
# Importamos el modelo Habitacion desde el archivo models
from .models import Habitacion
# Importamos el serializer HabitacionSerializer desde el archivo serializers
from .serializers import HabitacionSerializer

# Definimos una vista genérica para listar todas las habitaciones y crear una nueva
class HabitacionListCreateView(generics.ListCreateAPIView):
    # Especificamos el queryset que será utilizado para recuperar todas las habitaciones
    queryset = Habitacion.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = HabitacionSerializer

# Definimos una vista genérica para recuperar, actualizar y eliminar una habitación específica
class HabitacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Especificamos el queryset que será utilizado para recuperar una habitación específica
    queryset = Habitacion.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = HabitacionSerializer
