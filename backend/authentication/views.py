from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import CustomUser
from .serializers import UserSerializer, LoginSerializer

# Vista para registrar un nuevo usuario
class RegisterView(generics.CreateAPIView):
    """
    Vista para crear un nuevo usuario.
    
    Permite a cualquier usuario registrar una nueva cuenta sin necesidad de autenticación previa.
    """
    queryset = CustomUser.objects.all()  # Conjunto de datos para la vista
    permission_classes = (permissions.AllowAny,)  # Permitir acceso sin autenticación
    serializer_class = UserSerializer  # Serializador a utilizar para la vista

# Vista para iniciar sesión
class LoginView(generics.GenericAPIView):
    """
    Vista para iniciar sesión.
    
    Permite a cualquier usuario iniciar sesión sin necesidad de autenticación previa.
    """
    permission_classes = (permissions.AllowAny,)  # Permitir acceso sin autenticación
    serializer_class = LoginSerializer  # Serializador a utilizar para la vista

    def post(self, request, *args, **kwargs):
        """
        Método POST para procesar la solicitud de inicio de sesión.
        
        Recibe los datos de inicio de sesión del usuario y devuelve un token de acceso y un token de refresco.
        """
        serializer = self.get_serializer(data=request.data)  # Obtenemos los datos del request
        serializer.is_valid(raise_exception=True)  # Validamos los datos
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])  # Autenticamos al usuario
        if user:
            refresh = RefreshToken.for_user(user)  # Generamos el token de refresco
            return Response({  # Devolvemos la respuesta con los tokens
                'refresh': str(refresh),
                'access': str(refresh.access_token),  # Token de acceso
            })
        return Response({"error": "Credenciales inválidas"}, status=400)  # Devolvemos un error si las credenciales son inválidas