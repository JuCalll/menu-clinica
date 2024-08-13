# Importamos el módulo generics de Django REST framework para utilizar vistas genéricas basadas en clases
from rest_framework import generics
# Importamos la clase Response de Django REST framework para manejar respuestas HTTP
from rest_framework.response import Response
# Importamos el modelo Pedido desde el archivo models
from .models import Pedido
# Importamos el serializer PedidoSerializer desde el archivo serializers
from .serializers import PedidoSerializer

# Definimos una vista genérica para listar todos los pedidos y crear uno nuevo
class PedidoListCreateView(generics.ListCreateAPIView):
    # Especificamos el queryset que será utilizado para recuperar todos los pedidos
    queryset = Pedido.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = PedidoSerializer

# Definimos una vista genérica para recuperar, actualizar y eliminar un pedido específico
class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    # Especificamos el queryset que será utilizado para recuperar un pedido específico
    queryset = Pedido.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = PedidoSerializer

# Definimos una vista genérica para actualizar parcialmente el estado de un pedido específico
class PedidoStatusUpdateView(generics.UpdateAPIView):
    # Especificamos el queryset que será utilizado para recuperar un pedido específico
    queryset = Pedido.objects.all()
    # Especificamos el serializer que será utilizado para la serialización y deserialización de los datos
    serializer_class = PedidoSerializer

    # Método para realizar una actualización parcial de los datos de un pedido
    def partial_update(self, request, *args, **kwargs):
        # Recuperamos la instancia del pedido que se va a actualizar
        instance = self.get_object()
        # Validamos y deserializamos los datos proporcionados en la solicitud
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        # Guardamos los cambios en la instancia del pedido
        self.perform_update(serializer)
        # Retornamos la instancia actualizada en la respuesta
        return Response(serializer.data)
