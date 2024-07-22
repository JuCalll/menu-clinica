from django.urls import path
from .views import RegisterView, LoginView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Definimos las rutas de URL para la aplicación de autenticación
urlpatterns = [
    # Ruta para registrar un nuevo usuario
    path('register/', RegisterView.as_view(), name='register'),
    
    # Ruta para iniciar sesión
    path('login/', LoginView.as_view(), name='login'),
    
    # Ruta para obtener el token JWT
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Ruta para refrescar el token JWT
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]