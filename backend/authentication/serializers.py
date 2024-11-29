"""
Serializadores para la autenticación de usuarios.
Define la conversión de modelos de usuario a JSON y viceversa, además de la validación de datos.
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo CustomUser.
    Maneja la serialización y deserialización de usuarios, incluyendo validaciones personalizadas.
    """
    
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'name', 'cedula', 'role', 'activo', 'password', 'ingreso_count')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def validate(self, data):
        """
        Valida los datos del usuario, especialmente la unicidad de email y username para usuarios activos.
        
        Args:
            data (dict): Datos del usuario a validar
            
        Returns:
            dict: Datos validados
            
        Raises:
            serializers.ValidationError: Si existe un usuario activo con el mismo email o username
        """
        instance = getattr(self, 'instance', None)
        activo = data.get('activo', True if instance is None else instance.activo)
        email = data.get('email', instance.email if instance else None)
        username = data.get('username', instance.username if instance else None)

        if activo:
            # Verificar email único para usuarios activos
            email_exists = CustomUser.objects.filter(
                email=email,
                activo=True
            ).exclude(id=instance.id if instance else None).exists()

            if email_exists:
                raise serializers.ValidationError(
                    {"email": "Ya existe un usuario activo con este email"}
                )

            # Verificar username único para usuarios activos
            username_exists = CustomUser.objects.filter(
                username=username,
                activo=True
            ).exclude(id=instance.id if instance else None).exists()

            if username_exists:
                raise serializers.ValidationError(
                    {"username": "Ya existe un usuario activo con este nombre de usuario"}
                )

        return data

    def update(self, instance, validated_data):
        """
        Actualiza una instancia de usuario existente.
        
        Args:
            instance (CustomUser): Instancia del usuario a actualizar
            validated_data (dict): Datos validados para la actualización
            
        Returns:
            CustomUser: Instancia del usuario actualizada
        """
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    """
    Serializador para el proceso de login.
    Maneja la validación de credenciales de usuario.
    """
    
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        """
        Valida las credenciales del usuario durante el login.
        
        Args:
            data (dict): Datos de login (username y password)
            
        Returns:
            dict: Datos validados incluyendo el usuario autenticado
            
        Raises:
            serializers.ValidationError: Si las credenciales son inválidas o faltan campos
        """
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Credenciales inválidas.")
            if not user.is_active:
                raise serializers.ValidationError("Usuario inactivo.")
            
            data['user'] = user
            data['role'] = user.role
            data['name'] = user.name
        else:
            raise serializers.ValidationError("Se requieren nombre de usuario y contraseña.")
        
        return data
