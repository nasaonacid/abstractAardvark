from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from abstractAardvark.models import Tree
from abstractAardvark.serializers import NodeSerializer, TreeSerializer, PaginatedTreeSerializer
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from random import randint
import json



@api_view(['GET','POST'])
def game_list(request,format = None):
    """
    List all code snippets, or create a new snippet.
    """
    print request.session.get_expiry_age()
    if request.session.get('test') == None:
        print("wompa")
        request.session['test'] ='wwwww2'
        request.session.set_expiry(100)
    if request.session.get_expiry_age() <= 0:
        print session.get('test')
        request.session.clear_expired()
    if request.method == 'GET':
        trees = Tree.objects.all()
        paginator = Paginator(trees,10)
        page = request.QUERY_PARAMS.get('page')
        try:
            trees = paginator.page(page)
        except PageNotAnInteger:
            trees = paginator.page(1)
        except EmptyPage:
            trees = paginator.page(paginator.num_pages)

        serializer_context = {'request': request}
        serializer = PaginatedTreeSerializer(trees, context = serializer_context)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TreeSerializer(data=request.data)
        if serializer.is_valid():
            if serializer.data['height'] == get_tree_height(serializer.data['root']):
                if check_new_tree(serializer.data['root']):
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else: 

                    return Response(serializer.data, status =status.HTTP_400_BAD_REQUEST)
            else:
                return Response("tree size doesn't match that specified in post", status =status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST','DELETE'])
def game_detail(request,pk = None,diff = 'easy', format = None):
    """
    Retrieve a new game, and verify answers

    """
    choices = ['easy','medium','hard']

    if request.method == 'GET':
        if pk == None:
            if diff == None:
                diff = 'easy'
            if diff in choices:
                games = Tree.objects.filter(difficulty = diff)
                if games:
                    game= games[randint(0,len(games)-1)]
                else:
                    return Response({"error":"No trees of this kind exist"}, status = status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error":"Difficulty doesn't exist"},status = status.HTTP_400_BAD_REQUEST)
        else:
            game = Tree.objects.get(pk = pk)
            if not game:
                return Response({"error: "+ str(pk)+" doesn't exist"},status = status.HTTP_400_BAD_REQUEST)
        
        serializer = TreeSerializer(game);
        data = serializer.data
        answers = []
        data_to_process = []
        data_to_process.append(data['root'])
        while data_to_process:
            temp = data_to_process.pop()
            answers.append(temp['content'])
            temp['content'] = " "
            for i in temp['children']:
                data_to_process.append(i)
        data['answers'] = answers
        data['max_width'] = game.max_width
        data['pk'] = game.pk
        return Response(data)
        

        #check content then check depth
        
    elif request.method == 'POST':

        try:
            game = Tree.objects.get(pk = pk)
        except Tree.DoesNotExist:
            return Response(status = status.HTTP_404_NOT_FOUND)
        data = request.data
        if(data.has_key('json')):
            data = json.loads(data['json'])
        serializer = TreeSerializer(data = data)
        if serializer.is_valid(): 
            if serializer.data['height'] == get_tree_height(serializer.data['root']):
                if serializer.data['height']==game.height:
                    postRoot = serializer.data['root']

                    root = game.root

                    valid = check_tree_post(postRoot,root)
                    if valid:
                        return Response(serializer.data, status = status.HTTP_200_OK)
                    else:
                        return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(["height doesn't match that of the tree and/or internal structure",serializer.data],status = status.HTTP_400_BAD_REQUEST)


        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def makeProcessList(node):
    processedList = [node]

    for i in node['children']:
        processedList.extend(makeProcessList(i))
    return processedList

def get_tree_height(node):
    if len(node['children']) == 0:
        return 1
    else:
        children_levels  = []
        for i in range(0,len(node['children'])):
            children_levels.append(get_tree_height(node['children'][i]))
        return max(children_levels) + 1

#use this to validate tree creates only. With tree posts validate by doing node on node. 
def check_new_tree(node, correctLevel = None):
    
    valid = True
    if not correctLevel:
        correctLevel = 0 

    if not node.has_key('errors'):
        node['errors'] ={}
    if node['level'] != correctLevel:
        valid = False
        node['errors']['level'] = "Incorrect level for node"
    if not (node['content'].replace(" ","")).isalnum():
        valid = False
        node['errors']['content'] = "Content is not valid"
    for i in node['children']:
        valid = check_new_tree(i,correctLevel+1)

    return valid

def check_tree_post(node, answer_node):
    valid = True
    node['correct'] = None
    if node['content'] != answer_node.content :
        node['correct'] = False
    elif node['content'] == answer_node.content:
        node['correct'] = True
    node['errors'] = {}
    if node['level'] != answer_node.get_level():
        valid = False
        node['errors']['level'] = "Level should be " + str(answer_node.get_level())
    if len(node['children']) != len(answer_node.get_children()):
        valid = False
        node['errors']['children'] = "incorrect number of children for this node "
    else:
        children = answer_node.get_children()
        for i in range(0,len(children)):
            valid = check_tree_post(node['children'][i], children[i])

    return valid


#     