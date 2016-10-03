var canvas;
var gl;
var programId;
var arrayPoints;

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


function getClickPosition(e) {
    var xPosition = e.clientX;
    var yPosition = e.clientY;
    console.log(xPosition);
    console.log(yPosition);
}

// ########### The 2D Mode to draw the Bezier Curver --- ADD CODE HERE ###########

function drawMethod() {
    document.getElementById("demo").innerHTML = "Draw Mode";
    canvas.addEventListener("click", getClickPosition, false);
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
    gl.drawArrays(primitiveType, offset, count);


}

// Initializations
window.onload = function() {
   
    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");

    
    // Initialize a WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert("WebGL isn't available"); 
    }
    
    gl.enable(gl.DEPTH_TEST);
    
    // Load shaders
    programId = initShaders(gl, "vertex-shader", "fragment-shader");
    
    // ######Create vertex buffer objects --- ADD CODE HERE #######
    var positionAttributeLocation = gl.getAttribLocation(programId, "a_position");
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // three 2d points
    var positions = [
      0, 1,
      0, 0.5,
      0, -0.5,
      0, 0,
      0, -1,
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
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // // Clear the canvas
    // gl.clearColor(0, 0, 0, 0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programId);
    
    

    
};
