from rest_framework import serializers
from django.core.validators import MaxValueValidator, MinValueValidator
from abstractAardvark.models import Node, Tree
from rest_framework.pagination import PaginationSerializer
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    trees = serializers.PrimaryKeyRelatedField(many = True, queryset = Tree.objects.all())

    class Meta:
        model = User
        fields = ('id', 'username', 'trees')

class NodeSerializer(serializers.ModelSerializer):
    balance = serializers.CharField(required = False)

    class Meta:
        model = Node
        fields = ('content','level','children', 'balance')
        depth = 1

    def create(self,validated_data,parent = None):
        content = validated_data.pop('content')
        p = parent if parent else None
        node = Node.objects.create(content = content, parent = p)

        children = validated_data.pop('children')
        for child in children:
            self.create(child, node)
        return node

 
# NodeSerializer._declared_fields['parent'] = NodeSerializer()
NodeSerializer._declared_fields['children'] = NodeSerializer(many=True)#no self referential calls can be made with rest serializers. This is a potential work around from http://stackoverflow.com/questions/13376894/django-rest-framework-nested-self-referential-objects()

class TreeSerializer(serializers.ModelSerializer):
    root = NodeSerializer()
    creator = serializers.ReadOnlyField(source = 'creator.username')
    
    class Meta:
        model = Tree
        fields = ('height','difficulty','root', 'creator')
        depth = 1

    def create(self, validated_data):

        height = validated_data.pop('height')
        difficulty = validated_data.pop('difficulty')
        root_data = validated_data.pop('root')
        nSerial = NodeSerializer(data = root_data)
        root = nSerial.save() if nSerial.is_valid() else None
        update_balance(root)
        max_width = calc_max_width(root)
        creator = validated_data.pop('creator')
        print validated_data

        tree = Tree.objects.create(height = height, difficulty = difficulty, root = root, max_width = max_width, creator = creator)
        return tree

def update_balance(root):
    children = root.get_children()
    balance = {}
    for i in range(0,len(children)):
        balance[i] = update_balance(children[i])
    root.balance = str(balance)
    root.save()
    return balance

def calc_max_width(node):
    width_list = {}
    process_list = []
    process_list.append(node)
    while process_list:

        current = process_list.pop()
        if not width_list.has_key(current.level):
            width_list[current.level]=0
        width_list[current.level] +=1
        for i in current.get_children():
            process_list.append(i)

    return max(width_list.values())


class PaginatedTreeSerializer(PaginationSerializer):

    class Meta:
        object_serializer_class = TreeSerializer


