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



	
