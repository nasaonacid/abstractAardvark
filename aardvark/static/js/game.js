var stage;
var pageWidth = $("#container").width();
var pageHeight = $(window).height();
var hPadding;
var hierrarchyLayer = new Kinetic.Layer();
var answerLayer = new Kinetic.Layer();

var originalWidth = pageWidth;
var originalHeight = pageHeight;
var current_tree; 
var original_tree;
//instantiation of page size (temporary until dynamic size can be set with divs. Perhaps dynamic redraw)

if(pageWidth == null)
    pageWidth = 1024;
if (pageHeight == null)
    pageHeight = 800;

get_game();
function get_game(){
    $.getJSON("http://127.0.0.1:8000/api/games/start/hard/",function(data){
        current_tree = data;
        initStage();
    });
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

    createHierrarchy(current_tree);
    updateCopy();

    drawHierrarchy(current_tree.root);
    drawAnswers(current_tree.answers);

    stage.add(hierrarchyLayer);
    stage.add(answerLayer);
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
        hierrarchyLayer.add(drawNode(current));

        for (i = 0; i<current.children.length; i++){
            hierrarchyLayer.add(drawArrow(current,current.children[i]));
            process_list.push(current.children[i]);
        }
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
        x: node.x + boxWidth/2,
        y: node.y + boxHeight + 7,
        radius: 7,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 1
    });
    var arrowLine = new Kinetic.Line({
        points: [arrowHead.getAttr('x'),arrowHead.getAttr('y'),arrowHead.getAttr('x'),arrowHead.getAttr('y') + boxHeight/2, child.x + boxWidth/2, arrowHead.getAttr('y') + boxHeight/2, child.x + boxWidth/2, child.y],
        stroke: 'black'
    });
    var group = new Kinetic.Group();

    group.add(arrowLine);
    group.add(arrowHead);
    group.on('mouseover touchstart', function(evt) {
        this.moveToTop();
        evt.target.stroke('red');
        hierrarchyLayer.draw();
    });
    // when the mouse leaves the box, unhighlight the box
    group.on('mouseout touchend', function(evt) {
        evt.target.stroke('black');
        hierrarchyLayer.draw();
    });

    return group;
}

function drawAnswers(answers){

    //set the x and y coordinates so that we start at the lowest area. 
    var x = 0
    var y = hPadding*current_tree.height*2;

    wpad= pageWidth/(answers.length)
    //create a grouping of rectangle, text and a line to make a uml box answer
    for (i = 0; i<answers.length;i++){
        var group = drawAnswerGroup(answers[i],x,y,wpad);


        // on mouse over a box highlight the box
        group.on('mouseover touchstart', function(evt) {

            evt.target.strokeWidth(2);
            hierrarchyLayer.draw();
            document.body.style.cursor = 'pointer';
        });
        // when the mouse leaves the box, unhighlight the box
        group.on('mouseout touchend', function(evt) {
            evt.target.strokeWidth(1);
            hierrarchyLayer.draw();
            document.body.style.cursor = 'default';
        });

            // handler for drag event.
        group.on('dragstart', function(evt) {
            this.moveToTop();
            clearDrop(evt);
            // console.log("------------------drag start--------------------")
            // console.log(evt.target)
            if(evt.target.currentMatch!= null){
                x = evt.target.currentMatch.correct;
                evt.target.currentMatch.correct = null;
                evt.target.currentMatch.content = " ";
                evt.target.currentMatch = null;

            }
            stage.draw();
        });

        //hnaadler for drag drop event
        group.on('dragend', function(evt) {
            var matched = checkMatch(evt.target);

            if(matched != null){
                evt.target.setAttr('x',matched.x);
                evt.target.setAttr('y',matched.y);
                updateCopy();
                $.ajax({
                    type: "POST",
                    url: "http://127.0.0.1:8000/api/games/start/"+current_tree.pk+"/",
                    data: "json="+JSON.stringify(current_tree),
                    success:function(data){
                        console.log(data);
                        var status = processPostSucess(data, evt.target.find('Text')[0].getAttr('text'));
                        if(status == true){
                            validDrop(evt);
                            setTimeout(function() {
                                  evt.target.setDraggable(false);
                            }, 50);
                        }
                        else{
                            invalidDrop(evt);
                        }
                        stage.draw();
                    },
                    error: function(data,status,errorThrown){
                        console.log(data.responseJSON);
                        console.log(status);
                        console.log(errorThrown);
                    },
                    datatype: "json"
                });
            }


        });

        answerLayer.add(group);
        x += wpad;
    }
}

function validDrop(evt){
    evt.target.find('Rect')[0].setAttr('stroke','green');
    evt.target.find('Rect')[0].setAttr('strokeWidth',3);
}

function invalidDrop(evt){
    evt.target.find('Rect')[0].setAttr('stroke','red');
    evt.target.find('Rect')[0].setAttr('strokeWidth',3);
}

function clearDrop(evt){
    evt.target.find('Rect')[0].setAttr('stroke','black');
    evt.target.find('Rect')[0].setAttr('strokeWidth',1);
}

/*
    checks a sucessful post to see if the posted answer was correct or not. 
    Currently only valid for posts of data to correct tree.
*/
function processPostSucess(data, content){
    data_list = [];
    current_list = [];
    data_list.push(data.root);
    current_list.push(current_tree.root)
    while (data_list.length >0){
        currentNode = current_list.pop();
        dataNode = data_list.pop();
        if(dataNode.content == content){
            console.log(dataNode.correct);
            if (dataNode.correct == true){
                currentNode.correct = true; 
                return true;
            }
            else{
                currentNode.correct = false;
                return false
            }
        }
        for( i = 0; i<dataNode.children.length; i++){
            data_list.push(dataNode.children[i]);
            current_list.push(currentNode.children[i]);
        }
    }
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
            fontSize: 15,
            fontFamily: 'Calibri',
            fill: 'black'
        });
        var line = new Kinetic.Line({
            points: [0,18,current_tree.boxWidth,18],
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
                if(pos.x+current_tree.boxWidth>pageWidth)
                    newX = pageWidth-current_tree.boxWidth;
                if(pos.y < 0)
                    newY = 0;
                if(pos.y+current_tree.boxHeight>pageHeight)
                    newY = pageHeight - current_tree.boxHeight;
                return {
                    x: newX,
                    y: newY
                };
            }
        });
        group.add(rect);
        group.add(text);
        group.add(line);
        group.currentMatch = null;
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

function checkMatch(item){
    // console.log("--------------------------------------")
    var x = item.getAttr('x');
    var y = item.getAttr('y');
    var node = current_tree.root;
    var process_list = [];
    process_list.push(node);
    // console.log(current_tree);
    // console.log(item);
    while(process_list.length>0){
        current = process_list.pop();
        // console.log("x : "+current.x + " == "+ x);
        // console.log("y : "+current.y + " == "+ y);

        if(Math.abs(x - current.x) <= 50 && Math.abs(y-current.y)<=50){

            if( typeof(current.correct)=="undefined" | current.correct===null){
                console.log("Match");
                console.log(current);
                console.log(current.correct)
                console.log(item);

                updateCopy();
                item.currentMatch = current;

                current.content = item.find('Text')[0].getAttr('text');
                return {'x':current.x, 'y':current.y};
            }
        }
        for(i = 0; i<current.children.length; i++){
            process_list.push(current.children[i]);
        }
    }
    return null; 

    
}
//returns the width padding for each level 
function wPadding(level_width,node_width){
    return (pageWidth-(node_width*level_width)) / (level_width+1);
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
