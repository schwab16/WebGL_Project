// Isaac Schwab
// schw1643@umn.edu

// ********************************************************************************************* //
// WebGL Variables
var canvas;
var gl;
var programId;
var program;
// ********************************************************************************************* //
var startup = 1;
// 2D Drawing Variables
var positions;
var moveMode = 0; // boolean if points are being moved
var pointX; // Currently selected point x position
var pointY; // Currently selected point y position
var colorLocation;
var highlightPoint = [];
var axisRotation = []; 
var dottedLinePoints = [];
var pointsArray = [];
var bezierM = mat4(-1,  3, -3, 1,
                3, -6,  3, 0,
               -3,  3,  0, 0,
                1,  0,  0, 0);

var subdivisions = 64.0;
var bezierPos = [];
var bezierPos2 = [];
// ********************************************************************************************* //
// 3D Viewing Variables
var pts_length;
var bezier3dPos = [];
var bezier3dPos2 = [];
var points3D = [];
var points3DSteps = [];
var posSteps = [];
var angles = 16;
var steps = 16;
var continueRender = 1;

//viewing parameters
var near = -10;
var far = 10;
var radius = 1.0;
var theta  = 1.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;


const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

///////Functions for navigatoin elements and canvas


/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function openViewDropdown() {
    document.getElementById("viewDropdown").classList.toggle("show");
}
function openDrawDropdown() {
    document.getElementById("drawDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

//The method that responds to the 'View/Draw' button click to change the mode.
function selectMode() {
    var elem = document.getElementById("myButton1");
    document.getElementById("demo").innerHTML = "Let's Start";
    if (elem.value=="View Mode")
    {
        viewMethod();
        document.getElementById("demo").innerHTML = "This is the View Mode";
        elem.value = "Draw Mode";
    
    }
    else
    {
        drawMethod();
        document.getElementById("demo").innerHTML = "This is the Draw Mode";
        elem.value = "View Mode";
    }
}


// ########### The 3D Mode for Viewing the Surface of Revolution --- ADD CODE HERE ###########

function viewMethod() {
    document.getElementById("demo").innerHTML = "View Mode";
    // This will enable the correct menu for view mode
    document.getElementById("viewMenu").style.display = "block";
    document.getElementById("drawMenu").style.display = "none";

    // buttons to change viewing parameters
    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 1.1;};
    document.getElementById("Button4").onclick = function(){radius *= 0.9;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    // Ensure OpenGL viewport is resized to match canvas dimensions

    startup = 1;
    continueRender = 1;

    // Clear the arrays before they are generated
    points3D = [];
    posSteps = [];
    generate3DPoints();

    //console.log(flatten(points3D));
    for(i = 0; i <= steps; i++)
    {
        // for(j = 0; j < pts_length; j++)
        // {
        //     posSteps.concat(flatten(posSteps[i][j]));
        // }
        console.log(i);
        console.log(flatten(points3DSteps[i]));
        posSteps = posSteps.concat(points3DSteps[i]);

        //console.log(flatten(points3DSteps[i]));
        // posSteps.concat(flatten(points3DSteps[i]));
    }
    //console.log(posSteps);
    //console.log(flatten(posSteps));
    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
     
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
            
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    render();
    
}

var render = function() {
    if(continueRender)
    {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
        eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta), 
             radius*Math.cos(phi));

        modelViewMatrix = lookAt(eye, at , up); 
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);
        
        gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.lineWidth(3); 

        gl.bufferData( gl.ARRAY_BUFFER, flatten(points3D), gl.STATIC_DRAW );
        var count = flatten(points3D).length;
        gl.drawArrays(gl.POINTS, 0, count/4);

        

        gl.bufferData( gl.ARRAY_BUFFER, flatten(posSteps), gl.STATIC_DRAW );
        count = flatten(posSteps).length;
        gl.drawArrays(gl.LINE_STRIP, 0, count/4);

        
        requestAnimFrame(render);
    }    
}

function sweepPoints(point, theta) {
    var adjX = point[0] - canvas.width/2;
    var x = (adjX/canvas.width * Math.cos(theta)) + (point[2] * Math.sin(theta));
    var y = -1*point[1]/canvas.height;
    var z = (-1*adjX/canvas.width * Math.sin(theta)) + (point[2] * Math.cos(theta));
    return vec4(x,y,z,1);
}

