import * as fnc from "./function";
import * as cls from "./class";
import * as geo from "./geometry";

//
// MAIN
//

const UP_VEC = new cls.vec3(0, 1, 0);
const T0 = Date.now();
const SETTINGS = {
    FOV : 60.0, // Default: 60.0
    ROTATION_ANGLE : 10.0, // Default: 10.0
}
const TEXTURES = [
    './img/cat_omg.png',
    './img/cat_stare.png'
]

async function main(): Promise<void> {

    // Canvas Element and Rendering Context.
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const gl = fnc.getContext(canvas);

    // Cube vertices/indices buffers.
    const cubeVertices = fnc.createStaticBuffer(gl, geo.CUBE_VERTICES, false);
    const cubeIndices = fnc.createStaticBuffer(gl, geo.CUBE_INDICES, true);

    if (!cubeVertices || !cubeIndices) {
        fnc.showError(`Failed to create geo: cube: (v=${!!cubeVertices} i=${cubeIndices})`);
        return;
    }

    // Fetch shaders code and link them to a program.
    const vertexSrc = await fnc.getShaderSource('./shaders/vertex_shader.vert');
    const fragmentSrc = await fnc.getShaderSource('./shaders/fragment_shader.frag');
    const program = fnc.createProgram(gl, vertexSrc, fragmentSrc);

    // Load all images, create a storage and store each image into a Texture Arrays.
    fnc.loadTexture(gl, TEXTURES);

    // Static buffer for UV coordinates. Might be constant with texture arrays.
    const texCoordsBuffer = fnc.createStaticBuffer(gl, geo.UV_DATA, false);


    const T1 = Date.now();
    fnc.setLogTime("test", `${Date.now() - T1}ms`);

    /* Getting the attributes from the vertex shader file.
     * Attributes locations can be forced in the vertex shader file with (location=number).
     * If not forced, WebGL gives them a number, you can get this number with gl.getAttribLocation().
     * Here, because we set manually the attribute location in the vertex shader,
     * we can replace gl.getAttribLocation() with the (location=number) number.
     */
    const positionAttribute = gl.getAttribLocation(program, 'vertexPosition'); // location = 0
    const uvAttribute = gl.getAttribLocation(program, 'aUV'); // location = 1
    const depthAttribute = gl.getAttribLocation(program, 'aDepth'); // location = 2

    // We can not specify Uniforms locations manually. We need to get them using 'getUniformLocation'.
    const matWorldUniform = gl.getUniformLocation(program, 'matWorld') as WebGLUniformLocation;
    const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj') as WebGLUniformLocation;
    const samplerUniform = gl.getUniformLocation(program, 'uSampler') as WebGLUniformLocation;

    // Typescript want to verify if the variables are set, not the best way to do it.
    if(positionAttribute < 0 || uvAttribute < 0 || depthAttribute < 0 || !matWorldUniform || !matViewProjUniform || !samplerUniform) {
        fnc.showError(`Failed to get attribs/uniforms (Max: ${gl.getParameter(gl.MAX_VERTEX_ATTRIBS)}): ` +
            ` pos=${positionAttribute}` +
            ` uv=${uvAttribute}` +
            ` depth=${depthAttribute}` +
            ` matWorld=${!!matWorldUniform}` +
            ` matViewProj=${!!matViewProjUniform}` +
            ` sampler=${!!samplerUniform}`
        );
        return;
    }

    // Control the depth of the texture array. Picking our displayed texture.
    gl.vertexAttrib1f(depthAttribute, 1);

    // Create our vertex array object (VAOs) buffers.
    const cubeVAO = fnc.createVAOBuffer(gl, cubeVertices, cubeIndices, texCoordsBuffer, positionAttribute, uvAttribute);
    if(!cubeVAO) return fnc.showError(`Failes to create VAOs: cube=${!!cubeVAO}`);

    let random = new cls.vec3(Math.random() * 1, Math.random() * 1, Math.random() * 1);

    // Store our cubes, draw them each time. (a lot of draw calls)
    const cubes = [
        new cls.Shape(new cls.vec3(0, 0.4, 0), 0.4, UP_VEC, 0, cubeVAO, geo.CUBE_INDICES.length), // Center
        new cls.Shape(random, 0.3, UP_VEC, fnc.toRadian(20), cubeVAO, geo.CUBE_INDICES.length),
        new cls.Shape(new cls.vec3(1, 0.1, -1), 0.1, UP_VEC, fnc.toRadian(40), cubeVAO, geo.CUBE_INDICES.length),
        new cls.Shape(new cls.vec3(-1, 0.15, 1), 0.15, UP_VEC, fnc.toRadian(60), cubeVAO, geo.CUBE_INDICES.length),
        new cls.Shape(new cls.vec3(-1, 0.2, -1), 0.2, UP_VEC, fnc.toRadian(80), cubeVAO, geo.CUBE_INDICES.length),
    ];

    let matView = new cls.mat4();
    let matProj = new cls.mat4();
    let matViewProj = new cls.mat4();

    let cameraAngle = 0;
    /* Add a function to call it each frame.
     * - Output Merger: Merge the shaded pixel fragment with the existing result image.
     * - Rasterizer: Wich pixel are part of the Vertices + Wich part is modified by WebGL.
     * - GPU Program: Pair Vertex & Fragment shaders.
     * - Set Uniforms (can be set anywhere)
     * - Draw Calls (w/ Primitive assembly + for loop)
     */
    let lastFrameTime = performance.now();

    // Randomize cube rotation speed each time.
    let rdm = Math.floor(Math.random() * 180);

    const frame = async () => {
        // Calculate dt (delta time) with time in seconds between each frame.
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;

        // Each frame add 10° to the camera angle.
        cameraAngle += dt * fnc.toRadian(10);

        // Fixed camera coordinates.
        const cameraX = 3 * Math.sin(cameraAngle);
        const cameraZ = 3 * Math.cos(cameraAngle);

        // Make the 'camera' look at the center.
        matView.setLookAt(
            new cls.vec3(cameraX, 1, cameraZ),
            new cls.vec3(0, 0, 0),
            new cls.vec3(0, 1, 0)
        );
        // Set the camera FOV, screen size and view distance.
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
        gl.uniformMatrix4fv(matViewProjUniform, false, matViewProj.mat);


        cubes.forEach((cube, index) => {
            // The center cube do not rotate on itself.
            if (index == 0) { cube.draw(gl, matWorldUniform); return } 
            cube.rotate(dt * fnc.toRadian(rdm));
            cube.draw(gl, matWorldUniform);
        });
        // Loop calls, each time the drawing is ready.
        fnc.setLogTime("fps", `${Math.ceil(dt)}ms`);
        requestAnimationFrame(frame);
    };
    // First call, as soon, as the page is loaded.
    requestAnimationFrame(frame);
    fnc.setLogTime("loading", `${ Date.now() - T0 }ms`);
}

fnc.showError("No Errors! 🌞");

try { main(); } catch(e) { fnc.showError(`Uncaught exception: ${e}`); }