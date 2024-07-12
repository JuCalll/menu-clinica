from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import UserSerializer

# Vista para el registro de usuarios
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)  # Permitir acceso sin autenticación
    serializer_class = UserSerializer  # Utiliza el serializador de usuario

# Vista para el login de usuarios
class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)  # Permitir acceso sin autenticación
    serializer_class = UserSerializer  # Utiliza el serializador de usuario

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')  # Obtener el nombre de usuario del request
        password = request.data.get('password')  # Obtener la contraseña del request
        print(f'Username: {username}, Password: {password}')  # Depuración: imprimir credenciales
        user = authenticate(request, username=username, password=password)  # Autenticar usuario
        if user:  # Si la autenticación es exitosa
            refresh = RefreshToken.for_user(user)  # Generar tokens de refresco y acceso
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        print('Invalid Credentials')  # Depuración: imprimir mensaje de credenciales inválidas
        return Response({"error": "Invalid Credentials"}, status=400)  # Respuesta de error
