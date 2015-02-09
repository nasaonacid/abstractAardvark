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

function initStage(){
    stage = new Kinetic.Stage({
        draggable: false,
        height: pageHeight,
        width: pageWidth,
        container: 'container' 
    });
    console.log(current_tree);
    console.log(JSON.stringify(current_tree));
    original_tree = JSON.parse(JSON.stringify(current_tree))
    createHierrarchy(current_tree);
    drawHierrarchy(current_tree.root);
    // // console.log(interimSolution);
    // drawConnections(tree);
    drawAnswers(current_tree.answers);
    // stage.add(arrowLayer);
    // console.log(stage);
    stage.add(hierrarchyLayer);
    stage.add(answerLayer);
    // console.log(hierrarchyLayer.find('#object'));
    // console.log("Finished");
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
        console.log(tree.root);
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
        console.log(tree)
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
        node = {'x':x, 'y':y};
        var rect = drawNode(node);
        // console.log(rect);
        var text = new Kinetic.Text({
            align: "center",
            x: 0,
            y: 3,
            height: current_tree.boxHeight,
            width: current_tree.boxWidth,
            text: answers[i],
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

        //on mouse over a box highlight the box
        // group.on('mouseover touchstart', function(evt) {
        //   evt.target.strokeWidth(2);
        //   answerLayer.draw();
        //   document.body.style.cursor = 'pointer';
        // });
        // // when the mouse leaves the box, unhighlight the box
        // group.on('mouseout touchend', function(evt) {
        //   evt.target.strokeWidth(1);
        //   hierrarchyLayer.draw();
        //   document.body.style.cursor = 'default';
        // });

            //handler for drag event.
        // group.on('dragstart', function(evt) {
        //     this.moveToTop();
        //     var closestMatch = checkDrop(evt.target);
        //     if(closestMatch != null){
        //         if(tree.contents[closestMatch.i][closestMatch.j].correctMap!=true)
        //             tree.contents[closestMatch.i][closestMatch.j].matched = false;
        //     }
        //     stage.draw();
        // });

        // //hnaadler for drag drop event
        // group.on('dragend', function(evt) {
        //     var closestMatch = checkDrop(evt.target);

        //     console.log("what up dawg "+ closestMatch);
        //     if(closestMatch != null){
        //         closestMatch.x = tree.contents[closestMatch.i][closestMatch.j].x;
        //         closestMatch.y = tree.contents[closestMatch.i][closestMatch.j].y;

                
        //         console.log(tree.contents[closestMatch.i][closestMatch.j].matched);
        //         if(tree.contents[closestMatch.i][closestMatch.j].matched == false){ 
        //             console.log("ITS A MATCH");
        //             evt.target.setAttr('x',closestMatch.x);
        //             evt.target.setAttr('y',closestMatch.y);
        //             tree.contents[closestMatch.i][closestMatch.j].matched = true;
        //             if (evt.target.find('Rect')[0].getAttr('id') == tree.contents[closestMatch.i][closestMatch.j].content ){
                        
        //                 tree.contents[closestMatch.i][closestMatch.j].correctMap = true;
        //                 tree.completion++;
        //                 console.log("number to completion = "+ (tree.totalSize - tree.completion));
        //                 evt.target.find('Rect')[0].setAttr('stroke','green');
        //                 stage.draw();


        //                 // disable drag and drop
        //                 setTimeout(function() {
        //                   evt.target.setDraggable(false);
        //                 }, 50);
        //             }
        //             else{
        //                 evt.target.find('Rect')[0].setAttr('stroke','red');
        //                 stage.draw();
        //             }
        //         }
        //     }
        // });

        answerLayer.add(group);
        x += current_tree.boxWidth;
    }
}

/*
 below counts the nodes at each level and returns an array where each
 index is a level in the tree with the value being the amount of nodes
 this is used in the calculation of width padding at each level
*/
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