from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from mptt.models import MPTTModel, TreeForeignKey
# class UserProfile(object):

#     user = models.OneToOneField(User)

# Create your models here.
CHOICES = (
        ('easy','Easy'),
        ('medium','Medium'),
        ('hard', 'Hard'),
    )

class Tree(models.Model):
    height = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)])
    difficulty = models.CharField(max_length = 6, choices = CHOICES, default = 'easy')
    # created_by = models.ForeignKey(User)
    root = models.ForeignKey('Node')


class Node(MPTTModel):
    content = models.CharField(max_length = 255)
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')

    class MPTTMeta:
        order_insertion_by = ['content']



