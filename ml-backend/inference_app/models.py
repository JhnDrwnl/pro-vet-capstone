from django.db import models

class Prediction(models.Model):
    """Model for storing prediction results"""
    pet_id = models.CharField(max_length=100)
    medical_record_id = models.CharField(max_length=100, blank=True, null=True)
    predicted_disease = models.CharField(max_length=200)
    confidence_score = models.FloatField()
    details = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.predicted_disease} ({self.confidence_score:.2f})"

