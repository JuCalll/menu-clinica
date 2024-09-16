from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'name', 'cedula', 'role', 'activo', 'password')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}  

    def update(self, instance, validated_data):
        print(f"Datos recibidos para actualización: {validated_data}")  

        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            print(f"Actualizando contraseña para el usuario {instance.username}")  
            instance.set_password(password)

        try:
            instance.save()
            print(f"Usuario {instance.username} actualizado correctamente")  
        except Exception as e:
            print(f"Error al guardar el usuario {instance.username}: {str(e)}")  
            raise serializers.ValidationError(f"Error al actualizar el usuario: {str(e)}")

        return instance

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials.")
            if not user.is_active:
                raise serializers.ValidationError("User is inactive.")
            
            data['user'] = user
            data['role'] = user.role
            data['name'] = user.name  
        else:
            raise serializers.ValidationError("Both username and password are required.")
        
        return data

