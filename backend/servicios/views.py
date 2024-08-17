from rest_framework import generics
from .models import Servicio
from .serializers import ServicioSerializer

class ServicioListCreateView(generics.ListCreateAPIView):
    serializer_class = ServicioSerializer

    def get_queryset(self):
        return Servicio.objects.all()

class ServicioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
