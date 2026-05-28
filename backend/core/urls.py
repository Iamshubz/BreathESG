from django.urls import path
from .views import UploadCSVAPIView, NormalizedRowListAPI, ApproveRowAPI
urlpatterns = [
    path('upload/', UploadCSVAPIView.as_view(), name='upload-csv'),
    path('rows/', NormalizedRowListAPI.as_view(), name='rows-list'),
    path('rows/<int:pk>/action/', ApproveRowAPI.as_view(), name='row-action'),
]
