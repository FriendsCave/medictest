from django.db import models

class Patient(models.Model):
    full_name = models.CharField(max_length=255)
    birth_date = models.DateField()
    card_number = models.CharField(max_length=50, unique=True)
    diagnosis = models.TextField()

    def __str__(self):
        return self.full_name
