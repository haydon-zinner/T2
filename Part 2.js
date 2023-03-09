var gl, canvas;

var worldMatrixLocation;
var projMatrixLocation;

var angle = 0;
var program;

let camera, events;
let eye = vec3(0.82, 0.22, 1.48);
let at = vec3(-0.18, -0.01, -0.9);
let up = vec3(0, 1, 0);
let pitch = -1.2;
let yaw = -170;


var carMirror;
var carReflection;
var carTexture;
var mirrorTexture;

var carReflectionPosBufferId;
var carReflectionTextureBufferId;

var carMirrorPosBufferId;
var carMirrorTextureBufferId;


function bindData(gl, data) {
    // Load the positional data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data), gl.STATIC_DRAW);

    return bufferId;
}

function enableShaderAttribute(gl, bufferId, shaderAttributeName, noElements) {
    // Associate out shader variables with our data buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    var attributeLocation = gl.getAttribLocation(program, shaderAttributeName);
    gl.vertexAttribPointer(attributeLocation, noElements, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attributeLocation);
}

window.onload = function init() {

    //Configure WebGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas, {stencil: true});
    if (!gl) {alert("WebGL isn't available");}
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //Create camera and event handler
    camera = new Camera(eye, at, up, yaw, pitch);
    events = new Events();
    events.init();

    //First, load our reflection surface and scene
    carReflection = new ColladaParser("meshes/carReflection.dae");
    carMirror = new ColladaParser("meshes/carMirror.dae");
    carTexture = new TGAParser("textures/car_1.tga");
    mirrorTexture = new TGAParser("textures/white.tga");

    //Load shaders and initialize attribute buffers
    program = initShaders(gl, "shaders/BasicShader.vs", "shaders/BasicShader.fs");
    gl.useProgram(program);

    carReflectionPosBufferId = bindData(gl, carReflection.vertexPositionDataRead);
    carMirrorPosBufferId = bindData(gl, carMirror.vertexPositionDataRead);
    carReflectionTextureBufferId = bindData(gl, carReflection.vertexTextureDataRead);
    carMirrorTextureBufferId = bindData(gl, carMirror.vertexTextureDataRead);
    enableShaderAttribute(gl, carReflectionPosBufferId, "aPosition", 3);
    enableShaderAttribute(gl, carReflectionTextureBufferId, "aTextureCoordinate", 2);

    worldMatrixLocation = gl.getUniformLocation(program, "mWorldMatrix");

    setInterval(render, 16);
}


function render() {

    var alphaSettingLocation = gl.getUniformLocation(program, "alphaSetting");

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mirrorTexture.texture);
    gl.uniform1i(gl.getUniformLocation(program, "myTexture"), 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    //Phase 1
    gl.enable(gl.STENCIL_TEST)
    gl.stencilOp(gl.REPLACE, gl.KEEP, gl.REPLACE)
    gl.stencilFunc(gl.ALWAYS, 1, 0xff)
    gl.uniform1f(alphaSettingLocation, 1.0);
    gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(camera.projectionViewMatrix));
    enableShaderAttribute(gl, carMirrorPosBufferId, "aPosition", 3);
    enableShaderAttribute(gl, carMirrorTextureBufferId, "aTextureCoordinate", 2);
    gl.drawArrays(gl.TRIANGLES, 0, carMirror.vertexPositionDataRead.length / 3);


    //Phase 2
    //Draw the original scenes
    gl.bindTexture(gl.TEXTURE_2D, carTexture.texture);
    gl.stencilFunc(gl.ALWAYS, 0, 0xff)
    gl.uniform1f(alphaSettingLocation, 1.0);

    gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(camera.projectionViewMatrix));
    enableShaderAttribute(gl, carReflectionPosBufferId, "aPosition", 3);
    enableShaderAttribute(gl, carReflectionTextureBufferId, "aTextureCoordinate", 2);
    gl.drawArrays(gl.TRIANGLES, 0, carReflection.vertexPositionDataRead.length / 3);

    //Phase 3
    //Draw the refelected scene onto the reflection surface
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
    gl.stencilFunc(gl.EQUAL, 1, 0xff)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(mult(mult(mult(camera.projectionViewMatrix, rotate(180, [0,1,0])), scalem(-1, 1, 1)), translate(0, 0, 1.5))));
    gl.uniform1f(alphaSettingLocation, 0.4);
    gl.disable(gl.DEPTH_TEST);
    enableShaderAttribute(gl, carReflectionPosBufferId, "aPosition", 3);
    enableShaderAttribute(gl, carReflectionTextureBufferId, "aTextureCoordinate", 2);
    gl.drawArrays(gl.TRIANGLES, 0, carReflection.vertexPositionDataRead.length / 3);

    gl.enable(gl.DEPTH_TEST)
    gl.disable(gl.STENCIL_TEST)
    gl.disable(gl.BLEND);
}  
