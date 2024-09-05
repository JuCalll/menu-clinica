from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'password', 'email', 'name', 'cedula', 'role', 'activo')  # Incluimos 'activo'
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def validate_cedula(self, value):
        if CustomUser.objects.filter(cedula=value).exists():
            raise serializers.ValidationError("La cédula ya está en uso.")
        return value

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
            # Add user and role to validated data
            data['user'] = user
            data['role'] = user.role
        else:
            raise serializers.ValidationError("Both username and password are required.")
        
        return data
