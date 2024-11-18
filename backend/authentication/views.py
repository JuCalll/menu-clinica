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
from django.db import models
from django.core import serializers
from django.db import transaction

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            # Buscamos usuarios previos con la misma cédula
            previous_user = CustomUser.objects.filter(
                cedula=request.data.get('cedula'),
                activo=False
            ).order_by('-ingreso_count').first()

            if previous_user:
                # Es un reingreso
                ingreso_count = previous_user.ingreso_count + 1
                
                # Modificamos el nombre de usuario para el reingreso
                base_username = request.data.get('username')
                new_username = f"{base_username}{ingreso_count}"
                
                # Actualizamos el payload con el nuevo username
                modified_data = request.data.copy()
                modified_data['username'] = new_username
                serializer = self.get_serializer(data=modified_data)
                
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer, ingreso_count)
                headers = self.get_success_headers(serializer.data)
                
                response_data = serializer.data
                response_data['is_reentry'] = True
                response_data['original_username'] = base_username
                
                return Response(
                    response_data, 
                    status=status.HTTP_201_CREATED, 
                    headers=headers
                )
            else:
                # Es un nuevo usuario
                # Verificamos si existe un usuario activo con el mismo email, cédula o username
                active_user = CustomUser.objects.filter(
                    activo=True
                ).filter(
                    models.Q(email=request.data.get('email')) |
                    models.Q(cedula=request.data.get('cedula')) |
                    models.Q(username=request.data.get('username'))
                ).first()

                if active_user:
                    return Response(
                        {"detail": "Ya existe un usuario activo con este email, cédula o nombre de usuario"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(
                    serializer.data, 
                    status=status.HTTP_201_CREATED, 
                    headers=headers
                )

        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer, ingreso_count=1):
        instance = serializer.save(ingreso_count=ingreso_count)
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
            details={
                **serializer.validated_data,
                'ingreso_count': ingreso_count,
                'tipo': 'reingreso' if ingreso_count > 1 else 'nuevo'
            }
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

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        try:
            with transaction.atomic():
                # Si estamos desactivando el usuario
                if instance.activo and not request.data.get('activo'):
                    # Primero modificamos temporalmente el email y username
                    temp_suffix = f"_temp_{timezone.now().timestamp()}"
                    instance.email = f"{instance.email}{temp_suffix}"
                    instance.username = f"{instance.username}{temp_suffix}"
                    instance.save()
                    
                    # Ahora actualizamos con los datos reales
                    serializer = self.get_serializer(instance, data=request.data, partial=True)
                    serializer.is_valid(raise_exception=True)
                    self.perform_update(serializer)
                else:
                    serializer = self.get_serializer(instance, data=request.data, partial=True)
                    serializer.is_valid(raise_exception=True)
                    self.perform_update(serializer)

                return Response(serializer.data)

        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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
