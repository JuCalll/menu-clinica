from rest_framework import generics, permissions
from .models import Pedido
from .serializers import PedidoSerializer

# Vista para listar y crear pedidos
class PedidoListCreateView(generics.ListCreateAPIView):
    queryset = Pedido.objects.all()  # Consulta para obtener todos los pedidos
    serializer_class = PedidoSerializer  # Especifica el serializador a utilizar
    permission_classes = [permissions.IsAuthenticated]  # Requiere autenticación

    # Método para manejar la creación de un nuevo pedido
    def perform_create(self, serializer):
        patient_id = self.request.data.get('patient')  # Obtiene el ID del paciente de la solicitud
        menu_id = self.request.data.get('menu')  # Obtiene el ID del menú de la solicitud
        if patient_id and menu_id:
            # Guarda el nuevo pedido con los IDs del paciente y del menú
            serializer.save(patient_id=patient_id, menu_id=menu_id)
        else:
            # Lanza un error si los campos 'patient' y 'menu' no están presentes
            raise ValueError("Los campos 'patient' y 'menu' son obligatorios.")

# Vista para ver, actualizar y eliminar un pedido específico
class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()  # Consulta para obtener todos los pedidos
    serializer_class = PedidoSerializer  # Especifica el serializador a utilizar
    permission_classes = [permissions.IsAuthenticated]  # Requiere autenticación

# Esta clase parece ser redundante ya que hace lo mismo que PedidoDetailView
class PedidoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Pedido.objects.all()  # Consulta para obtener todos los pedidos
    serializer_class = PedidoSerializer  # Especifica el serializador a utilizar
