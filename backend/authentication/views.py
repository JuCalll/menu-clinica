# Importamos la función authenticate de django.contrib.auth para autenticar usuarios
from django.contrib.auth import authenticate
# Importamos los módulos generics y permissions de Django REST framework
from rest_framework import generics, permissions
# Importamos la clase Response para manejar las respuestas HTTP en las vistas
from rest_framework.response import Response
# Importamos la clase RefreshToken de rest_framework_simplejwt.tokens para manejar los tokens JWT
from rest_framework_simplejwt.tokens import RefreshToken
# Importamos el modelo CustomUser desde el archivo models
from .models import CustomUser
# Importamos los serializers UserSerializer y LoginSerializer desde el archivo serializers
from .serializers import UserSerializer, LoginSerializer

# Definimos una vista para registrar nuevos usuarios
class RegisterView(generics.CreateAPIView):
    # Especificamos el queryset para recuperar todos los usuarios (aunque en este caso solo se utiliza para crear)
    queryset = CustomUser.objects.all()
    # Permitimos el acceso a cualquier usuario, incluso si no está autenticado
    permission_classes = (permissions.AllowAny,)
    # Especificamos el serializer que será utilizado para validar y deserializar los datos de la solicitud
    serializer_class = UserSerializer

# Definimos una vista para manejar el login de usuarios
class LoginView(generics.GenericAPIView):
    # Permitimos el acceso a cualquier usuario, incluso si no está autenticado
    permission_classes = (permissions.AllowAny,)
    # Especificamos el serializer que será utilizado para validar y deserializar los datos de la solicitud
    serializer_class = LoginSerializer

    # Método POST para manejar la solicitud de login
    def post(self, request, *args, **kwargs):
        # Validamos los datos recibidos utilizando el serializer
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Autenticamos al usuario utilizando el nombre de usuario y la contraseña proporcionados
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
        # Si la autenticación es exitosa, generamos y devolvemos los tokens JWT
        if user:
            # Generamos un nuevo refresh token para el usuario autenticado
            refresh = RefreshToken.for_user(user)
            # Devolvemos el refresh token y el access token en la respuesta
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        # Si la autenticación falla, devolvemos un error
        return Response({"error": "Credenciales inválidas"}, status=400)
