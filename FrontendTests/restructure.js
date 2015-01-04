/*
	Restructured tree generation and validation code. 
*/

//declaration of global variables 
var stage;
var pageWidth = $("#container").width();
var pageHeight = $(window).height();
var hPadding;
var hierrarchyLayer = new Kinetic.Layer();
var arrowLayer = new Kinetic.Layer();
var answerLayer = new Kinetic.Layer();

var originalWidth = pageWidth;
var originalHeight = pageHeight;

//instantiation of page size (temporary until dynamic size can be set with divs. Perhaps dynamic redraw)

if(pageWidth == null)
	pageWidth = 1024;
if (pageHeight == null)
	pageHeight = 800;

console.log(pageHeight);
console.log(pageWidth);

//tree creation 
var tree = makeTree();
console.log(tree);
tree.completion = 0;
console.log("completion init" + tree.completion);

initStage();
/*
	function to initialise the canvas for the tree structure as well as to call functions 
	which assign x,y coords to tree elements and then draw the over arching tree structure and answers. 
*/
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
	console.log("Finished");


}

/*
	Function calculates the x and y coords of every node in the tree and adds it to the node in the tree structure.
	It also calculates the vertical and horizontal paddings as well as the node representation height and width. 

	
	Vertical padding = total page height divided by the total tree depth * 2 + 1
	Horizontal Padding = the total page width - boxwidth * level width all divided by the tree width + 1

*/
function createHierrarchy(tree){
	var depth = tree.depth; //get tree depth
	if(depth!=null && depth>0){//if not empty
		hPadding = pageHeight/(depth*2 + 1);//calculate horizontal padding
		var boxHeight = (pageHeight - (hPadding * (depth + 2)))/depth;//calculate width and height for boxes
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

//returns the width padding for each level 
function wPadding(treeWidth,slotWidth){
	return ((pageWidth-(slotWidth*treeWidth))/(treeWidth+1));
}

//draws the tree structure
function drawHierrarchy(tree){
	for (i = 0; i < tree.depth; i++){
		for (j = 0; j <tree.contents[i].length; j++){
			hierrarchyLayer.add(drawSlot(tree.contents[i][j].x,tree.contents[i][j].y, tree.boxWidth, tree.boxHeight,tree.contents[i][j].content));
		}
	
	}
}


//draws the slot for each box

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


//sorts through each layer of the tree and draws the connections between each node. 
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


/*
	Draws the arrows between nodes on the tree. The line is made by
	getting the x and y coords for the arrowhead and for the second one. 
*/

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

/*
	Creates a movable grouping of the box outline 
*/

function drawAnswers(tree){

	//set the x and y coordinates so that we start at the lowest area. 
	var x = 0
	var y = hPadding*tree.depth*2;
	
	//create a grouping of rectangle, text and a line to make a uml box answer
	for (i = 0; i < tree.depth; i++){
		for (j = 0; j <tree.contents[i].length; j++){
			var rect = drawSlot(0,0, tree.boxWidth, tree.boxHeight,tree.contents[i][j].content);
			var text = new Kinetic.Text({
				align: "center",
				x: 0,
				y: 3,
				height: tree.boxHeight,
				width: tree.boxWidth,
				text: tree.contents[i][j].content,
		        fontSize: 15,
		        fontFamily: 'Calibri',
		        fill: 'black'
// tree.contents[i][j].content
			});
			var line = new Kinetic.Line({
				points: [0,18,tree.boxWidth,18],
				stroke: 'black',
				strokeWidth: 1
			});
			var group = new Kinetic.Group({
				draggable: true,
				x: x,
				y: y,
				dragBoundFunc: function(pos) {
		            var newX = pos.x;
		            var newY = pos.y;
		            if(pos.x < 0)
		            	newX = 0;
		            if(pos.x+tree.boxWidth>pageWidth)
		            	newX = pageWidth-tree.boxWidth;
		            if(pos.y < 0)
		            	newY = 0;
		            if(pos.y+tree.boxHeight>pageHeight)
		            	newY = pageHeight - tree.boxHeight;


		             
		            return {
		            	x: newX,
		            	y: newY
		            };
		        }
			});
			group.add(rect);
			group.add(text);
			group.add(line);

			//on mouse over a box highlight the box
			group.on('mouseover touchstart', function(evt) {
              evt.target.strokeWidth(2);
              answerLayer.draw();
              document.body.style.cursor = 'pointer';
            });
            // when the mouse leaves the box, unhighlight the box
            group.on('mouseout touchend', function(evt) {
              evt.target.strokeWidth(1);
              hierrarchyLayer.draw();
              document.body.style.cursor = 'default';
            });

            //handler for drag event.
            group.on('dragstart', function(evt) {
              	this.moveToTop();
              	var closestMatch = checkDrop(evt.target);
              	if(closestMatch != null){
              		if(tree.contents[closestMatch.i][closestMatch.j].correctMap!=true)
              			tree.contents[closestMatch.i][closestMatch.j].matched = false;
              	}
             	stage.draw();
            });

            //hnaadler for drag drop event
            group.on('dragend', function(evt) {
        		var closestMatch = checkDrop(evt.target);

        		console.log("what up dawg "+ closestMatch);
        		if(closestMatch != null){
	        		closestMatch.x = tree.contents[closestMatch.i][closestMatch.j].x;
	        		closestMatch.y = tree.contents[closestMatch.i][closestMatch.j].y;

					
					console.log(tree.contents[closestMatch.i][closestMatch.j].matched);
        			if(tree.contents[closestMatch.i][closestMatch.j].matched == false){	
        				console.log("ITS A MATCH");
	    				evt.target.setAttr('x',closestMatch.x);
	    				evt.target.setAttr('y',closestMatch.y);
        				tree.contents[closestMatch.i][closestMatch.j].matched = true;
        				if (evt.target.find('Rect')[0].getAttr('id') == tree.contents[closestMatch.i][closestMatch.j].content ){
        					
        					tree.contents[closestMatch.i][closestMatch.j].correctMap = true;
        					tree.completion++;
        					console.log("number to completion = "+ (tree.totalSize - tree.completion));
        					evt.target.find('Rect')[0].setAttr('stroke','green');
        					stage.draw();


			                // disable drag and drop
			                setTimeout(function() {
			                  evt.target.setDraggable(false);
			                }, 50);
        				}
        				else{
        					evt.target.find('Rect')[0].setAttr('stroke','red');
        					stage.draw();
        				}
        			}
        		}
            });

			answerLayer.add(group);
			x += tree.boxWidth;
		}
	
	}
}

function checkDrop(item){
	var x = item.getAttr('x');
	var y = item.getAttr('y');

	for (i = 0; i <tree.depth; i++){
		for(j=0;j<tree.contents[i].length;j++){
			var currentX = tree.contents[i][j].x;
			var currentY = tree.contents[i][j].y;
			if(Math.abs(x - currentX) <= 50 && Math.abs(y-currentY)<=50){
				return {i:i, j:j};
			}
			
		}
	}
	return null;
}

function adjustments(){
	console.log("DO YOU WANNA BUILD A SNOWMAN?");
	pageWidth = $(window).width();
	pageHeight = $(window).height();
	var xRatio = pageWidth/originalWidth;
	var yRatio = pageHeight/originalHeight;
	console.log(originalHeight);
	console.log(xRatio);
	console.log(yRatio);
	
	console.log(pageHeight);

	stage.setAttr('width',pageWidth);
	stage.setAttr('height',pageHeight);
	
	stage.setScaleX(xRatio);
	stage.setScaleY(yRatio);
	stage.draw();

}
