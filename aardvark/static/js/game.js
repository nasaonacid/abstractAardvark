var stage;

var hPadding;
var hierrarchyLayer;
var answerLayer;
var continueLayer;
var filterLayer;
var current_tree; 
var current_difficulty;

var stageWidth = $("#container").width();
var stageHeight = $(window).height()-150;
var originalWidth = stageWidth;
var originalHeight = stageHeight;

var csrftoken = getCookie('csrftoken');

//instantiation of page size (temporary until dynamic size can be set with divs. Perhaps dynamic redraw)

if(stageWidth == null)
    stageWidth = 1024;
if (stageHeight == null)
    stageHeight = 800;

get_game('easy');
function get_game(difficulty){
    current_difficulty = difficulty;
    $.getJSON("http://127.0.0.1:8000/api/games/start/"+current_difficulty+"/")
    .success(function(data){

        current_tree = data;
        initStage(false);
    })
    .error(function(jqXHR, status , errorThrown){
                    console.log(jqXHR);
                    console.log(status);
                    console.log(errorThrown);
                    code = jqXHR.status
                    if (code == 404){
                        initStage(true)
                    } 
                })
    .complete();
}


function initStage(error){
    stage = new Kinetic.Stage({
        draggable: false,
        height: stageHeight,
        width: stageWidth,
        container: 'container' 
    });
    originalHeight = stageHeight;
    originalWidth = stageWidth;
    hierrarchyLayer = new Kinetic.Layer();
    answerLayer = new Kinetic.Layer();
    continueLayer = new Kinetic.Layer();
    filterLayer = new Kinetic.Layer({opacity: 0});
    filterLayer.add(new Kinetic.Rect({
        fill: 'black',
        width: stageWidth,
        height: stageHeight,
        visible: false
    }));
    if (error != true){
        createHierrarchy(current_tree);

        drawHierrarchy(current_tree.root);
        drawAnswers(current_tree.answers);
    }
    else{
        errorBox = drawMessageBox(stageWidth/4, stageHeight/4, "No trees left of this difficulty!\n Why not try another?")
        continueLayer.add(errorBox)
    }


    stage.add(hierrarchyLayer);
    stage.add(answerLayer);
    stage.add(filterLayer);
    stage.add(continueLayer);
}

