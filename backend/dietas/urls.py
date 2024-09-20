from django.urls import path
from .views import DietaListCreateView, DietaDetailView

urlpatterns = [
    path('', DietaListCreateView.as_view(), name='dieta-list-create'),
    path('<int:pk>/', DietaDetailView.as_view(), name='dieta-detail'),
]
