from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'name', 'cedula', 'role', 'activo', 'password', 'ingreso_count')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def validate(self, data):
        instance = getattr(self, 'instance', None)
        activo = data.get('activo', True if instance is None else instance.activo)
        email = data.get('email', instance.email if instance else None)
        username = data.get('username', instance.username if instance else None)

        # Solo validamos unicidad si el usuario está activo
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
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
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
