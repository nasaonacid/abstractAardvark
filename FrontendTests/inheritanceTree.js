var stage;
// var height = $("#container").height;
// var width = $("#container").width;
// console.log(height);
// console.log(width);
var width = 1024;
var height = 1024;
var slots = [];
console.log(height);
console.log(width);

function initStage(){
	stage = new Kinetic.Stage({
		draggable: false,
		height: height,
		width: width,
		container: 'container' 
	});
	drawHierrarchy();
}

function drawHierrarchy(){
	drawSlot(50,50,100,20);
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
		strokeWidth: 1,
		draggable: true
	});
	slots.push({x:slot.getAttr('x'),y:slot.getAttr('y')})
	layer.add(slot);
	stage.add(layer);
	drawArrow(x+w/2,y+h)
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
