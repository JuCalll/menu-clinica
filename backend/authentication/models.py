from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# Manager personalizado para manejar la creación de usuarios y superusuarios
class CustomUserManager(BaseUserManager):
    # Método para crear un usuario normal
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El campo de correo electrónico debe estar configurado')  # Mensaje de error en español
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    # Método para crear un superusuario
    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')

        return self.create_user(username, email, password, **extra_fields)

# Modelo de usuario personalizado que extiende el modelo de usuario abstracto de Django
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # Campo de correo electrónico único

    objects = CustomUserManager()  # Asigna el manager personalizado al modelo

    def __str__(self):
        return self.username  # Devuelve el nombre de usuario como representación del objeto
