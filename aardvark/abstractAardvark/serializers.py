from rest_framework import serializers
from django.core.validators import MaxValueValidator, MinValueValidator
from abstractAardvark.models import Node, Tree


class NodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Node
        fields = ('content','level','children')
        depth = 1

 
# NodeSerializer._declared_fields['parent'] = NodeSerializer()
NodeSerializer._declared_fields['children'] = NodeSerializer(many=True)#no self referential calls can be made with rest serializers. This is a potential work around from http://stackoverflow.com/questions/13376894/django-rest-framework-nested-self-referential-objects()

class TreeSerializer(serializers.ModelSerializer):
    root = NodeSerializer()
    
    class Meta:
        model = Tree
        fields = ('height','difficulty','root')
        depth = 1

