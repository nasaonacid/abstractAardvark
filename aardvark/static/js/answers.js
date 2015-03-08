var stage;
var pageWidth = $("#container").width();
var pageHeight = $(window).height()-200;
var hPadding;
var hierrarchyLayer;

var originalWidth = pageWidth;
var originalHeight = pageHeight;
var current_tree; 
var original_tree;
//instantiation of page size (temporary until dynamic size can be set with divs. Perhaps dynamic redraw)

if(pageWidth == null)
    pageWidth = 1024;
if (pageHeight == null)
    pageHeight = 800;

get_game(1);
function get_game(pk){

    $.getJSON("http://abstractaardvark.pythonanywhere.com/api/games/"+pk+"/")
    .success(function(data){
        current_tree = data;
        console.log(current_tree)
        initStage();
    })
    .error()
    .complete();
}

function updateCopy(){
    original_tree = JSON.parse(JSON.stringify(current_tree));
}

function initStage(){
    stage = new Kinetic.Stage({
        draggable: false,
        height: pageHeight,
        width: pageWidth,
        container: 'container' 
    });
    hierrarchyLayer = new Kinetic.Layer();

    createHierrarchy(current_tree);
    console.log(current_tree)
    drawHierrarchy(current_tree.root);

    stage.add(hierrarchyLayer);
}

function createHierrarchy(tree){
    var depth = tree.height; //get tree depth
    if(depth!=null && depth>0){//if not empty
        hPadding = pageHeight/(2*(depth+1));//calculate horizontal padding
        var boxHeight = hPadding //calculate width and height for boxes
        var boxWidth = pageWidth/(2*tree.max_width)+1;
        tree.boxHeight = boxHeight;
        tree.boxWidth = boxWidth;
        var y = hPadding;
        var level_dict = levelCount(tree.root);
        var level_references = [];
        //level references will keep track of the current position of x and y when iterating through the process list to ensure all items are processed
        for(i = 0; i<level_dict.length;i++){
            wp = wPadding(level_dict[i],boxWidth);

            level_references.push({'x':wp, 'y':y,
                'wPadding':wp});
            y += hPadding*2;
        }

        var process_list = [];
        process_list.push(tree.root);
        while (process_list.length>0){
            current = process_list.pop();
            current.x = level_references[current.level].x;
            current.y = level_references[current.level].y;
            level_references[current.level].x += level_references[current.level].wPadding + boxWidth;
            for(i = current.children.length-1 ; i >=0; i--){
                process_list.push(current.children[i]);
            } 
        }
    }
    else
        console.log("empty tree error");
}


function drawHierrarchy(node){
    process_list = [];
    process_list.push(node);
    while(process_list.length>0){
        current = process_list.pop();
        console.log(current)
        var group = drawAnswerGroup(current.content,current.x,current.y,current.wPadding);
    
        for (i = 0; i<current.children.length; i++){
            group.add(drawArrow(current,current.children[i]));
            process_list.push(current.children[i]);
        }

        hierrarchyLayer.add(group)
    }


}



//draws the slot for each box

function drawNode(node){
    // var layer = new Kinetic.Layer();

    var slot = new Kinetic.Rect({
        x: node.x,
        y: node.y,
        height: current_tree.boxHeight,
        width: current_tree.boxWidth,
        fill: 'rgba(255,255,255,1)',
        stroke:'black',
        // id: id,
        strokeWidth: 1
    });
    // interimSolution.push({id:[x,y]});
    return slot;

    // stage.add(layer);
}


function drawArrow(node, child){
    var boxHeight = current_tree.boxHeight;
    var boxWidth = current_tree.boxWidth;
    var layer = new Kinetic.Layer();
    var arrowHead = new Kinetic.RegularPolygon({
        sides: 3,
        x: 0 + boxWidth/2,
        y: 0 + boxHeight + 7,
        radius: 7,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1
    });
    var arrowLine = new Kinetic.Line({
        points: [arrowHead.getAttr('x'),arrowHead.getAttr('y'),arrowHead.getAttr('x'),arrowHead.getAttr('y') + boxHeight/2, child.x-node.x + boxWidth/2, arrowHead.getAttr('y') + boxHeight/2, child.x-node.x + boxWidth/2, child.y-node.y],
        stroke: 'black'
    });
    var group = new Kinetic.Group();

    group.add(arrowLine);
    group.add(arrowHead);


    return group;
}


/*
 below counts the nodes at each level and returns an array where each
 index is a level in the tree with the value being the amount of nodes
 this is used in the calculation of width padding at each level
*/
function drawAnswerGroup( answer, x , y, wpad){
        node = {'x':0, 'y':0};
        var rect = drawNode(node);
        // console.log(rect);
        var text = new Kinetic.Text({
            align: "center",
            x: 0,
            y: 3,
            height: current_tree.boxHeight,
            width: current_tree.boxWidth,
            text: answer,
            fontSize: 10,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        var line = new Kinetic.Line({
            points: [0,18,current_tree.boxWidth,18],
            stroke: 'black',
            strokeWidth: 1
        });
        var group = new Kinetic.Group({
            draggable: false,
            x: x,
            y: y,
        });
        group.add(rect);
        group.add(text);
        group.add(line);

        return group;
}

function levelCount(node){
    var level_dict = [];
    var process_list = [];
    process_list.push(node);
    while(process_list.length>0){
        var current = process_list.pop();
        if (level_dict.length < (current.level) +1){
            level_dict[current.level] = 0;
        }
        level_dict[current.level]++;
        for (var i = 0; i < current.children.length; i++) {
            process_list.push(current.children[i])
        };
    }
    return level_dict;
}
     

//returns the width padding for each level 
function wPadding(level_width,node_width){
    return (pageWidth-(node_width*level_width)) / (level_width+1);
}


function adjustments(){
    pageWidth = $('#container').width();
    pageHeight = $(window).height()-100;
    var xRatio = pageWidth/originalWidth;
    var yRatio = pageHeight/originalHeight;

    stage.setAttr('width',pageWidth);
    stage.setAttr('height',pageHeight);
    
    stage.setScaleX(xRatio);
    stage.setScaleY(yRatio);
    stage.draw();

}
