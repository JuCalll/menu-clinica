from django.contrib.auth import authenticate
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from .models import CustomUser
from .serializers import UserSerializer, LoginSerializer
from logs.models import LogEntry

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
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=serializer.validated_data,
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
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'role': user.role,
                    'name': user.name  
                }
            })
        else:
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
            model='CustomUser',
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
            model=instance.__class__.__name__,
            object_id=instance.id,
            changes=serializer.validated_data,
        )

    def perform_destroy(self, instance):
        LogEntry.objects.create(
            user=self.request.user,
            action='DELETE',
            model=instance.__class__.__name__,
            object_id=instance.id,
        )
        instance.delete()

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        response_data = {
            "access": data.get("access"),
            "refresh": data.get("refresh"),  
        }

        return Response(response_data, status=status.HTTP_200_OK)
