class TreeNode(dict):
	def __init__(self, name, children=None):
		self.__dict__ = self
		self.name = name
		self.children = [] if not children else children

if __name__ == '__main__':
	import json

	tree = TreeNode('Parent')
	tree.children.append(TreeNode('Child 1'))
	child2 = TreeNode('Child 2')
	tree.children.append(child2)
	child2.children.append(TreeNode('Grand Kid'))
	child2.children[0].children.append(TreeNode('Great Grand Kid'))

	json_str = json.dumps(tree, sort_keys=True, indent=2)
	print(json_str)