function generate3DPoints() {
    var allBezierPoints = bezier3dPos.concat(bezier3dPos2);
    pts_length = allBezierPoints.length;
    console.log(pts_length);
    //console.log(allBezierPoints);
    var inc = 360/angles;
    var step_inc = Math.floor(pts_length/steps);
    var step_count = 0;
    //console.log(step_inc);

    for(x = 0; x <= steps; x++)
    {
        points3DSteps[x] = [];
    }

    // Sweep points for each angle
    for(t = 0; t <= 360; t+=inc)
    {
        // Loops through each point of the bezier curve and rotates the point in 3D space
        for(i = 0; i < pts_length; i++)
        {
            // Add the new 3D position of the point to the main 3D array
            var temp_pt = sweepPoints(allBezierPoints[i], radians(t));
            points3D.push(temp_pt);
            if(step_count < steps && (i % step_inc == 0))
            {
                points3DSteps[step_count].push(temp_pt);
                step_count++;
            }
            if(i == pts_length-1)
            {
                points3DSteps[steps].push(temp_pt);
            }
        }
        step_count = 0;
    }
    //console.log(points3DSteps);
}


// moves the current point to the current postion of the mouse
function movePoint(event) {
    if(moveMode == 1)
    {
        // sets the x and y position relative to the drawing canvas
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        // update the current points x and y positions to the new cursor coordinates
        positions[pointX] = x;
        positions[pointY] = y;
        highlightPoint = [positions[pointX], positions[pointY]];
        drawMethod();
    }
    
}

// checks the position of the mouse click to see if it is a valid point, if it is then enable
// moveMode and also creates a highlight point to draw to the screen
function checkPoint() {
    // sets the x and y position of the cursor event relative to the canvas
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    // loop through the position array checking if the cursor postion is within 5 pixels of a point
    for(i = 0; i < positions.length; i+=2)
    {
        j = i+1;
        xpos = positions[i];
        ypos = positions[j];
        if((x <= xpos+5 && x >= xpos-5) && (y <= ypos+5 && y >= ypos-5))
        {
            // store the indexes for the x and y position that are now selected
            pointX = i;
            pointY = j;
            moveMode = 1; // enable moveMode
            highlightPoint = [positions[i], positions[j]];
            drawMethod();
        }
    }
}

// This function handles creating the dotted lines between the control points
function generateDottedLine() {
    dottedLinePoints = [];
    for(i = 0; i < positions.length; i+=2)
    {
        // get array starting positions and declare variables for incrementing
        var xstart = positions[i];
        var ystart = positions[i+1];
        // ending positions
        var xend = positions[i+2];
        var yend = positions[i+3];
        // variables for steppping calculations
        var x_increment;
        var y_increment
        var x_dif = xend-xstart;
        var y_dif = yend-ystart;
        var stepping_limit = 20;
        dottedLinePoints.push(xstart);
        dottedLinePoints.push(ystart);

        // set stepping intervals by dividing distance by the number of steps needed
        x_increment = x_dif / stepping_limit;
        y_increment = y_dif / stepping_limit;
        // Loop through creating points between the start and end points
        for(j = 0; j <= stepping_limit; j++)
        {
            dottedLinePoints.push(xstart + (j * x_increment));
            dottedLinePoints.push(ystart + (j * y_increment));
        }
        // handle the endpoints
        dottedLinePoints.push(xend);
        dottedLinePoints.push(yend);
    }
}


// ########### The 2D Mode to draw the Bezier Curver --- ADD CODE HERE ###########

function drawMethod() {
    
    console.log("DRAWING");
    bezierPos = [];
    bezierPos2 = [];
    bezier3dPos = [];
    bezier3dPos2 = [];
    ans = [];
    ans2 = [];
    
    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //draws the dotted horizonbtal axis lines
    var primitiveType = gl.LINES;
    var count = axisRotation.length/2;
    gl.lineWidth(2);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(axisRotation), gl.STATIC_DRAW);
    gl.uniform4f(colorLocation, 0, 0, 0, 1);
    gl.drawArrays(primitiveType, offset, count);

    //If a point is being moved then draw the current highlighted point
    if(moveMode == 1)
    {
        var offset = 0;
        var count = 1;
        var primitiveType = gl.POINTS;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(highlightPoint), gl.STATIC_DRAW);
        gl.uniform4f(colorLocation, 1, 0, 1, 1);
        gl.drawArrays(primitiveType, offset, count);
        //console.log("DREW PRESSED POINT");
    }

    //draws the control points
    var primitiveType = gl.POINTS;
    var offset = 0;
    var count = positions.length/2;
    gl.uniform4f(colorLocation, 0.47, 0.47, 0.47, 1);
    console.log(positions);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.drawArrays(primitiveType, offset, count);

    //draws the dotted lines
    generateDottedLine();
    gl.lineWidth(1);
    console.log(dottedLinePoints);
    primitiveType = gl.LINES;
    count = dottedLinePoints.length/2;
    gl.uniform4f(colorLocation, 0, 0, 0, 1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dottedLinePoints), gl.STATIC_DRAW);
    gl.drawArrays(primitiveType, offset, count);

    
    //generate and draw the bezier curve everytime the control points are moved
    generateBezierCurve();
    gl.lineWidth(3);
    gl.uniform4f(colorLocation, 1, 0, 0, 1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bezierPos), gl.STATIC_DRAW);
    var count = subdivisions+1;
    primitiveType = gl.LINE_STRIP;
    gl.drawArrays(primitiveType, offset, count);
    //console.log(bezierPos);
    //clear the bezier postion array, so its ready for the next call
    

    //draw the 2nd bezier curve that we just generated
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bezierPos2), gl.STATIC_DRAW);
    var count = subdivisions+1;
    primitiveType = gl.LINE_STRIP;
    gl.drawArrays(primitiveType, offset, count);
    //console.log(bezierPos2);
    //clear the bezier postion array, so its ready for the next call
    console.log("END OF DRAW");
}

