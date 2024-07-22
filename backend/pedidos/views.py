from rest_framework import generics, status
from rest_framework.response import Response
from .models import Pedido
from .serializers import PedidoSerializer

# Vista para listar y crear pedidos
class PedidoListCreateView(generics.ListCreateAPIView):
    """
    Vista para listar y crear pedidos.

    **GET**: Lista todos los pedidos.

    **POST**: Crea un nuevo pedido.

    **Ejemplo**:

    ```
    GET /pedidos/
    ```

    Respuesta:
    ```
    [
        {
            "id": 1,
            "fecha_pedido": "2022-01-01",
            "estado": "pendiente",
            ...
        },
        {
            "id": 2,
            "fecha_pedido": "2022-01-02",
            "estado": "entregado",
            ...
        }
    ]
    ```

    ```
    POST /pedidos/
    {
        "fecha_pedido": "2022-01-03",
        "estado": "pendiente",
        ...
    }
    ```

    Respuesta:
    ```
    {
        "id": 3,
        "fecha_pedido": "2022-01-03",
        "estado": "pendiente",
        ...
    }
    ```
    """
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

# Vista para obtener, actualizar y eliminar un pedido específico
class PedidoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para obtener, actualizar y eliminar un pedido específico.

    **GET**: Obtiene un pedido específico.

    **PUT**: Actualiza un pedido específico.

    **DELETE**: Elimina un pedido específico.

    **Ejemplo**:

    ```
    GET /pedidos/1/
    ```

    Respuesta:
    ```
    {
        "id": 1,
        "fecha_pedido": "2022-01-01",
        "estado": "pendiente",
        ...
    }
    ```

    ```
    PUT /pedidos/1/
    {
        "estado": "entregado"
    }
    ```

    Respuesta:
    ```
    {
        "id": 1,
        "fecha_pedido": "2022-01-01",
        "estado": "entregado",
        ...
    }
    ```

    ```
    DELETE /pedidos/1/
    ```

    Respuesta:
    ```
    204 No Content
    ```
    """
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

# Vista para actualizar parcialmente el estado de un pedido
class PedidoStatusUpdateView(generics.UpdateAPIView):
    """
    Vista para actualizar parcialmente el estado de un pedido.

    **PATCH**: Actualiza parcialmente el estado de un pedido.

    **Ejemplo**:

    ```
    PATCH /pedidos/1/status/
    {
        "estado": "entregado"
    }
    ```

    Respuesta:
    ```
    {
        "id": 1,
        "fecha_pedido": "2022-01-01",
        "estado": "entregado",
        ...
    }
    ```
    """
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    def partial_update(self, request, *args, **kwargs):
        """
        Actualiza parcialmente el estado de un pedido.

        :param request: El objeto de solicitud
        :param args: Argumentos adicionales
        :param kwargs: Argumentos adicionales de palabra clave
        :return: La instancia de pedido actualizada
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)