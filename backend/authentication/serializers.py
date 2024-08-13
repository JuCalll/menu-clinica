# Importamos el módulo serializers de Django REST framework
from rest_framework import serializers
# Importamos el modelo CustomUser desde el archivo models
from .models import CustomUser

# Definimos un serializer para el modelo CustomUser
class UserSerializer(serializers.ModelSerializer):
    # Meta clase que define el modelo y los campos a serializar
    class Meta:
        model = CustomUser  # Especificamos el modelo CustomUser
        fields = ('id', 'username', 'password', 'email')  # Campos a incluir en la serialización
        # Indicamos que el campo password solo debe ser utilizado para escritura (no se devolverá en respuestas)
        extra_kwargs = {'password': {'write_only': True}}

    # Método para crear un nuevo usuario con los datos validados
    def create(self, validated_data):
        # Utilizamos el gestor personalizado para crear un usuario con los datos validados
        user = CustomUser.objects.create_user(**validated_data)
        # Retornamos el usuario creado
        return user

# Definimos un serializer para manejar el login del usuario
class LoginSerializer(serializers.Serializer):
    # Campos que se necesitan para autenticar a un usuario
    username = serializers.CharField()  # Campo para el nombre de usuario
    password = serializers.CharField()  # Campo para la contraseña
