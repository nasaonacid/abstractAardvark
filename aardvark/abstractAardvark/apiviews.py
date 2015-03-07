from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from abstractAardvark.models import Tree, User
from abstractAardvark.serializers import NodeSerializer, TreeSerializer, PaginatedTreeSerializer
from abstractAardvark.permissions import IsStaffOrReadOnly
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from random import randint, shuffle
import json



@api_view(['GET','POST'])
@permission_classes((IsStaffOrReadOnly,))
def game_list(request,format = None):
    """
    List all code snippets, or create a new snippet.
    """
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
                    serializer.save(creator = request.user)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else: 

                    return Response(serializer.data, status =status.HTTP_400_BAD_REQUEST)
            else:
                return Response("tree size doesn't match that specified in post", status =status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST'])
def game_control(request,pk = None,diff = 'easy', format = None):
    """
    Retrieve a new game, and verify answers

    """
    choices = ['easy','medium','hard']
    if not request.session.get('used'):
        request.session['used'] = []
    if not request.session.get('score'):
        request.session['score'] = 0

    if request.method == 'GET':
        if pk == None:
            if diff == None:
                diff = 'easy'
            if diff in choices:
                games = Tree.objects.filter(difficulty = diff)
                usable = []
                used =  request.session.get('used')
                for i in range(0, len(games)):
                    flag = True
                    for j in range(0,len(used)):
                        if games[i].pk == int(used[j]):
                            flag = False
                    if flag:
                        usable.append(games[i])
                if usable:
                    game= usable[randint(0,len(usable)-1)]


                else:
                    return Response({"error":"No trees of this kind exist"}, status = status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error":"Difficulty doesn't exist"},status = status.HTTP_400_BAD_REQUEST)
        else:
            game = Tree.objects.get(pk = pk)
            if not game:
                return Response({"error: "+ str(pk)+" doesn't exist"},status = status.HTTP_400_BAD_REQUEST)
        request.session['game'] = pk
        request.session['size'] = len(game.root.get_descendants())+1

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
        shuffle(answers)
        data['answers'] = answers
        data['max_width'] = game.max_width
        data['pk'] = game.pk
        data['score'] = request.session.get('score')
        data.pop('creator')
        return Response(data, status = status.HTTP_200_OK)
        

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

                    request.session['correct'] = 0

                    valid = check_tree_improved(root, postRoot, request.session)

                    
                    if request.session.get('correct') == request.session.get('size'):
                        request.session['used'].append(pk)
                        serializer.data['root']['complete'] = True
                        request.session['score'] += 1

                    if valid:
                        return Response(serializer.data, status = status.HTTP_200_OK)
                    else:
                        return Response(serializer.data, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response(["height doesn't match that of the tree and/or internal structure",serializer.data],status = status.HTTP_400_BAD_REQUEST)


        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET','DELETE'])
@permission_classes((IsStaffOrReadOnly,))
def game_detail(request,pk):
    try:
        game = Tree.objects.get(pk = pk)
    except Tree.DoesNotExist:
        return Response(status = status.HTTP_404_NOT_FOUND)
    if request.method == 'GET':
        serializer = TreeSerializer(game)
        data = serializer.data
        data['max_width'] = game.max_width
        return Response(data, status = status.HTTP_200_OK)
    elif request.method == 'DELETE':
        return Response({},status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def user_games(request, username, format = None):


    user= User.objects.filter(username = username)


    if user:
        queryset = Tree.objects.filter(creator = user[0].id)
        paginator = Paginator(queryset,1)

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
    return Response({}, status = status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def difficulty_list(request, diff, username = None,  format = None):
        choices = ['easy','medium','hard']
        if diff in choices:
            if username != None:

                user= User.objects.filter(username = username)
                if user:
                    queryset = Tree.objects.filter(difficulty = diff, creator = user[0].id)
            else:
                queryset = Tree.objects.filter(difficulty = diff)
            paginator = Paginator(queryset,1)

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
 
        return Response({}, status = status.HTTP_204_NO_CONTENT)


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
    if not node.has_key('level'):
        node['level'] = correctLevel
    if node['level'] != correctLevel:
        valid = False
        node['errors']['level'] = "Incorrect level for node"
    if not (node['content'].replace(" ","")).isalnum():
        valid = False
        node['errors']['content'] = "Content is not valid"
    for i in node['children']:
        valid = check_new_tree(i,correctLevel+1)

    return valid

def check_tree_post(node, answer_node, session):
    valid = True
    node['correct'] = None
    if node['content'] != answer_node.content :
        node['correct'] = False
    elif node['content'] == answer_node.content:
        node['correct'] = True
        session['correct'] += 1
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
            valid = check_tree_post(node['children'][i], children[i],session)

    return valid



def check_tree_improved(data, json, session):

    valid = True
    json['correct'] = None
    
    if json['content'] == " ":

        json['correct'] = None
    elif json['content'] != data.content :
        json['correct'] = False
    
    elif json['content'] == data.content:
        json['correct'] = True
        session['correct'] += 1
    
    json['errors'] = {}
    
    if json['level'] != data.get_level():
    
        valid = False
        json['errors']['level'] = "Level should be " + str(data.get_level())
    
    if len(json['children']) != len(data.get_children()):
    
        valid = False
        json['errors']['children'] = "incorrect number of children for this node "
    
    else:
        
        has_answers = False
        with_answer = []
        dChildren = data.get_children()
        
        for i in json['children']:
        
            if i['content'] != " ":
                has_answers = True
                with_answer.append(True)
            else:
                with_answer.append(False)
        
        if not has_answers:

            for i in range(0,len(json['children'])):
                valid = check_tree_improved(dChildren[i],json['children'][i],session)
        
        else:
            
            balanced_with = []
            available = []
            

            for i in dChildren:
                available.append(True)
                mirror = []

                for j in range(0, len(dChildren)):                        
                    if i != dChildren[j] and dChildren[j].balance == i.balance:
                        mirror.append(j)

                balanced_with.append(mirror)
            limbo = []
    

            for i in range(0,len(json['children'])):

                if balanced_with[i] == []:

                    available[i] = False
                    valid = check_tree_improved(dChildren[i], json['children'][i], session)

                elif json['children'][i]['content'] == dChildren[i].content and available[i]:

                    available[i] = False
                    valid = check_tree_improved(dChildren[i], json['children'][i], session)

                else:

                    matched = False
                    for j in balanced_with[i]:
                        if available[j]:
                            if json['children'][i]['content'] == dChildren[j].content:
                                available[j] = False
                                matched = True
                                valid = check_tree_improved(dChildren[j], json['children'][i], session)
                    if not matched:

                        limbo.append(json['children'][i])
          
            for i in limbo:

                for j in range(0,len(available)):
                    if(available[j]):

                        available[j] = False
                        valid = check_tree_improved(dChildren[j], i, session)


        return valid