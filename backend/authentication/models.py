"""
Módulo de modelos para la autenticación personalizada.
Define los modelos de usuario y el gestor de usuarios personalizados para la aplicación.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    """
    Gestor personalizado para el modelo CustomUser.
    Extiende BaseUserManager para proporcionar métodos de creación de usuarios.
    """
    
    def create_user(self, username, email, password=None, **extra_fields):
        """
        Crea y guarda un usuario regular.
        
        Args:
            username (str): Nombre de usuario único
            email (str): Correo electrónico del usuario
            password (str, opcional): Contraseña del usuario
            **extra_fields: Campos adicionales para el usuario
            
        Returns:
            CustomUser: Nueva instancia de usuario
            
        Raises:
            ValueError: Si no se proporciona email
        """
        if not email:
            raise ValueError('El campo de correo electrónico debe estar configurado')
            
        email = self.normalize_email(email)
        extra_fields.setdefault('activo', True)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """
        Crea y guarda un superusuario.
        
        Args:
            username (str): Nombre de usuario único
            email (str): Correo electrónico del usuario
            password (str, opcional): Contraseña del usuario
            **extra_fields: Campos adicionales para el usuario
            
        Returns:
            CustomUser: Nueva instancia de superusuario
            
        Raises:
            ValueError: Si is_staff o is_superuser no son True
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('activo', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True')

        return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser.
    
    Attributes:
        email (EmailField): Correo electrónico del usuario
        name (CharField): Nombre completo del usuario
        cedula (CharField): Número de identificación del usuario
        activo (BooleanField): Estado de activación del usuario
        ingreso_count (IntegerField): Contador de ingresos del usuario
        role (CharField): Rol del usuario en el sistema
    """
    
    email = models.EmailField()
    name = models.CharField(max_length=255)
    cedula = models.CharField(max_length=20)
    activo = models.BooleanField(default=True)
    ingreso_count = models.IntegerField(default=1)
    
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('coordinador', 'Coordinadora de Alimentos'),
        ('auxiliar', 'Auxiliar de Cocina'),
        ('jefe_enfermeria', 'Jefe de Enfermería'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    objects = CustomUserManager()

    def reactivate(self):
        """
        Reactivar un usuario desactivado e incrementar su contador de ingresos.
        """
        self.activo = True
        self.ingreso_count += 1
        self.save()

    def __str__(self):
        """
        Representación en string del usuario.
        
        Returns:
            str: Nombre de usuario
        """
        return self.username

