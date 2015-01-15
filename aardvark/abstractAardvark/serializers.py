from rest_framework import serializers
from django.core.validators import MaxValueValidator, MinValueValidator
from abstractAardvark.models import CHOICES


class NodeSerializer(serializers.Serializer):
    content = serializers.CharField()
    depth = serializers.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)])
    children = None

    def validate(self, data):
        print data
        return data

NodeSerializer.children = NodeSerializer(many=True)#no self referential calls can be made with rest serializers. This is a potential work around from http://stackoverflow.com/questions/13376894/django-rest-framework-nested-self-referential-objects()

class TreeSerializer(serializers.Serializer):
    
    depth = serializers.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(4)])
    difficulty = serializers.ChoiceField(CHOICES,default = 'easy')
    content = NodeSerializer()

    def create(self, **validated_data):
        return Tree.create.object(**validated_data)

