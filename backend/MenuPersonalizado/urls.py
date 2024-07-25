from django.urls import path
from MenuPersonalizado.views import MenuPersonalizadoListCreateView, MenuPersonalizadoDetailView

urlpatterns = [
    path('menu_personalizado/', MenuPersonalizadoListCreateView.as_view(), name='menu_personalizado-list-create'),
    path('menu_personalizado/<int:pk>/', MenuPersonalizadoDetailView.as_view(), name='menu_personalizado-detail'),
]
