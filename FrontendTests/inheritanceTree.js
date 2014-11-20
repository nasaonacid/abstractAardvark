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
testTree.largestWidth = 6;
console.log("Tree width "+testTree.largestWidth);
console.log("Tree depth "+treeDepth(testTree));
setDepth(testTree,20);
console.log("Tree depth "+treeDepth(testTree));
var jsObj = {
  "largestWidth": 5, 
  "depth": 3, 
  "tree": [
    [
      "i"
    ], 
    [
      "am", 
      "the", 
      "greatest", 
      "motherfucker", 
      "ever"
    ], 
    [
      "seen"
    ]
  ]
};
console.log(jsObj);

function initStage(){
	stage = new Kinetic.Stage({
		draggable: false,
		height: height,
		width: width,
		container: 'container' 
	});
	console.log("Got to the right area");
	// $.getJSON("http://www.bongcast.com/api/users/brett/?callback=?",function(data){
	// });
	
	drawTHierrarchy(jsObj);

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
	var depth = tree.depth;
	console.log
	if(depth!=null && depth!=0){
		hPadding = height/(depth*2 + 1);
		var boxHeight = (height -(hPadding*(depth+2)))/depth;
		console.log("Here "+boxHeight);
		console.log("Here "+ tree.largestWidth);
		var boxWidth = width/(2*tree.largestWidth+1)

		var y = hPadding;
		var travelling = true;
		for(i = 0; i<depth;i++){
			if (i+1 == depth)
				travelling = false;
			var wPad = wPadding(tree.tree[i].length,boxWidth);
			var x = wPad;
			for (var node in tree.tree[i]){
				drawSlot(x,y,boxWidth,boxHeight,travelling);
				x += wPad + boxWidth; 
			}
			
			y = y+hPadding*2;
		}
		
	} else{
		console.log("Empty tree error");
	}
}

function wPadding(treeWidth,slotWidth){
			console.log("Here ");
	return ((width-(slotWidth*treeWidth))/(treeWidth+1));
}

function drawSlot(x,y,w,h,d){
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
	if (d){
		drawArrow(x+w/2,y+h);
	}

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
