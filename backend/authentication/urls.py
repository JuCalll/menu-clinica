# Importamos path para definir las rutas de URL y las vistas necesarias
from django.urls import path
from .views import RegisterView, LoginView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Definimos las rutas de URL para la aplicación de autenticación
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),  # Ruta para registrar un nuevo usuario
    path('login/', LoginView.as_view(), name='login'),  # Ruta para iniciar sesión
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Ruta para obtener el token JWT
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Ruta para refrescar el token JWT
]
