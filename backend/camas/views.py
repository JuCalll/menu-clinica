from rest_framework import generics
from .models import Cama
from .serializers import CamaSerializer

class CamaListCreateView(generics.ListCreateAPIView):
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer

class CamaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cama.objects.all()
    serializer_class = CamaSerializer
