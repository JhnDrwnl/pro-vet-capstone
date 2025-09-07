from django.db import models
from pets.models import Pet, MedicalRecord

class Prediction(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE)
    prediction_date = models.DateTimeField(auto_now_add=True)
    predicted_disease = models.CharField(max_length=200)
    confidence_score = models.FloatField()
    details = models.JSONField(default=dict)
    is_confirmed = models.BooleanField(default=False)
    confirmed_by = models.ForeignKey(
        'auth.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )

    def __str__(self):
        return f"Prediction for {self.pet.name}: {self.predicted_disease}"
