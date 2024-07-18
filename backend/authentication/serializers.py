from rest_framework import serializers
from .models import CustomUser

# Serializer para el modelo CustomUser
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser  # Modelo que se va a serializar
        fields = ('id', 'username', 'password', 'email')  # Campos que se incluirán en la serialización
        extra_kwargs = {'password': {'write_only': True}}  # El campo de contraseña solo se puede escribir, no se puede leer

    # Método para crear un nuevo usuario
    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)  # Crea un usuario con los datos validados
        return user

# Serializer para el inicio de sesión
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()  # Campo para el nombre de usuario
    password = serializers.CharField()  # Campo para la contraseña
