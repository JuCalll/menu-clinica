from django.contrib.auth import authenticate
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserSerializer, LoginSerializer

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        role = self.request.data.get('role')
        if role == 'admin':
            serializer.save(is_staff=True, is_superuser=True)
        else:
            serializer.save()

class LoginView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'role': user.role,
                }
            })
        return Response({"error": "Credenciales inválidas"}, status=400)

class UserListView(generics.ListAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):  # Nueva vista para obtener un usuario por ID
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
