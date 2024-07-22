from rest_framework import generics, permissions
from .models import Menu
from .serializers import MenuSerializer

"""
Vistas de la API de menús
"""

# Vista para listar y crear menús
class MenuListCreateView(generics.ListCreateAPIView):
    """
    Lista todos los menús o crea un nuevo menú.

    **Métodos HTTP:**
    - GET: Lista todos los menús
    - POST: Crea un nuevo menú

    **Permisos:**
    - Requiere autenticación

    """
    queryset = Menu.objects.all()  # Consulta todos los menús
    permission_classes = (permissions.IsAuthenticated,)  # Requiere autenticación
    serializer_class = MenuSerializer  # Utiliza el serializador MenuSerializer

# Vista para obtener, actualizar y eliminar un menú por su ID
class MenuDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Obtiene, actualiza o elimina un menú por su ID.

    **Métodos HTTP:**
    - GET: Obtiene un menú por su ID
    - PUT: Actualiza un menú por su ID
    - DELETE: Elimina un menú por su ID

    **Permisos:**
    - Requiere autenticación
    
    """
    queryset = Menu.objects.all()  # Consulta todos los menús
    permission_classes = (permissions.IsAuthenticated,)  # Requiere autenticación
    serializer_class = MenuSerializer  # Utiliza el serializador MenuSerializer