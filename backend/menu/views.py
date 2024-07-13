from rest_framework import generics, permissions
from .models import Menu
from .serializers import MenuSerializer

class MenuListCreateView(generics.ListCreateAPIView):
    queryset = Menu.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MenuSerializer

class MenuDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Menu.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = MenuSerializer
