"""
Configuración de URLs para la aplicación de autenticación.
Define las rutas y vistas relacionadas con la autenticación de usuarios.
"""

from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    UserListView,
    UserDetailView,
    CustomTokenRefreshView,
    LogoutView
)
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    # Rutas de autenticación básica
    path('register/', 
         RegisterView.as_view(), 
         name='register'),  # Registro de nuevos usuarios (solo admin)
    
    path('login/', 
         LoginView.as_view(), 
         name='login'),  # Inicio de sesión
    
    # Gestión de usuarios
    path('users/', 
         UserListView.as_view(), 
         name='user-list'),  # Listar usuarios (solo admin)
    
    path('users/<int:pk>/', 
         UserDetailView.as_view(), 
         name='user-detail'),  # Detalles de usuario específico
    
    # Gestión de tokens JWT
    path('token/', 
         TokenObtainPairView.as_view(), 
         name='token_obtain_pair'),  # Obtener par de tokens
    
    path('token/refresh/', 
         CustomTokenRefreshView.as_view(), 
         name='token_refresh'),  # Refrescar token
    
    # Cierre de sesión
    path('logout/', 
         LogoutView.as_view(), 
         name='auth_logout'),  # Cerrar sesión y blacklist del token
]
