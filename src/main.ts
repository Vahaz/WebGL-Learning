import * as fnc from "./function";
import * as cls from "./class";
import * as geo from "./geometry";

//
// MAIN
//

const SETTINGS = {
    FOV : 60.0,
    ROTATION_ANGLE : Math.floor(Math.random() * 180), // 10.0
}

async function main(): Promise<void> {

    // Canvas Element and Rendering Context.
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const gl = fnc.getContext(canvas);

    // Cube and Ground vertices/indices buffers.
    const cubeVertices = fnc.createStaticBuffer(gl, geo.CUBE_VERTICES, false);
    const cubeIndices = fnc.createStaticBuffer(gl, geo.CUBE_INDICES, true);
    const groundVertices = fnc.createStaticBuffer(gl, geo.GROUND_INDICES, false);
    const groundIndices = fnc.createStaticBuffer(gl, geo.GROUND_INDICES, true);

    if (!cubeVertices || !cubeIndices || !groundVertices || !groundIndices) {
        fnc.showError(`Failed to create geo: cube: (v=${!!cubeVertices} i=${cubeIndices}), ground=(v=${!!groundVertices} i=${!!groundIndices})`);
        return;
    }

    // Fetch shaders code and link it to a program.
    const vertexSrc = await fnc.getShaderSource('./shaders/vertex_shader.vert');
    const fragmentSrc = await fnc.getShaderSource('./shaders/fragment_shader.frag');
    const program = fnc.createProgram(gl, vertexSrc, fragmentSrc);

    // Create a new Image.
    const image = new Image();
    // On image load, we bind it to a TEXTURE_2D and set it attributes.
    image.onload = () => {
        // Flip the origin point of WebGL. (PNG format start at the top and WebGL at the bottom)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // Create a texture and bind our image.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        // How WebGL should manage mipmap, does it generate itself or "disable" it ?
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(
            gl.TEXTURE_2D,      // Target
            0,                  // Mipmap level
            gl.RGB,             // Internal Format
            256,                // Width
            128,                // Height
            0,                  // Border
            gl.RGB,             // Format
            gl.UNSIGNED_BYTE,   // Type
            image               // Source
        );
    }
    image.src = './img/tilemap.png';

    // Create a static buffer for our U,V coordinates.
    const texCoordsBuffer = fnc.createStaticBuffer(gl, geo.UV_COORDS, false);

    // Get the built-in variables, and our uniforms from shaders.
    const positionAttribute = gl.getAttribLocation(program, 'vertexPosition');
    const texAttribute = gl.getAttribLocation(program, 'aTexCoord');
    const matWorldUniform = gl.getUniformLocation(program, 'matWorld') as WebGLUniformLocation;
    const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj') as WebGLUniformLocation;

    if(positionAttribute < 0 || !matWorldUniform || !matViewProjUniform) {
        fnc.showError(`Failed to get attribs/uniforms (Max: ${gl.getParameter(gl.MAX_VERTEX_ATTRIBS)}): ` +
             `pos=${positionAttribute} ` +
            `matWorld=${!!matWorldUniform} matViewProj=${!!matViewProjUniform}`
        );
        return;
    }

    // Create our vertex array object buffers.
    const cubeVAO = fnc.createVAOBuffer(gl, cubeVertices, cubeIndices, texCoordsBuffer, positionAttribute, texAttribute);
    const groundVAO = fnc.createVAOBuffer(gl, groundVertices, groundIndices, texCoordsBuffer, positionAttribute, texAttribute);
    if(!cubeVAO || !groundVAO) {
        fnc.showError(`Failes to create VAOs: cube=${!!cubeVAO}, ground=${!!groundVAO}`);
        return;
    }

    // Store our cubes.
    const UP_VEC = new cls.vec3(0, 1, 0);
    const cubes = [
        new cls.Shape(new cls.vec3(0, 0.4, 0), 0.4, UP_VEC, 0, cubeVAO, geo.CUBE_INDICES.length), // Center
        new cls.Shape(new cls.vec3(1, 0.05, 1), 0.3, UP_VEC, fnc.toRadian(20), cubeVAO, geo.CUBE_INDICES.length),
        new cls.Shape(new cls.vec3(1, 0.1, -1), 0.1, UP_VEC, fnc.toRadian(40), cubeVAO, geo.CUBE_INDICES.length),
        new cls.Shape(new cls.vec3(-1, 0.15, 1), 0.15, UP_VEC, fnc.toRadian(60), cubeVAO, geo.CUBE_INDICES.length),
        new cls.Shape(new cls.vec3(-1, 0.2, -1), 0.2, UP_VEC, fnc.toRadian(80), cubeVAO, geo.CUBE_INDICES.length),
    ];

    let matView = new cls.mat4();
    let matProj = new cls.mat4();
    let matViewProj = new cls.mat4();

    let cameraAngle = 0;
    /**
     * Add a function to call it each frame.
     * - Output Merger: Merge the shaded pixel fragment with the existing out image.
     * - Rasterizer: Wich pixel are part of the Vertices + Wich part is modified by OpenGL.
     * - GPU Program: Pair Vertex & Fragment shaders.
     * - Uniforms: Setting them (can be set anywhere) (size/loc in pixels (px))
     * - Draw Calls: (w/ Primitive assembly + for loop)
     */
    let lastFrameTime = performance.now();
    const frame = async () => {
        // Calculate dt with time in seconds between each frame.
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;

        // Update
        cameraAngle += dt * fnc.toRadian(10);

        const cameraX = 3 * Math.sin(cameraAngle);
        const cameraZ = 3 * Math.cos(cameraAngle);

        matView.setLookAt(
            new cls.vec3(cameraX, 1, cameraZ),
            new cls.vec3(0, 0, 0),
            new cls.vec3(0, 1, 0)
        );
        matProj.setPerspective(
            fnc.toRadian(SETTINGS.FOV), // FOV
            canvas.width / canvas.height, // ASPECT RATIO
            0.1, 100.0 // Z-NEAR / Z-FAR
        );

        // GLM: matViewProj = matProj * matView
        matViewProj = matProj.multiply(matView);

        // Render
        canvas.width = canvas.clientWidth * devicePixelRatio;
        canvas.height = canvas.clientHeight * devicePixelRatio;

        gl.clearColor(0.02, 0.02, 0.02, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.useProgram(program);
        gl.uniformMatrix4fv(matViewProjUniform, false, matViewProj.m);

        cubes.forEach((cube) => {
            cube.rotate(dt * fnc.toRadian(SETTINGS.ROTATION_ANGLE));
            cube.draw(gl, matWorldUniform);
        });
        // Loop calls, each time the drawing is ready.
        requestAnimationFrame(frame);
    };
    // First call, as soon, as the browser is ready.
    requestAnimationFrame(frame);
}

fnc.showError("No Errors! 🌞");

try { main(); } catch(e) { fnc.showError(`Uncaught exception: ${e}`); }