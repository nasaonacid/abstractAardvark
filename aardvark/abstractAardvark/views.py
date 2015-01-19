from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from abstractAardvark.models import Tree
from abstractAardvark.serializers import NodeSerializer, TreeSerializer

class JSONResponse(HttpResponse):
    """
    An HttpResponse that renders its content into JSON.
    """
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        print type(content)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@csrf_exempt
def game_list(request):
    """
    List all code snippets, or create a new snippet.
    """
    if request.method == 'GET':
        trees = Tree.objects.all()
        serializer = TreeSerializer(trees, many=True)
        print serializer.data
        return JSONResponse(serializer.data)

    elif request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = TreeSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)
        return JSONResponse(serializer.errors, status=400)

def game_detail(request,pk):
	"""
	Retrieve a new game, and verify answers

	"""
	try:
		game = Tree.objects.get(pk = pk)
	except Tree.DoesNotExist:
		return HttpResponse(status = 404)

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
		print  answers
		print data['height']
		return JSONResponse(data)
	elif request.method == 'POST':
		return JSONResponse(serializer.errors, status=400)
	elif request.method == 'DELETE':
		return JSONResponse(serializer.errors, status=400)