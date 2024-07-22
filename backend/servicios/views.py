from rest_framework import generics
from .models import Servicio
from .serializers import ServicioSerializer

class ServicioListCreateView(generics.ListCreateAPIView):
    """
    Vista de API para listar y crear instancias de Servicio.

    **GET**: Recupera una lista de todas las instancias de Servicio.

    **POST**: Crea una nueva instancia de Servicio.

    **Ejemplo**:

    ```
    GET /servicios/
    [
        {"id": 1, "nombre": "Servicio 1", "descripcion": "Descripción 1"},
        {"id": 2, "nombre": "Servicio 2", "descripcion": "Descripción 2"}
    ]

    POST /servicios/
    {
        "nombre": "Servicio 3",
        "descripcion": "Descripción 3"
    }
    ```

    :param queryset: Todas las instancias de Servicio
    :param serializer_class: ServicioSerializer
    """
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer

class ServicioDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista de API para recuperar, actualizar y eliminar instancias de Servicio.

    **GET**: Recupera una instancia de Servicio individual.

    **PUT**: Actualiza una instancia de Servicio individual.

    **DELETE**: Elimina una instancia de Servicio individual.

    **Ejemplo**:

    ```
    GET /servicios/1/
    {"id": 1, "nombre": "Servicio 1", "descripcion": "Descripción 1"}

    PUT /servicios/1/
    {
        "nombre": "Servicio 1 actualizado",
        "descripcion": "Descripción 1 actualizada"
    }

    DELETE /servicios/1/
    (204 No Content)
    ```

    :param queryset: Todas las instancias de Servicio
    :param serializer_class: ServicioSerializer
    """
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer