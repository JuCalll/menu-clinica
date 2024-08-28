from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El campo de correo electrónico debe estar configurado')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    cedula = models.CharField(max_length=20, unique=True)
    
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('coordinador', 'Coordinadora de Alimentos'),
        ('auxiliar', 'Auxiliar de Cocina'),
        ('jefe_enfermeria', 'Jefe de Enfermería'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)  # Agregar el campo de rol

    objects = CustomUserManager()

    def __str__(self):
        return self.username
