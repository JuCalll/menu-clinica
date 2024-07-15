# authentication/views.py

# Importamos las clases necesarias de rest_framework y django
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import UserSerializer, LoginSerializer

# Vista para registrar un nuevo usuario
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # Definimos el conjunto de datos para la vista
    permission_classes = (permissions.AllowAny,)  # Permitir acceso sin autenticación
    serializer_class = UserSerializer  # Especificamos el serializador a usar

# Vista para iniciar sesión
class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)  # Permitir acceso sin autenticación
    serializer_class = LoginSerializer  # Especificamos el serializador a usar

    # Método POST para procesar la solicitud de inicio de sesión
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)  # Obtenemos los datos del request
        serializer.is_valid(raise_exception=True)  # Validamos los datos
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])  # Autenticamos al usuario
        if user:
            refresh = RefreshToken.for_user(user)  # Generamos el token de refresco
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),  # Retornamos el token de acceso
            })
        return Response({"error": "Invalid Credentials"}, status=400)  # Retornamos un error si las credenciales son inválidas
