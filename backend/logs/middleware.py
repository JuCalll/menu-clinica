from .models import LogEntry

class AuthenticationLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
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
