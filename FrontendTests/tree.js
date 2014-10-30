function TreeNode(contents,children){
	this.contents = contents;
	this.children = children;
	this.childWidth = children.length;
	this.x = 0;
	this.y = 0;
	this.currentDepth = 0;
}
function Tree(){
	this.root = null;
	this.depth = 0;
	this.largestWidth = 0; 
}

function treeDepth(tree){
	if (!(tree instanceof Tree)){ 
		return null;
	}
	return tree.depth;

}

function setDepth(tree,x){
	tree.depth = x;
}



