var stage;

var width = $("#container").width();
var height = $("#container").height();
var hPadding;
if (width == null){
	width = 1024;
};
if (height == null){
	height = 800;
};

var slots = [];
console.log(height);
console.log(width);

var testTree = new Tree();
console.log("Tree depth "+treeDepth(testTree));
setDepth(testTree,20);
console.log("Tree depth "+treeDepth(testTree));

function initStage(){
	stage = new Kinetic.Stage({
		draggable: false,
		height: height,
		width: width,
		container: 'container' 
	});
	drawTHierrarchy(testTree);
	console.log("Got to the right area");
	// drawHierrarchy();
}

function drawHierrarchy(){
	console.log("Got to the right area");
	drawSlot(50,50,100,20);
}

/*
	need to set width of boxes to be (stageWidth -((tree.largestWidth+2)*(wPad )))*tree.largestWidth
	height position of boxes to be determined by adding xpad and height of slot to height of new slot. 
	padWidth = (parentWidth /(2*treewidth))-(slotWidth/2)
	padHeight = stageheight/(depth *2 +1)
*/
function drawTHierrarchy(tree){
	var depth = treeDepth(tree);
	if(depth!=null && depth!=0){
		hPadding = height/(depth*2 + 1);
		wPadding
		var boxHeight = (height -(hPadding*(depth+2)))/depth;
		var boxWidth = (width - ((tree.largestWidth+1)*wPadding(tree.largestWidth))*tree.largestWidth;
		console.log(boxHeight);
		var y = hPadding;
		for(i = 0; i<depth;i++){
			drawSlot(0,y,20,boxHeight);
			y = y+hPadding*2;
		}
		
	} else{
		console.log("Empty tree error");
	}
}

function wPadding(treeWidth,slotWidth){
	return ((width/(2*x))-(slotWidth/2));
}

function drawSlot(x,y,w,h){
	var layer = new Kinetic.Layer();
	var slot = new Kinetic.Rect({
		x: x,
		y: y,
		height: h,
		width: w,
		fill: 'rgba(0,0,0,0.2)',
		stroke:'black',
		strokeWidth: 1
	});
	slots.push({x:slot.getAttr('x'),y:slot.getAttr('y')});
	layer.add(slot);
	stage.add(layer);
	drawArrow(x+w/2,y+h);
}

function drawArrow(x,y){
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
	var arrowLine = new Kinetic.Line({
  		points: [arrowHead.getAttr('x'), arrowHead.getAttr('y'), arrowHead.getAttr('x'),arrowHead.getAttr('y') + 30],
  		stroke: 'red'
	});

	layer.add(arrowLine);
	layer.add(arrowHead);
	stage.add(layer);
}

function drawArrowBetween(){}
