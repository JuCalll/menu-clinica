from rest_framework import generics
from .models import Dieta
from .serializers import DietaSerializer

class DietaListCreateView(generics.ListCreateAPIView):
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer

class DietaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer
