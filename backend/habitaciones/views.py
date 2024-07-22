from rest_framework import generics
from .models import Habitacion
from .serializers import HabitacionSerializer

class HabitacionListCreateView(generics.ListCreateAPIView):
    """
    Vista de API para listar todas las habitaciones o crear una nueva.

    **GET**:
    Devuelve una lista de todas las habitaciones.

    Ejemplo:
    ```
    GET /habitaciones/
    ```
    **POST**:
    Crea una nueva habitación.

    :param queryset: Todas las habitaciones
    :param serializer_class: HabitacionSerializer
    """
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer

class HabitacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista de API para recuperar, actualizar o eliminar una habitación.

    **GET**:
    Devuelve una habitación individual por ID.

    Ejemplo:
    ```
    GET /habitaciones/1/
    ```

    **PUT**:
    Actualiza una habitación.

    **DELETE**:
    Elimina una habitación.

    Ejemplo:
    ```
    DELETE /habitaciones/1/
    ```

    :param queryset: Todas las habitaciones
    :param serializer_class: HabitacionSerializer
    """
    queryset = Habitacion.objects.all()
    serializer_class = HabitacionSerializer