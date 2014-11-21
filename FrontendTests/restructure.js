var stage;

var pageWidth = $("#container").width();
var pageHeight = $("#container").height();
var hPadding;
var hierrarchyLayer = new Kinetic.Layer();
var arrowLayer = new Kinetic.Layer();
var interimSolution;
var answerLayer = new Kinetic.Layer();

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
	// console.log(interimSolution);
	drawConnections(tree);
	drawAnswers(tree);
	stage.add(arrowLayer);
	console.log(stage);
	stage.add(hierrarchyLayer);
	stage.add(answerLayer);
	console.log(hierrarchyLayer.find('#object'));


}

function createHierrarchy(tree){
	var depth = tree.depth;
	if(depth!=null && depth>0){
		hPadding = pageHeight/(depth*2 + 1);
		var boxHeight = (pageHeight - (hPadding * (depth + 2)))/depth;
		var boxWidth = pageWidth/(2*tree.largestWidth+2);
		tree.boxHeight = boxHeight;
		tree.boxWidth = boxWidth;
		var y = hPadding;
		for (i = 0; i < depth; i++){
			var widthPadding = wPadding(tree.contents[i].length,boxWidth);
			console.log("widthPadding " + widthPadding);
			var x = widthPadding;
			for (j = 0; j <tree.contents[i].length; j++){
				tree.contents[i][j].x = x;
				tree.contents[i][j].y = y;
				x += widthPadding + boxWidth;
			}
			y += hPadding*2;
		}
	// console.log(tree);
	// console.log(tree.contents);
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
			hierrarchyLayer.add(drawSlot(tree.contents[i][j].x,tree.contents[i][j].y, tree.boxWidth, tree.boxHeight,tree.contents[i][j].content));
		}
	
	}
}

function drawSlot(x,y,w,h,id){
	// var layer = new Kinetic.Layer();

	var slot = new Kinetic.Rect({
		x: x,
		y: y,
		height: h,
		width: w,
		fill: 'rgba(255,255,255,1)',
		stroke:'black',
		id: id,
		strokeWidth: 1
	});
	// interimSolution.push({id:[x,y]});
	return slot;

	// stage.add(layer);
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
		y: y+7,
		radius: 7,
		fill: 'white',
		stroke: 'black',
		strokeWidth: 1

	});
	var arrowLine = new Kinetic.Line({
  		points: [arrowHead.getAttr('x'),arrowHead.getAttr('y'),arrowHead.getAttr('x'),arrowHead.getAttr('y') + h/2, x1, arrowHead.getAttr('y') + h/2, x1, y1],
  		stroke: 'black'
	});
	var group = new Kinetic.Group();

	group.add(arrowLine);
	group.add(arrowHead);
	arrowLayer.add(group);
}

function drawAnswers(tree){
	var x = 0
	var y = hPadding*tree.depth*2;
	for (i = 0; i < tree.depth; i++){
		for (j = 0; j <tree.contents[i].length; j++){
			var rect = drawSlot(0,0, tree.boxWidth, tree.boxHeight,tree.contents[i][j].content);
			var text = new Kinetic.Text({
				align: "center",
				// text: "tits",
				x: 0,
				y: 0+(tree.boxHeight/3),
				height: tree.boxHeight,
				width: tree.boxWidth,
				text: tree.contents[i][j].content,
		        fontSize: 15,
		        fontFamily: 'Calibri',
		        fill: 'black'
// tree.contents[i][j].content
			});
			var group = new Kinetic.Group({
				draggable: true,
				x: x,
				y: y
			});
			group.add(rect);
			group.add(text);
			group.on('mouseover touchstart', function(evt) {
              evt.target.strokeWidth(2);
              answerLayer.draw();
              document.body.style.cursor = 'pointer';
            });
            // return animal on mouseout
            group.on('mouseout touchend', function(evt) {
              evt.target.strokeWidth(1);
              hierrarchyLayer.draw();
              document.body.style.cursor = 'default';
            });
            group.on('dragstart', function() {
              	this.moveToTop();
             	stage.draw();
            });
            group.on('dragend', function(evt) {
            	var current = evt.target.find('Rect')[0]
            	var id = current.getAttr('id');
            	current = evt.target;
            	var solution = hierrarchyLayer.find('Rect');
            	for(i = 0; i<solution.length; i++){
            		console.log(solution[i]);
            		if (solution[i].getAttr('id') == id){
            			solution = solution[i];
            			break;
            		}
            	}

     
                var xComp = current.getAttr('x') ;
                var yComp = current.getAttr('y') ;
	            console.log("current " + xComp + " , " + yComp);
	          	console.log("solution" + solution.getAttr('x') + "," + solution.getAttr('y'));

                if(Math.abs(xComp-solution.getAttr('x')) <= 50 &&  Math.abs(yComp-solution.getAttr('y'))<=50){
	                var no1 = xComp-solution.getAttr('x');
	                console.log(no1);
	                var no2 = yComp-solution.getAttr('y');
	                
	                current.setAttr('x',solution.getAttr('x'));
	                current.setAttr('y',solution.getAttr('y'));
	                current.find('Rect')[0].setAttr('stroke','green');
	                stage.draw();
	             	console.log(evt.target.find('Rect')[0]);
	                // disable drag and drop
	                setTimeout(function() {
	                  evt.target.setDraggable(false);
	                }, 50);
	            }
            });

			answerLayer.add(group);
			x += tree.boxWidth;
		}
	
	}
}

