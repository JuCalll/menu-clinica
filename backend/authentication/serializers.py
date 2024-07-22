from rest_framework import serializers
from .models import CustomUser

# Serializer para el modelo CustomUser
class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para serializar y deserializar el modelo CustomUser.
    """
    class Meta:
        """
        Configuración del serializer.
        """
        model = CustomUser  # Modelo que se va a serializar
        fields = ('id', 'username', 'password', 'email')  # Campos que se incluirán en la serialización
        extra_kwargs = {'password': {'write_only': True}}  # El campo de contraseña solo se puede escribir, no se puede leer

    def create(self, validated_data):
        """
        Método para crear un nuevo usuario.
        
        Args:
            validated_data (dict): Diccionario con los datos validados para crear un nuevo usuario.
        
        Returns:
            CustomUser: El usuario creado.
        """
        user = CustomUser.objects.create_user(**validated_data)  # Crea un usuario con los datos validados
        return user

# Serializer para el inicio de sesión
class LoginSerializer(serializers.Serializer):
    """
    Serializer para validar los datos de inicio de sesión.
    """
    username = serializers.CharField()  # Campo para el nombre de usuario
    password = serializers.CharField()  # Campo para la contraseña