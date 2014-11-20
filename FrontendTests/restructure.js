var stage;

var pageWidth = $("#container").width();
var pageHeight = $("#container").height();
var hPadding;

if(pageWidth == null)
	pageWidth = 1024;
if (pageHeight == null)
	pageHeight = 800;

console.log(pageHeight);
console.log(pageWidth);

var tree = makeTree();
console.log(tree);

function initStage(){
	stage = new Kinetic.Stage({
		draggable: false,
		height: pageHeight,
		width: pageWidth,
		container: 'container' 
	});
	console.log("Got to the right area");
	createHierrarchy(tree);
	drawHierrarchy(tree);
	drawConnections(tree);

}

function createHierrarchy(tree){
	var depth = tree.depth;
	if(depth!=null && depth>0){
		hPadding = pageHeight/(depth*2 + 1);
		var boxHeight = (pageHeight - (hPadding * (depth + 2)))/depth;
		var boxWidth = pageWidth/(2*tree.largestWidth+1);
		tree.boxHeight = boxHeight;
		tree.boxWidth = boxWidth;
		var y = hPadding;
		for (i = 0; i < depth; i++){
			var widthPadding = wPadding(tree.contents[i].length,boxWidth);
			var x = widthPadding;
			for (j = 0; j <tree.contents[i].length; j++){
				tree.contents[i][j].x = x;
				tree.contents[i][j].y = y;
				x += widthPadding + boxWidth;
			}
			y += hPadding*2;
		}
	console.log(tree);
	console.log(tree.contents);
	}
	else
		console.log("empty tree error");
}

function wPadding(treeWidth,slotWidth){
	return ((pageWidth-(slotWidth*treeWidth))/(treeWidth+1));
}

function drawHierrarchy(tree){
	for (i = 0; i < tree.depth; i++){
		for (j = 0; j <tree.contents[i].length; j++){
			drawSlot(tree.contents[i][j].x,tree.contents[i][j].y, tree.boxWidth, tree.boxHeight);
		}
	
	}
}

function drawSlot(x,y,w,h){
	var layer = new Kinetic.Layer();
	var slot = new Kinetic.Rect({
		x: x,
		y: y,
		height: h,
		width: w,
		fill: 'rgba(255,255,255,0.0)',
		stroke:'black',
		strokeWidth: 1
	});
	layer.add(slot);
	stage.add(layer);
}

function drawConnections(tree){
	for (i = 0; i < tree.depth-1; i++){
		for (j = 0; j <tree.contents[i].length; j++){
			for(k = 0; k < tree.contents[i][j].children.length; k++){
				var index = tree.contents[i][j].children[k];

				drawArrow((tree.contents[i][j].x + tree.boxWidth/2) , (tree.contents[i][j].y + tree.boxHeight), (tree.contents[i+1][index].x +tree.boxWidth/2), (tree.contents[i+1][index].y),tree.boxHeight);
			}
		}
	
	}
}


function drawArrow(x,y,x1,y1,h){

	var layer = new Kinetic.Layer();
	var arrowHead = new Kinetic.RegularPolygon({
		sides: 3,
		x: x,
		y: y+5,
		radius: 5,
		fill: 'black',
		stroke: 'black',
		strokeWidth: 1

	});
	console.log(arrowHead);
	var arrowLine = new Kinetic.Line({
  		points: [arrowHead.getAttr('x'),arrowHead.getAttr('y'),arrowHead.getAttr('x'),arrowHead.getAttr('y') + h/2, x1, arrowHead.getAttr('y') + h/2, x1, y1],
  		stroke: 'black'
	});

	layer.add(arrowLine);
	layer.add(arrowHead);
	stage.add(layer);
}
