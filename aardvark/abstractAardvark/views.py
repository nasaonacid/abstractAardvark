from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from abstractAardvark.models import Tree
from abstractAardvark.serializers import NodeSerializer, TreeSerializer



@api_view(['GET','POST'])
def game_list(request,format = None):
    """
    List all code snippets, or create a new snippet.
    """
    if request.method == 'GET':
        trees = Tree.objects.all()
        serializer = TreeSerializer(trees, many=True)
        print serializer.data
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TreeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET','POST','DELETE'])
def game_detail(request,pk, format = None):
    """
    Retrieve a new game, and verify answers

    """
    try:
        game = Tree.objects.get(pk = pk)
    except Tree.DoesNotExist:
        return Response(status = status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TreeSerializer(game);
        data = serializer.data
        answers = []
        data_to_process = []
        data_to_process.append(data['root'])
        while data_to_process:
            temp = data_to_process.pop()
            answers.append(temp['content'])
            temp['content'] = ''
            for i in temp['children']:
                data_to_process.append(i)
        data['answers'] = answers
        return Response(data)
        

        #check content then check depth
        
    elif request.method == 'POST':
        serializer = TreeSerializer(data = request.data)
        if serializer.is_valid():
            if serializer.data['height']==game.height:
                postRoot = serializer.data['root']

                root = game.root
                checkList = []
                answerList =[]
                answerList.append(root)
                answerList.extend(root.get_descendants())
                checkList = makeProcessList(postRoot)
                for i in range (0,len(checkList)):
                    if checkList[i]['content'].replace(" ","") =="":
                        checkList[i]["correct"] = None
                    elif checkList[i]['content']== answerList[i].content:
                        checkList[i]['correct']= True
                    else:
                        checkList[i]['correct'] = False
                return Response(serializer.data, status = status.HTTP_200_OK)
            else:
                return Response({"tree height is not equal to that of the game tree"},status = status.HTTP_400_BAD_REQUEST)


        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def makeProcessList(node):
    processedList = [node]

    for i in node['children']:
        processedList.extend(makeProcessList(i))
    return processedList