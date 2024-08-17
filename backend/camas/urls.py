from django.urls import path
from .views import CamaListCreateView, CamaDetailView

urlpatterns = [
    path('', CamaListCreateView.as_view(), name='cama-list-create'),
    path('<int:pk>/', CamaDetailView.as_view(), name='cama-detail'),
]
