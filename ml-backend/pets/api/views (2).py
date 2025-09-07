from rest_framework import viewsets
from pets.models import Pet, MedicalRecord
from .serializers import PetSerializer, MedicalRecordSerializer

class PetViewSet(viewsets.ModelViewSet):
    serializer_class = PetSerializer

    def get_queryset(self):
        return Pet.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        return MedicalRecord.objects.filter(pet__owner=self.request.user)