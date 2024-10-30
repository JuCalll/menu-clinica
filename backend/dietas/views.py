from rest_framework import generics
from .models import Dieta, Alergia
from .serializers import DietaSerializer, AlergiaSerializer

class DietaListCreateView(generics.ListCreateAPIView):
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer

class DietaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Dieta.objects.all()
    serializer_class = DietaSerializer

class AlergiaListCreateView(generics.ListCreateAPIView):
    queryset = Alergia.objects.all()
    serializer_class = AlergiaSerializer

class AlergiaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alergia.objects.all()
    serializer_class = AlergiaSerializer
