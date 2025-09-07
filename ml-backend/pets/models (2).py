from django.db import models
from django.conf import settings

class Pet(models.Model):
    SPECIES_CHOICES = [
        ('dog', 'Dog'),
        ('cat', 'Cat'),
        ('bird', 'Bird'),
        ('fish', 'Fish'),
        ('turtle', 'Turtle'),
        ('rabbit', 'Rabbit'),
        ('hamster', 'Hamster'),
        ('snake', 'Snake'),
    ]
    
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    species = models.CharField(max_length=50, choices=SPECIES_CHOICES)
    breed = models.CharField(max_length=100)
    age = models.IntegerField()
    weight = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.species})"

class MedicalRecord(models.Model):
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='medical_records')
    date = models.DateTimeField(auto_now_add=True)
    symptoms = models.TextField()
    diagnosis = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Medical record for {self.pet.name} - {self.date}"