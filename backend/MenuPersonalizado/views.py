from rest_framework import generics
from .models import MenuPersonalizado
from .serializer import MenuPersonalizadoSerializer

class MenuPersonalizadoListCreateView(generics.ListCreateAPIView):
    queryset = MenuPersonalizado.objects.all()
    serializer_class = MenuPersonalizadoSerializer

class MenuPersonalizadoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuPersonalizado.objects.all()
    serializer_class = MenuPersonalizadoSerializer
