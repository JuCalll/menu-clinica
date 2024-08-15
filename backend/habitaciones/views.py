from rest_framework import generics
from .models import Habitacion
from .serializers import HabitacionSerializer

class HabitacionListCreateView(generics.ListCreateAPIView):
    serializer_class = HabitacionSerializer

    def get_queryset(self):
        # Filtramos solo las habitaciones que están activas
        return Habitacion.objects.filter(activo=True)

class HabitacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer
