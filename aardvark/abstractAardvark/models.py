from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator

# class UserProfile(object):

#     user = models.OneToOneField(User)

# Create your models here.
CHOICES = (
        ('easy','Easy'),
        ('medium','Medium'),
        ('hard', 'Hard'),
    )

class Tree(models.Model):
    depth = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)])
    difficulty = models.CharField(max_length = 6, choices = CHOICES, default = 'easy')
    # created_by = models.ForeignKey(User)
    content = models.TextField()
