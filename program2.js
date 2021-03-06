// Isaac Schwab
// schw1643@umn.edu

//Variables
var canvas;
var gl;
var programId;
var positions;
var moveMode = 0;
var pointX;
var pointY;
var colorLocation;
var highlightPoint = []; 
var result;

var bezierM = mat4(-1,  3, -3, 1,
                3, -6,  3, 0,
               -3,  3,  0, 0,
                1,  0,  0, 0);

var testPoints = mat4(1, 2, 3, 8,
                  1, -1, 5, 3,
                  4, 3, 5, 4,
                  1, 1, 1, 1);


var subdivisions = 25.0;
var bezierPos = [];
var bezierPos2 = [];

var axisRotation = [];

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
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    
    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}

//moves the current point to the current postion of the mouse
function movePoint(event) {
    if(moveMode == 1)
    {
        //sets the x and y position relative to the drawing canvas
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        //console.log("x: " + x + " y: " + y);
        positions[pointX] = x;
        positions[pointY] = y;
        highlightPoint = [positions[pointX], positions[pointY]];
        drawMethod();
    }
    
}

//checks the position of the mouse click to see if it is a valid point, if it is we set the points indexes and moveMode
function checkPoint() {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    //console.log("x: " + x + " y: " + y);
    for(i = 0; i < positions.length; i+=2)
    {
        j = i+1;
        xpos = positions[i];
        ypos = positions[j];
        if((x <= xpos+5 && x >= xpos-5) && (y <= ypos+5 && y >= ypos-5))
        {
            //console.log("Point: " + i);
            pointX = i;
            pointY = j;
            moveMode = 1;
            highlightPoint = [positions[i], positions[j]];
            drawMethod();
        }
    }
}

// This function handles creating the dotted lines between the control points
function generateDottedLine() {
    result = [];
    for(i = 0; i < positions.length; i+=2)
    {
        //get array positions and declare variables for incrementing
        var xstart = positions[i];
        var ystart = positions[i+1];
        console.log("Xstart: " + xstart + " Ystart: " + ystart);
        var xend = positions[i+2];
        var yend = positions[i+3];
        console.log("Xend: " + xend + " Yend: " + yend);
        var x_increment;
        var y_increment
        var x_dif = xend-xstart;
        var y_dif = yend-ystart;
        var stepping_limit;
        result.push(xstart);
        result.push(ystart);

        // set stepping intervals by dividing distance by the number of steps needed
        x_increment = x_dif / 20;
        y_increment = y_dif / 20;
        for(j = 0; j <= 20; j++)
        {
            result.push(xstart + (j * x_increment));
            result.push(ystart + (j * y_increment));
        }
        result.push(xend);
        result.push(yend);
    }
}


// ########### The 2D Mode to draw the Bezier Curver --- ADD CODE HERE ###########

function drawMethod() {
    document.getElementById("demo").innerHTML = "Draw Mode";

    // This will enable the correct menu for draw mode
    document.getElementById("drawMenu").style.display = "block";
    document.getElementById("viewMenu").style.display = "none";
    
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.lineWidth(1);

    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    
    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    //draws the dotted horizonbtal axis lines
    primitiveType = gl.LINES;
    var count = axisRotation.length/2;
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.drawArrays(primitiveType, offset, count);

    //draws the dotted lines
    generateDottedLine();
    console.log(result);
    primitiveType = gl.LINES;
    count = result.length/2;
    gl.uniform4f(colorLocation, 0, 0, 0, 1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(result), gl.STATIC_DRAW);
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
    bezierPos = [];

    //draw the 2nd bezier curve that we just generated
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bezierPos2), gl.STATIC_DRAW);
    var count = subdivisions+1;
    primitiveType = gl.LINE_STRIP;
    gl.drawArrays(primitiveType, offset, count);
    //console.log(bezierPos2);
    //clear the bezier postion array, so its ready for the next call
    bezierPos2 = [];
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

        xt2 = ans2[0][0]*Math.pow(t,3) + ans2[0][1]*Math.pow(t,2) + ans2[0][2]*t + ans2[0][3];
        bezierPos2.push(xt2);
        yt2 = ans2[1][0]*Math.pow(t,3) + ans2[1][1]*Math.pow(t,2) + ans2[1][2]*t + ans2[1][3];
        bezierPos2.push(yt2);
    }
    //hard code in the last point to draw, otherwise the end point won't be connected.
    bezierPos.push(positions[6]);
    bezierPos.push(positions[7]);
    bezierPos2.push(positions[12]);
    bezierPos2.push(positions[13]);
    
}





// Initializations and setting up the gl variables
window.onload = function() {
   
    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");
    //setup click and drag listeners
    canvas.addEventListener("mousedown", checkPoint, false);
    canvas.addEventListener("mousemove", movePoint, false);
    canvas.addEventListener("mouseup", function(){
        moveMode = 0;
        drawMethod();
    }, false);


    // Initialize a WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert("WebGL isn't available"); 
    }
    
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

    drawMethod();
    
    
};