"""
Middleware para el registro automático de autenticación.

Define el middleware que registra automáticamente los eventos de:
- Inicio de sesión de usuarios
- Cierre de sesión de usuarios
Utiliza LogEntry para mantener un registro de actividades de autenticación.
"""

from .models import LogEntry

class AuthenticationLoggingMiddleware:
    """
    Middleware para registrar eventos de autenticación.
    
    Intercepta las peticiones de login/logout y crea registros
    automáticos en el log del sistema.
    
    Atributos:
        get_response: Función que procesa la siguiente petición en la cadena.
    """
    def __init__(self, get_response):
        """
        Inicializa el middleware.
        
        Args:
            get_response: Función que procesa la siguiente petición.
        """
        self.get_response = get_response

    def __call__(self, request):
        """
        Procesa la petición y registra eventos de autenticación.
        
        Args:
            request: Objeto HttpRequest con la petición actual.
            
        Returns:
            HttpResponse: Respuesta procesada por el middleware.
        """
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            if request.path == '/logout/':
                LogEntry.objects.create(
                    user=request.user,
                    action='LOGOUT',
                    model='Authentication',
                    object_id=request.user.id,
                )
            elif request.path == '/login/':
                LogEntry.objects.create(
                    user=request.user,
                    action='LOGIN',
                    model='Authentication',
                    object_id=request.user.id,
                )
                
        return response
