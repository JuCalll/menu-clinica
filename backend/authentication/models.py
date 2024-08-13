# Importamos el modelo AbstractUser y BaseUserManager desde django.contrib.auth.models
from django.contrib.auth.models import AbstractUser, BaseUserManager
# Importamos el módulo models de Django
from django.db import models

# Definimos un gestor personalizado para el modelo de usuario
class CustomUserManager(BaseUserManager):

    # Método para crear un usuario normal
    def create_user(self, username, email, password=None, **extra_fields):
        # Verificamos si el correo electrónico está presente
        if not email:
            raise ValueError('El campo de correo electrónico debe estar configurado')
        # Normalizamos el correo electrónico (conversión a minúsculas y manejo de dominio)
        email = self.normalize_email(email)
        # Creamos una instancia del modelo de usuario con los campos proporcionados
        user = self.model(username=username, email=email, **extra_fields)
        # Establecemos la contraseña para el usuario
        user.set_password(password)
        # Guardamos el usuario en la base de datos
        user.save(using=self._db)
        # Retornamos el usuario creado
        return user

    # Método para crear un superusuario
    def create_superuser(self, username, email, password=None, **extra_fields):
        # Establecemos valores por defecto para los campos is_staff e is_superuser
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        # Verificamos que is_staff sea True para un superusuario
        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        # Verificamos que is_superuser sea True para un superusuario
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')

        # Creamos y retornamos el superusuario utilizando el método create_user
        return self.create_user(username, email, password, **extra_fields)

# Definimos un modelo de usuario personalizado que hereda de AbstractUser
class CustomUser(AbstractUser):
    # Reemplazamos el campo de correo electrónico por uno que debe ser único
    email = models.EmailField(unique=True)

    # Asociamos el gestor de usuarios personalizado a este modelo
    objects = CustomUserManager()

    # Método para representar el usuario como una cadena de texto
    def __str__(self):
        # Retornamos el nombre de usuario
        return self.username
