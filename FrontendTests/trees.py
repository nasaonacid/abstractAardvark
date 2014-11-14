# class TreeNode(dict):
# 	def __init__(self, name, children=None, parent=None):
# 		self.__dict__ = self
# 		self.name = name
# 		if not parent:
# 			self.level = 0
# 		else:
# 			self.level = parent.depth + 1
# 		self.children = [] if not children else children

if __name__ == '__main__':
	import json

	# tree = TreeNode('Parent')
	# tree.children.append(TreeNode('Child 1',None,tree))
	# child2 = TreeNode('Child 2', None, tree)
	# tree.children.append(child2)
	# child2.children.append(TreeNode('Grand Kid', None, child2))
	# child2.children[0].children.append(TreeNode('Great Grand Kid', None, child2.children[0]))
	tree = {'totalDepth': 3,'largestTier':5, 'tree':[["i"],["am","the","greatest","motherfucker","ever"],["seen"]]}

	json_str = json.dumps(tree, sort_keys=True, indent=2)
	print(json_str)
	return json_str