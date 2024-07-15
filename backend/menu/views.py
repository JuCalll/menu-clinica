from rest_framework import generics, permissions
from .models import Menu
from .serializers import MenuSerializer

# Vista para listar y crear menús
class MenuListCreateView(generics.ListCreateAPIView):
    queryset = Menu.objects.all()  # Consulta todos los menús
    permission_classes = (permissions.IsAuthenticated,)  # Requiere autenticación
    serializer_class = MenuSerializer  # Utiliza el serializador MenuSerializer

# Vista para obtener, actualizar y eliminar un menú por su ID
class MenuDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Menu.objects.all()  # Consulta todos los menús
    permission_classes = (permissions.IsAuthenticated,)  # Requiere autenticación
    serializer_class = MenuSerializer  # Utiliza el serializador MenuSerializer
