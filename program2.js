var canvas;
var gl;
var programId;
var positions;
var moveMode = 0;

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
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    // Set screen clear color to R, G, B, alpha; where 0.0 is 0% and 1.0 is 100%
    gl.clearColor(0.0, 0.7, 0.0, 1.0);
    
    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
}

//get mouse position
function movePoint(event) {
    if(moveMode == 1)
    {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y);
        for(i = 0; i < positions.length; i+=2)
        {
            j = i+1;
            xpos = positions[i];
            ypos = positions[j];
            if((x <= xpos+5 && x >= xpos-5) && (y <= ypos+5 && y >= ypos-5))
            {
                console.log("Point: " + i);
                positions[i] = x;
                positions[j] = y;
                drawMethod();
            }
        }

    }
    
}


// ########### The 2D Mode to draw the Bezier Curver --- ADD CODE HERE ###########

function drawMethod() {
    document.getElementById("demo").innerHTML = "Draw Mode";
    // Ensure OpenGL viewport is resized to match canvas dimensions
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    
    // Enable color; required for clearing the screen
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Clear out the viewport with solid black color
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    var primitiveType = gl.POINTS;
    var offset = 0;
    var count = 5;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.drawArrays(primitiveType, offset, count);
}



// Initializations
window.onload = function() {
   
    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");
    //setup click and drag listeners
    canvas.addEventListener("mousedown", function(){
        moveMode = 1;
    }, false);
    canvas.addEventListener("mousemove", movePoint, false);
    canvas.addEventListener("mouseup", function(){
        moveMode = 0;
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
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // three 2d points
    positions = [
      0, 0,
      512, 400,
      512, 0,
      0, 400,
      512/2, 200,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

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

    //attribute vec4 a_position;
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // // Clear the canvas
    // gl.clearColor(0, 0, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programId);
    // set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    
    

    
};