function createHierrarchy(tree){
    var depth = tree.height; //get tree depth
    if(depth!=null && depth>0){//if not empty
        hPadding = stageHeight/(2*(depth+1));//calculate horizontal padding
        var boxHeight = hPadding //calculate width and height for boxes
        var boxWidth = stageWidth/(2*tree.max_width)+1;
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
    else{
        console.log("empty tree error");
    }
}


function drawHierrarchy(node){
    process_list = [];
    process_list.push(node);
    while(process_list.length>0){
        current = process_list.pop();
        var group = new Kinetic.Group({
            draggable: false,
            x: current.x,
            y: current.y,
        });

        group.add(drawNode({'x':0, 'y':0}));
    
        for (i = 0; i<current.children.length; i++){
            group.add(drawArrow(current,current.children[i]));
            process_list.push(current.children[i]);
        }
        group.on('mouseover touchstart', function(evt) {
            highlight(evt, 'orange',3);
        });
        // when the mouse leaves the box, unhighlight the box
        group.on('mouseout touchend', function(evt) {
            highlight(evt, 'black',1);
        });
        hierrarchyLayer.add(group)
    }
    var complexText = new Kinetic.Text({
        x: stageWidth*0.8,
        y: 0,
        text: 'Score: ' + current_tree.score,
        fontStyle: 'bold',
        fontSize: fontSize(),
        fontFamily: 'Arial',
        fill: '#555',
        width: 380,
        padding: 20,
        align: 'center'
    });
    complexText.offsetX(complexText.width()/2);

    hierrarchyLayer.add(complexText);

}

function highlight(evt, colour, width){
    parent = evt.target.parent;
    parent.moveToTop();
    for (var i =parent.children.length - 1; i >= 0; i--) {

        if (parent.children[i].nodeType == "Group"){
            for (var j = parent.children[i].children.length - 1; j >= 0; j--) {
                parent.children[i].children[j].setAttr('stroke',colour);
                parent.children[i].children[j].setAttr('strokeWidth', width);
            };

        }
        else{
            parent.children[i].setAttr('stroke',colour);
            parent.children[i].setAttr('strokeWidth', width);
        }
    }
    hierrarchyLayer.draw();
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

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function drawAnswers(answers){

    //set the x and y coordinates so that we start at the lowest area. 

    var y = hPadding*((current_tree.height*2)+0.5);

    wpad= stageWidth/(answers.length+1)
    var x = wpad/2;
    //create a grouping of rectangle, text and a line to make a uml box answer
    for (i = 0; i<answers.length;i++){
        var group = drawAnswerGroup(answers[i],x,y,wpad);

        mouseover(group);
        mouseout(group);
        dragstart(group);
        dragend(group);

        answerLayer.add(group);
        x += wpad;
    }
}

function validDrop(evt){
    evt.target.find('Rect')[0].setAttr('stroke','green');
    evt.target.find('Rect')[0].setAttr('fill', 'green');
    evt.target.find('Rect')[0].setAttr('strokeWidth',3);
    //console.log(evt.target.find('Rect')[0])
}

function invalidDrop(evt){
    //console.log("hello invalid")
    evt.target.find('Rect')[0].setAttr('stroke','red');
    evt.target.find('Rect')[0].setAttr('fill','red');
    evt.target.find('Rect')[0].setAttr('strokeWidth',3);
    //console.log(evt.target.find('Rect')[0])


}

function clearDrop(evt){
    evt.target.find('Rect')[0].setAttr('stroke','black');
    evt.target.find('Rect')[0].setAttr('fill','white');

    evt.target.find('Rect')[0].setAttr('strokeWidth',1);
}

/*
    checks a sucessful post to see if the posted answer was correct or not. 
    Currently only valid for posts of data to correct tree.
*/
function processPostSucess(data, content){
    data_list = [];
    current_list = [];
    //console.log(typeof(data.root.complete))
    if(data.root.complete){
        //console.log("Complete");
        drawContinue();

    }
    data_list.push(data.root);
    current_list.push(current_tree.root)
    while (data_list.length >0){
        currentNode = current_list.pop();
        dataNode = data_list.pop();

        currentNode.correct = dataNode.correct

        for( i = 0; i<dataNode.children.length; i++){
            data_list.push(dataNode.children[i]);
            current_list.push(currentNode.children[i]);
        }
    }
}

function drawContinue(){
    //console.log("drawContinue")
    var x = (originalWidth/4);
    var y = (originalHeight/4);
    var message = 'Congratulations!\n Do you wish to continue?'
    //console.log(message)
    var messageBox = drawMessageBox(x,y, message);
    var continueButton = drawButton((x + (originalWidth/10)*3.5),(y+((originalHeight/10)*3.5)),"continue")
    var quitButton = drawButton((x + (originalWidth/10)*0.5),(y+((originalHeight/10)*3.5)),"quit")
    
    continueButton.on('click', function(){
        get_game(current_difficulty);
    })

    quitButton.on('click', function(){
        continueLayer.clear()
    })
    continueLayer.add(messageBox)
    continueLayer.add(continueButton)
    continueLayer.add(quitButton)

    filterLayer.setAttr('opacity',0.5)
    filterLayer.children[0].setAttr('visible', true)
    stage.draw()
    // continueLayer.add(continue)
    // continueLayer.add(quit)

}

function drawMessageBox(x,y, text){
    //console.log("drawMessageBox" + text)
    var group = new Kinetic.Group({
        draggable: false,
        x: x,
        y: y
    });

    var rect = new Kinetic.Rect({
        x: 0,
        y:0,
        height: originalHeight/2,
        width: originalWidth/2,
        fill: 'rgba(255,255,255,1)',
        stroke:'black',
        strokeWidth: 1
    })
    //console.log("here " + group.getAttr('x') + "\n" + originalWidth + "\n" + (group.getAttr('x')+((originalWidth/2)/2)))
    var complexText = new Kinetic.Text({
        x: (group.getAttr('x')) ,
        y: 0,
        text: text,
        fontSize: fontSize()*2,
        fontFamily: 'Arial',
        fill: '#555',
        width: stageWidth/2,
        padding: 10,
        align: 'center'
    });
    complexText.offsetX(complexText.width()/2);
    group.add(rect);
    group.add(complexText);
    return group;
}

function drawButton(x,y, text){

    //stageheight calculation is the 
    var group = new Kinetic.Group({
        draggable: false,
        x: x,
        y:y
    })
    var rect = new Kinetic.Rect({
        x:0,
        y:0,
        height: originalHeight/10,
        width: originalWidth/10,
        strokeWidth: 1,
        fill: 'rgba(255,255,255,1)',
        stroke: "black"
    });
    var content = new Kinetic.Text({
        align: "center",
        x: 0,
        y: 0,
        text: text,
        fontSize: fontSize(),
        fontFamily: 'Arial',
        fill: 'black',
        padding: 6
    });
    group.add(rect);
    group.add(content);
    mouseover(group);
    mouseout(group);
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
        // //console.log(rect);
        var text = new Kinetic.Text({
            align: "center",
            x: 0,
            y: 3,
            height: current_tree.boxHeight,
            width: current_tree.boxWidth,
            text: answer,
            fontSize: fontSize(),
            fontFamily: 'Arial',
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
                var scaledWidth = current_tree.boxWidth*(stageWidth/originalWidth)
                var scaledHeight = current_tree.boxHeight*(stageHeight/originalHeight)
                if(pos.x < 0)
                    newX = 0;
                if(pos.x+scaledWidth>stageWidth)
                    newX = stageWidth-scaledWidth;
                if(pos.y < 0)
                    newY = 0;
                if(pos.y+scaledHeight>stageHeight)
                    newY = stageHeight - scaledHeight;
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
    // //console.log("--------------------------------------")
    var x = item.getAttr('x');
    var y = item.getAttr('y');
    var dropX = current_tree.boxWidth / 2
    var dropY = current_tree.boxHeight / 2
    var node = current_tree.root;
    var process_list = [];
    process_list.push(node);

    while(process_list.length>0){
        current = process_list.pop();

        if(Math.abs(x - current.x) <= dropX && Math.abs(y-current.y)<= dropY){


            if( current.correct== null){

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
    return (stageWidth-(node_width*level_width)) / (level_width+1);
}


function adjustments(){
    stageWidth = $('#container').width();
    stageHeight = $(window).height()-150;
    var xRatio = stageWidth/originalWidth;
    var yRatio = stageHeight/originalHeight;

    console.log(xRatio)
    console.log(yRatio)
    stage.setAttr('width',stageWidth);
    stage.setAttr('height',stageHeight);
    
    stage.setScaleX(xRatio);
    stage.setScaleY(yRatio);
    stage.draw();

}


function check_all(){

    for (var i = 0; i < answerLayer.children.length; i++) {
        if (answerLayer.children[i].currentMatch!= undefined){

            if (answerLayer.children[i].currentMatch.correct !=true){
                //console.log(answerLayer.children[i].children[0])
                answerLayer.children[i].setAttr('draggable',true);
                answerLayer.children[i].children[0].setAttr('stroke','#910000');
                answerLayer.children[i].children[0].setAttr('strokeWidth',3);
                answerLayer.children[i].children[0].setAttr('fill','#D41C1C');

            }
            else if (answerLayer.children[i].currentMatch.correct == true){
                answerLayer.children[i].setAttr('draggable',false);
                answerLayer.children[i].children[0].setAttr('stroke','#1E8C2C');
                answerLayer.children[i].children[0].setAttr('strokeWidth',3);
                answerLayer.children[i].children[0].setAttr('fill','5ABE66');
                answerLayer.children[i].off('mouseover touchstart');
                answerLayer.children[i].off('mouseout touchend');
                document.body.style.cursor = 'default';
            }

        }
        stage.draw()
    };

}

function mouseover(group){
    group.on('mouseover touchstart', function(evt) {
        this.moveToTop();
        rect = evt.target.parent.children[0];
        rect.setAttr('strokeWidth',2.5);
        answerLayer.draw();
        document.body.style.cursor = 'pointer';
    });
}

function mouseout(group){
    group.on('mouseout touchend', function(evt) {
        rect = evt.target.parent.children[0];
        rect.setAttr('strokeWidth',1);
        answerLayer.draw();
        document.body.style.cursor = 'default';
    });
}

function dragstart(group){
                // handler for drag event.
    group.on('dragstart', function(evt) {
        this.moveToTop();
        clearDrop(evt);

        if(evt.target.currentMatch!= null){
            x = evt.target.currentMatch.correct;
            evt.target.currentMatch.correct = null;
            evt.target.currentMatch.content = " ";
            evt.target.currentMatch = null;

        }
        stage.draw();
    });

}

function dragend(group){
    group.on('dragend', function(evt) {
        var matched = checkMatch(evt.target);

        if(matched != null){
            evt.target.setAttr('x',matched.x);
            evt.target.setAttr('y',matched.y);

            $.ajaxSetup({
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", csrftoken);
                    }
                }
            });
            $.ajax({
                type: "POST",
                url: "http://127.0.0.1:8000/api/games/start/"+current_tree.pk+"/",
                // url: "http://127.0.0.1:8000/api/games/start/"+20000000+"/",
                data: "json="+JSON.stringify(current_tree),
                success:function(data){

                    // //console.log(data);

                    var status = processPostSucess(data, evt.target.find('Text')[0].getAttr('text'));
                    check_all();
                    stage.draw();
                },
                error: function(jqXHR, status , errorThrown){
                    //console.log(jqXHR);
                    //console.log(status);
                    //console.log(errorThrown);
                    code = jqXHR.status
                    if (code == 404){
                        //console.log("done");
                        $('#lossAlert').addClass('in');
                    } 
                },
                datatype: "json"
            });
        }
    });
}

function fontSize(){
    //console.log(stageWidth)
    if (stageWidth >= 1200) {
        return stageWidth/100
    }
    else if (stageWidth>= 992){
        return (stageWidth/100)*1.3
    }
    else if (stageWidth>= 768){
        return (stageWidth/100)*1.6
    }
    else {
        return (stageWidth/100)*2
    }
}