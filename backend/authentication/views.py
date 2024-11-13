from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from .models import CustomUser
from .serializers import UserSerializer, LoginSerializer
from logs.models import LogEntry
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.views import APIView

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        role = self.request.data.get('role')
        if role == 'admin':
            instance.is_staff = True
            instance.is_superuser = True
            instance.save()

        LogEntry.objects.create(
            user=self.request.user,
            action='CREATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if user and user.activo:
            refresh = RefreshToken.for_user(user)
            
            # Registrar el login exitoso
            LogEntry.objects.create(
                user=user,
                action='LOGIN',
                model_name='CustomUser',
                object_id=user.id,
                details={
                    'username': user.username,
                    'role': user.role
                }
            )
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'role': user.role,
                    'name': user.name
                }
            })
        else:
            # Registrar el intento fallido de login
            LogEntry.objects.create(
                user=None,
                action='LOGIN_FAILED',
                model_name='CustomUser',
                details={
                    'username': serializer.validated_data['username'],
                    'reason': 'Invalid credentials or user inactive'
                }
            )
            return Response({"error": "Invalid credentials or user inactive"}, status=400)

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return CustomUser.objects.filter(activo=True)

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        LogEntry.objects.create(
            user=self.request.user,
            action='LIST',
            model_name='CustomUser',
            object_id=None,
            details={'count': len(response.data)}
        )
        return response

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def perform_update(self, serializer):
        instance = serializer.save()
        LogEntry.objects.create(
            user=self.request.user,
            action='UPDATE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details=serializer.validated_data
        )

    def perform_destroy(self, instance):
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model_name=instance.__class__.__name__,
            object_id=instance.id,
            details={}
        )
        instance.delete()

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            try:
                refresh_token = request.data.get('refresh')
                token = RefreshToken(refresh_token)
                user_id = token.payload.get('user_id')
                
                if user_id and not token.blacklisted():
                    LogEntry.objects.create(
                        user_id=user_id,
                        action='TOKEN_REFRESH',
                        model_name='Token',
                        details={
                            'status': 'success',
                            'timestamp': str(timezone.now()),
                            'ip_address': request.META.get('REMOTE_ADDR'),
                            'user_agent': request.META.get('HTTP_USER_AGENT')
                        }
                    )
            except TokenError:
                pass  # Token inválido o en blacklist, ignorar el logging
            except Exception as log_error:
                print(f"Error al registrar log de refresh token: {str(log_error)}")

            return Response(validated_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response(
                    {"detail": "No se proporcionó token de refresco"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            user_id = token.payload.get('user_id')
            
            # Primero registramos el logout
            if user_id:
                LogEntry.objects.create(
                    user_id=user_id,
                    action='LOGOUT',
                    model_name='User',
                    details={
                        'status': 'success',
                        'timestamp': str(timezone.now()),
                        'ip_address': request.META.get('REMOTE_ADDR'),
                        'user_agent': request.META.get('HTTP_USER_AGENT')
                    }
                )
            
            # Luego blacklisteamos el token
            token.blacklist()
            return Response(status=status.HTTP_200_OK)
            
        except TokenError:
            return Response(
                {"detail": "Token inválido o expirado"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"detail": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
