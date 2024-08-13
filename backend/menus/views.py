# Importamos el módulo generics de Django REST framework
from rest_framework import generics
# Importamos el modelo Menu desde el archivo models
from .models import Menu
# Importamos el serializer MenuSerializer desde el archivo serializers
from .serializers import MenuSerializer

# Definimos una vista genérica para listar y crear menús
class MenuListCreateView(generics.ListCreateAPIView):
    # Especificamos el queryset que será utilizado para recuperar todos los menús
    queryset = Menu.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = MenuSerializer

# Definimos una vista genérica para recuperar, actualizar y eliminar un menú específico
class MenuDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Especificamos el queryset que será utilizado para recuperar un menú específico
    queryset = Menu.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = MenuSerializer
