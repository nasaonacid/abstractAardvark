// function TreeNode(contents,children){
// 	this.contents = contents;
// 	this.children = children;
// 	this.childWidth = children.length;
// 	this.x = 0;
// 	this.y = 0;
// 	this.currentDepth = 0;
// }
// function Tree(){
// 	this.root = null;
// 	this.depth = 0;
// 	this.largestWidth = 0; 
// }

// function treeDepth(tree){
// 	if (!(tree instanceof Tree)){ 
// 		return null;
// 	}
// 	return tree.depth;

// }

// function setDepth(tree,x){
// 	tree.depth = x;
// }



// // 

function TreeStructure(width,contents){
	this.largestWidth = width;
	this.depth = contents.length;
	this.contents = contents
}

function Node(content, children, x, y){
	this.content = content;
	this.children = children;
	this.x = x;
	this.y = y; 
}

function makeTree(){
	var contentList = [];
	var layer = [];
	var layer2 = [];
	var layer3 = [];
	
	var node = new Node("object", [0,1],0,0);
	var node2 = new Node("natural", [0,1],0,0);
	var node3 = new Node("manmade",[2,3,4],0,0);
	var node4 = new Node("fruit",null,0,0);
	var node5 = new Node("vegetable",null,0,0);
	var node6 = new Node("automobile",null,0,0);
	var node7 = new Node("computer",null,0,0);
	var node8 = new Node("building", null,0,0);

	layer.push(node);
	layer2.push(node2);
	layer2.push(node3);
	layer3.push(node4);
	layer3.push(node5);
	layer3.push(node6);
	layer3.push(node7);
	layer3.push(node8);
	contentList.push(layer);
	contentList.push(layer2);
	contentList.push(layer3);

	
	var x = new TreeStructure(3,contentList);
	return x;
}