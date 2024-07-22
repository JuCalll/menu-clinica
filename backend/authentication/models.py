from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

"""
Manager personalizado para manejar la creación de usuarios y superusuarios
"""
class CustomUserManager(BaseUserManager):
    """
    Método para crear un usuario normal
    """
    def create_user(self, username, email, password=None, **extra_fields):
        """
        Crea un usuario regular.

        Args:
            username (str): El nombre de usuario para el nuevo usuario.
            email (str): La dirección de correo electrónico para el nuevo usuario.
            password (str, optional): La contraseña para el nuevo usuario. Defaults to None.
            **extra_fields: Campos adicionales que se pueden pasar al modelo de usuario.

        Raises:
            ValueError: Si el campo de correo electrónico no se proporciona.

        Returns:
            CustomUser: El usuario creado.
        """
        if not email:
            raise ValueError('El campo de correo electrónico debe estar configurado')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    """
    Método para crear un superusuario
    """
    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Crea un superusuario.

        Args:
            username (str): El nombre de usuario para el nuevo superusuario.
            email (str): La dirección de correo electrónico para el nuevo superusuario.
            password (str, optional): La contraseña para el nuevo superusuario. Defaults to None.
            **extra_fields: Campos adicionales que se pueden pasar al modelo de usuario.

        Raises:
            ValueError: Si is_staff o is_superuser no se establecen en True.

        Returns:
            CustomUser: El superusuario creado.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')

        return self.create_user(username, email, password, **extra_fields)


"""
Modelo de usuario personalizado que extiende el modelo de usuario abstracto de Django
"""
class CustomUser(AbstractUser):
    """
    Campo de correo electrónico único
    """
    email = models.EmailField(unique=True)

    objects = CustomUserManager()  # Asigna el manager personalizado al modelo

    def __str__(self):
        """
        Devuelve el nombre de usuario como representación del objeto.

        Returns:
            str: El nombre de usuario.
        """
        return self.username