var stage;

var hPadding;
var hierrarchyLayer;
var answerLayer;
var continueLayer;
var filterLayer;
var optionLayer;
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

/*
    function which sends the request off to the server for the game data. 
*/
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



/*
    function which sets up all required materials and initialises the game
*/
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
    optionLayer = new Kinetic.Layer();
    drawOptions()
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
        var errorBox = drawMessageBox(stageWidth/4, stageHeight/4, "No trees left of this difficulty!\n Why not try another?")
        continueLayer.add(errorBox)
    }


    stage.add(hierrarchyLayer);
    stage.add(answerLayer);
    stage.add(optionLayer);
    stage.add(filterLayer);
    stage.add(continueLayer);
}


function drawTitle(){

}


/*
    function which processes the json data and assigns the relevant
    x and y coordinates to everynode in the tree

*/
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


/*
    function processes nodes within the json structure and draws each to the hierrarchy layer on the stage
*/
function drawHierrarchy(node){
    var process_list = [];
    process_list.push(node);
    while(process_list.length>0){
        var current = process_list.pop();
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


}

/*
    function which controls the highlighting for nodes within a tree
*/
function highlight(evt, colour, width){
    var parent = evt.target.parent;
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

function drawOptions(){

    var radius = stageHeight/50
    console.log(radius)
    var colours = [{"inner":"#C4B7F1", "outer":"#4429A1", "id":"easy"},
                    {"inner":"#FFEE8F","outer":"#E9CC25", "id": "medium"},
                     {"inner":"#FF948F","outer":"#E92F25", "id": "hard"}]
    var diff = ["E","M","H"]

    var x = stageWidth*0.46
    var y = 20
    var toggles = []
    for (var i = 0; i < colours.length; i++) {
        toggles.push(drawToggles(x,y,radius,colours[i].inner,colours[i].outer, diff[i], colours[i].id));
        x += radius*3
    };
    toggles[0].setAttr("siblings",[toggles[1],toggles[2]]);
    toggles[1].setAttr("siblings",[toggles[0],toggles[2]]);
    toggles[2].setAttr("siblings",[toggles[0],toggles[1]]);
    for (var i = 0; i < toggles.length; i++) {
        optionLayer.add(toggles[i])
    };
    optionLayer.add(drawScore())

}

function drawToggles(x,y,radius, inner, outer, letter, id){

    var group = new Kinetic.Group({
        id: id,
        draggable: false,
        x: x,
        y: y,
        height: radius*2,
        width: radius*2
    });
    var strokeWidth = 2
    if (id == current_difficulty){
        strokeWidth = 3
    }
    var circle = new Kinetic.Circle({
        x: 0,
        y: 0+radius,
        radius: radius , 
        fill:inner, 
        stroke:outer,
        strokeWidth:strokeWidth 
    })
    var complexText = new Kinetic.Text({
        x: 0,
        y: 0+radius,
        text: letter,
        fontStyle: 'bold',
        fontSize: fontSize(),
        fontFamily: 'Arial',
        fill: '#555',

        align: 'center'
    });
    complexText.offsetX(complexText.width()/2);
    complexText.offsetY(complexText.height()/2)
    group.add(circle)
    group.add(complexText)
    group.siblings = []
    group.on('click', function(){
        if (group.getAttr('id') != current_difficulty){
            console.log(group.getAttr("siblings"))
            for (var i = 0; i < group.siblings.length; i++) {
                group.siblings[i].children[0].setAttr("strokeWidth",1)
            };
            get_game(group.getAttr("id"));
        } 
    
    })
    mouseover(group)
    mouseout(group)
    return group
}
/*
    function to draw the current score
*/
function drawScore(){
    var complexText = new Kinetic.Text({
        x: originalWidth*0.8,
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
    return complexText
}
/*
    function to draw a node given a node object containing x and y coords
*/
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

/*
    function to draw connectors between tree nodes. 
*/
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
    function checks if the http method type doesn't require CSRF token 
*/
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

/*
    function to obtain CSRF token from the site cookies. 
*/

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

/*
    function to draw all the available answers 
*/
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

/*
    function to draw the continue option after the level has been won
*/
function drawContinue(){
    //console.log("drawContinue")
    var x = (originalWidth/4);
    var y = (originalHeight/4);
    var message = 'Congratulations!\n Do you wish to continue?'
    //console.log(message)
    var messageBox = drawMessageBox(x,y, message);
    var continueButton = drawButton((x + (originalWidth/10)*3.5),(y+((originalHeight/10)*3.5)),"continue","#5ABE66", "#1E8C2C")
    var quitButton = drawButton((x + (originalWidth/10)*0.5),(y+((originalHeight/10)*3.5)),"quit","#D41C1C","#910000")
    
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

}

/*
    function to draw a text overlay on the game. Used for completion and tree ends
*/
function drawMessageBox(x,y, text){

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

/*
    draws clickable buttons on the interface for the continue screen
*/
function drawButton(x,y, text, inner, outer){

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
        fill: inner,
        stroke: outer
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
    content.offsetY(-content.height()/2)
    group.add(rect);
    group.add(content);
    mouseover(group);
    mouseout(group);
    return group;

}

/*
    function which creates the answer containing boxes. The function creates and groups 
    a rectangle, text object and vertical line to give the appearance of a UML class diagram box.
    This function also imposes bounds upon the answer objects to ensure these are contained within the 
    stage. 
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

/*
    function to count the amount of nodes at each individual level. Used to calculate the width paddings at
    each level of the tree. 
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

/*
    function that checks to see if the dropped answer matches any free slot. 
    If so it sets the slot to taken and returns the x and y coords for that slot
*/
function checkMatch(item){
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




/*
      function checks all of the answers layer objects that have taken up residence in a
      slot against the newly corrected tree. The answers will then change into a correct or incorrect state
*/
function check_all(){

    for (var i = 0; i < answerLayer.children.length; i++) {
        if (answerLayer.children[i].currentMatch!= undefined){

            if (answerLayer.children[i].currentMatch.correct !=true){

                answerLayer.children[i].setAttr('draggable',true);
                answerLayer.children[i].children[0].setAttr('stroke','#910000');
                answerLayer.children[i].children[0].setAttr('strokeWidth',3);
                answerLayer.children[i].children[0].setAttr('fill','#D41C1C');

            }
            else if (answerLayer.children[i].currentMatch.correct == true){
                answerLayer.children[i].setAttr('draggable',false);
                answerLayer.children[i].children[0].setAttr('stroke','#1E8C2C');
                answerLayer.children[i].children[0].setAttr('strokeWidth',3);
                answerLayer.children[i].children[0].setAttr('fill','#5ABE66');
                console.log(answerLayer.children[i].children[0].getAttr('fill'))
                answerLayer.children[i].off('mouseover touchstart');
                answerLayer.children[i].off('mouseout touchend');
                document.body.style.cursor = 'default';
            }

        }
        stage.draw()
    };

}

/*
    event function to handle if an answer has been put in the correct place 
*/
function validDrop(evt){
    evt.target.find('Rect')[0].setAttr('stroke','green');
    evt.target.find('Rect')[0].setAttr('fill', 'green');
    evt.target.find('Rect')[0].setAttr('strokeWidth',3);
    //console.log(evt.target.find('Rect')[0])
}

/*
    event function to handle if an answer has been put in the wrong place 
*/
function invalidDrop(evt){
    //console.log("hello invalid")
    evt.target.find('Rect')[0].setAttr('stroke','red');
    evt.target.find('Rect')[0].setAttr('fill','red');
    evt.target.find('Rect')[0].setAttr('strokeWidth',3);
    //console.log(evt.target.find('Rect')[0])


}

/*
    event function to handle if an answer is moved from an available slot 
*/
function clearDrop(evt){
    evt.target.find('Rect')[0].setAttr('stroke','black');
    evt.target.find('Rect')[0].setAttr('fill','white');

    evt.target.find('Rect')[0].setAttr('strokeWidth',1);
}

/*
    event function to handle the begining of a mouseover event  
*/
function mouseover(group){
    group.on('mouseover touchstart', function(evt) {
        this.moveToTop();
        console.log(group)
        rect = evt.target.parent.children[0];
        rect.setAttr('strokeWidth',2.5);
        answerLayer.draw();
        document.body.style.cursor = 'pointer';
    });
}

/*
    event function to handle the end of a mouseover 
*/
function mouseout(group){
    group.on('mouseout touchend', function(evt) {
        rect = evt.target.parent.children[0];
        rect.setAttr('strokeWidth',1);
        answerLayer.draw();
        document.body.style.cursor = 'default';
    });
}

/*
    event function to handle the dragging of an object within the canvas
*/
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

/*
    event function to handle the end of an item drag. 
    It checks wether the location dropped to is equal to an empty slot and if
    so then it processes the new move
*/
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


/*
    Function to scale font sizes to the various viewport widths
*/
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
/*
    function which listens out for any resizing of the window and scales the stage for that new size
*/

function adjustments(){
    stageWidth = $('#container').width();
    stageHeight = $(window).height()-150;
    var xRatio = stageWidth/originalWidth;
    var yRatio = stageHeight/originalHeight;

    console.log(stageWidth)

    stage.setAttr('width',stageWidth);
    stage.setAttr('height',stageHeight);
    
    stage.setScaleX(xRatio);
    stage.setScaleY(yRatio);
    stage.draw();

}