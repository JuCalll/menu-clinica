# Importamos el módulo path desde django.urls para definir rutas
from django.urls import path
# Importamos las vistas RegisterView y LoginView desde el archivo views
from .views import RegisterView, LoginView
# Importamos las vistas TokenObtainPairView y TokenRefreshView desde rest_framework_simplejwt.views
# Estas vistas se utilizan para manejar la obtención y la actualización de tokens JWT
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Definimos las rutas de la aplicación 'authentication'
urlpatterns = [
    # Ruta para registrar un nuevo usuario, asociada a la vista RegisterView
    path('register/', RegisterView.as_view(), name='register'),
    # Ruta para iniciar sesión, asociada a la vista LoginView
    path('login/', LoginView.as_view(), name='login'),
    # Ruta para obtener un nuevo par de tokens (access y refresh), asociada a la vista TokenObtainPairView
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Ruta para refrescar un token de acceso usando el token de refresh, asociada a la vista TokenRefreshView
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
