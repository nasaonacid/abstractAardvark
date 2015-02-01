import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aardvark.settings')

import django
django.setup()

from nltk.corpus import wordnet as wn
from abstractAardvark.models import Tree
from abstractAardvark.models import Node as MNode

class Node(object):
 
    def __init__(self, content=None, parent=None, children=None):
        self.content = content
        self.parent = parent
        self.children = children if children else []
        self.level = 0 if not self.parent else self.parent.level + 1

    def add_child(self, node):
        node.parent = self
        self.children.append(node)
    
    @property
    def children(self):
        return self._children
    @children.setter
    def children(self, value):
        self._children = value
    
    @property
    def parent(self):
        return self._parent

    @parent.setter
    def parent(self, value):
        self._parent = value
 
    def __str__(self, level=0):
        node = "\t" * level + str(self.content) + "\n"
        for child in self.children:
                node += child.__str__(level+1)
        return node


def create_wordnet_tree(root_word = None):
	if not root_word:
		return wordnet_tree(wn.synset("entity.n.01"))
	else:
		return wordnet_tree(wn.synset(root_word+"n.01"))

def wordnet_tree(word,parent = None):
	children = word.hyponyms()
	node = Node(word.name().split(".")[0], parent)
	for i in children:
		if i.name().split(".")[1] == "n":
			node.children.append(wordnet_tree(i,node))
		
	return node;

def process_tree(node):
    process_list = []
    process_list.append(node)
    while process_list:
        print "processing"
        root, height= process_node(process_list.pop())
        difficulty = 'easy'
        total = len(root.get_descendants())
        if total> 13:
            difficulty = 'hard'
        elif total>4 and total<=13:
            difficulty = 'medium'
        t = Tree.objects.create(height = height, difficulty = difficulty, root = root)
        t.save()
        for i in node.children:
            process_list.append(i)


    
def process_node(node, parent = None):
    if not parent:
        level = 0
    else:
        level = parent.get_level()+1
    n = MNode.objects.create(content = node.content, parent = parent, level = level)
    n.save()
    depth = level
    if level<3:
        length = len(node.children)
        if length>3:
            length = 3
        if length>0:
            nos = []
            for i in range(0,length):
                x, number = process_node(node.children[i],n)
                nos.append(number)
            depth = max(nos)
    return n, depth

	

def populate():
    x = create_wordnet_tree()
    process_tree(x)
if __name__ == '__main__':
    print "Starting abstractAardvark population script..."
    populate()
