function TreeStructure(width,contents){
	this.largestWidth = width;
	this.depth = contents.length;
	this.contents = contents;
	this.totalSize = 0;
	for (var i=0; i<this.depth; i++) {
		this.totalSize += contents[i].length;
	}
}

function Node(content, children, x, y){
	this.content = content;
	this.children = children;
	this.x = x;
	this.y = y;
	this.matched = false;
	this.correctMap = false;
}
