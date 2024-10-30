from django.urls import path
from .views import (
    DietaListCreateView, 
    DietaDetailView,
    AlergiaListCreateView,
    AlergiaDetailView
)

urlpatterns = [
    path('dietas/', DietaListCreateView.as_view(), name='dieta-list-create'),
    path('dietas/<int:pk>/', DietaDetailView.as_view(), name='dieta-detail'),
    path('alergias/', AlergiaListCreateView.as_view(), name='alergia-list-create'),
    path('alergias/<int:pk>/', AlergiaDetailView.as_view(), name='alergia-detail'),
]