//generates the position points for the bezier curves
function generateBezierCurve() {
    //create the position matrix, from the current position of the control points
    var controlP1 = mat4(positions[0],positions[2],positions[4],positions[6],
                    positions[1],positions[3],positions[5],positions[7],
                    1,1,1,1,
                    1,1,1,1);

    var controlP2 = mat4(positions[6],positions[8],positions[10],positions[12],
                    positions[7],positions[9],positions[11],positions[13],
                    1,1,1,1,
                    1,1,1,1);

    //use the math from class to generate the martix of points
    ans = mult(controlP1,bezierM);
    ans2 = mult(controlP2,bezierM);
    //push the line segments for the number of subdivisions
    for(t = 0; t <= 1; t+=(1/subdivisions))
    {
        //use the parametric equations to generate the correct point
        xt = ans[0][0]*Math.pow(t,3) + ans[0][1]*Math.pow(t,2) + ans[0][2]*t + ans[0][3];
        bezierPos.push(xt);
        yt = ans[1][0]*Math.pow(t,3) + ans[1][1]*Math.pow(t,2) + ans[1][2]*t + ans[1][3];
        bezierPos.push(yt);
        bezier3dPos.push(vec4(xt,yt,0,1));

        xt2 = ans2[0][0]*Math.pow(t,3) + ans2[0][1]*Math.pow(t,2) + ans2[0][2]*t + ans2[0][3];
        bezierPos2.push(xt2);
        yt2 = ans2[1][0]*Math.pow(t,3) + ans2[1][1]*Math.pow(t,2) + ans2[1][2]*t + ans2[1][3];
        bezierPos2.push(yt2);
        bezier3dPos2.push(vec4(xt2,yt2,0,1));
    }
    //hard code in the last point to draw, otherwise the end point won't be connected.
    bezierPos.push(positions[6]);
    bezierPos.push(positions[7]);
    bezierPos2.push(positions[12]);
    bezierPos2.push(positions[13]);
    
}


function setupDraw() {
    
    continueRender = 0;
    if(startup == 1)
    {
        //setup click and drag listeners
        canvas.addEventListener("mousedown", checkPoint, false);
        canvas.addEventListener("mousemove", movePoint, false);
        canvas.addEventListener("mouseup", function(){
            moveMode = 0;
            console.log("MOUSE UP");
            drawMethod();
        }, false);

        document.getElementById("demo").innerHTML = "Draw Mode";

        // This will enable the correct menu for draw mode
        document.getElementById("drawMenu").style.display = "block";
        document.getElementById("viewMenu").style.display = "none";
        gl.enable(gl.DEPTH_TEST);
    
        // Load shaders
        programId = initShaders(gl, "2d-vertex-shader", "fragment-shader");
        
        // ######Create vertex buffer objects --- ADD CODE HERE #######
        var positionAttributeLocation = gl.getAttribLocation(programId, "a_position");
        var resolutionUniformLocation = gl.getUniformLocation(programId, "u_resolution");
        colorLocation = gl.getUniformLocation(programId, "u_color");
        
        //setup buffer for control points line and bezier curve
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        //tell atribute how to get data out of it, first turn the attribute on
        gl.enableVertexAttribArray(positionAttributeLocation);
        //specify how to pull the data out
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset)


        gl.useProgram(programId);
        // set the resolution so we use pixels instead of default 0 to 1
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.lineWidth(1);

    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    
    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    

        startup = 0;

        drawMethod();
    }
    else {
        drawMethod();
    }
    
}



// Initializations and setting up the gl variables
window.onload = function() {
   
    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");
    
    

    // Initialize a WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert("WebGL isn't available"); 
    }
    
    
    //inital point position
    positions = [
      3*canvas.width/4, 25,
      3*canvas.width/4, canvas.height/6,
      3*canvas.width/4, 2*canvas.height/6,
      3*canvas.width/4, canvas.height/2,
      3*canvas.width/4, 4*canvas.height/6,
      3*canvas.width/4, 5*canvas.height/6,
      3*canvas.width/4, canvas.height-25,
    ];

    //initialize the rotation axis points
    for(i = 0; i < 50; i= i+2)
    {
        axisRotation[i] = canvas.width/2;
        axisRotation[i+1] = (i+1)*canvas.height/50;
    }
    console.log(axisRotation);


    setupDraw();
    
    

    
    
};