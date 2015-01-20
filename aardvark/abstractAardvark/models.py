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
    height = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default = 0)
    difficulty = models.CharField(max_length = 6, choices = CHOICES, default = 'easy')
    # created_by = models.ForeignKey(User)
    root = models.ForeignKey('Node')


class Node(MPTTModel):
    content = models.CharField(max_length = 255)
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')
    level = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)], default = 0)
    class MPTTMeta:
        order_insertion_by = ['content']



def tree_depth(x):
    if x.is_leaf_node():

        return x.level
    else:
        maxDepth = 0
        for i in x.get_children():
            temp = tree_depth(i)
            if temp>0:
                maxDepth = temp

        return maxDepth

def tree_update(t):
    root = t.root
    queue = []
    queue.append(root)
    while(queue):
        current = queue.pop()
        current.level = current.get_level()
        current.save()
        for i in current.get_children():
            queue.append(i)



