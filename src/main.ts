import * as fnc from "./function";
import * as cls from "./class";
import { loadOBJ } from "./objLoader";
import * as tweakpane from "./tweakpane";

//
// MAIN
//

const UP_VEC = new cls.vec3(0, 1, 0);
const T0 = Date.now();
const TEXTURES = [ './img/diamond.png' ];
const SETTINGS = tweakpane.SETTINGS;
tweakpane.init();

async function main(): Promise<void> {

    // Canvas Element and Rendering Context.
    const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
    const gl = fnc.getContext(canvas);

    // Fetch shaders code and link them to a program.
    const vertexSrc = await fnc.getShaderSource('./shaders/vertex_shader.vert');
    const fragmentSrc = await fnc.getShaderSource('./shaders/fragment_shader.frag');
    const program = fnc.createProgram(gl, vertexSrc, fragmentSrc);

    // Load all images, create a storage, and store each image in a Texture Array.
    fnc.loadTexture(gl, TEXTURES);

    /* Getting the attributes from the vertex shader file.
     * Attribute locations can be forced in the vertex shader file with (location=number).
     * If not forced, WebGL gives them a number, you can get this number with gl.getAttribLocation().
     * Here, because we set manually the attribute location in the vertex shader,
     * We can replace gl.getAttribLocation() with the (location=number) number.
     */
    const positionAttribute = gl.getAttribLocation(program, 'vertexPosition'); // location = 0
    const uvAttribute = gl.getAttribLocation(program, 'aUV'); // location = 1
    const depthAttribute = gl.getAttribLocation(program, 'aDepth'); // location = 2

    // We cannot specify Uniforms locations manually. We need to get them using 'getUniformLocation'.
    const matWorldUniform = gl.getUniformLocation(program, 'matWorld') as WebGLUniformLocation;
    const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj') as WebGLUniformLocation;
    const samplerUniform = gl.getUniformLocation(program, 'uSampler') as WebGLUniformLocation;

    // Typescript wants to verify if the variables are set, not the best way to do it.
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

    const model = await loadOBJ('./models/diamond.obj');

    const modelVertexBuffer = fnc.createStaticBuffer(gl, model.vertices, false);
    const modelIndexBuffer = fnc.createStaticBuffer(gl, model.indices, true);
    const modelUVBuffer = fnc.createStaticBuffer(gl, model.uvs, false);

    const modelVAO = fnc.createVAOBuffer(
        gl,
        modelVertexBuffer,
        modelIndexBuffer,
        modelUVBuffer,
        positionAttribute,
        uvAttribute
    );

    // Store our cubes, draw them each time. (a lot of draw calls)
    const cubes: cls.Shape[] = [];
    cubes.push(new cls.Shape(
        new cls.vec3(0, 0, 0),
        SETTINGS.object_size,
        UP_VEC,
        fnc.toRadian(0),
        modelVAO,
        model.indices.length
    ));

    let matView = new cls.mat4();
    let matProj = new cls.mat4();
    let matViewProj = new cls.mat4();

    let cameraAngle = 0;
    /* Add a function to call it each frame.
     * - Output Merger: Merge the shaded pixel fragment with the existing result image.
     * - Rasterizer: Wich pixels are part of the Vertices + Wich part that modified by WebGL.
     * - GPU Program: Pair Vertex & Fragment shaders.
     * - Set Uniforms (can be set anywhere)
     * - Draw Calls (w/ Primitive assembly + for loop)
     */
    let lastFrameTime = performance.now();

    const frame = async () => {
        // Calculate dt (delta time) with time spent in seconds between each frame.
        const thisFrameTime = performance.now();
        const dt = (thisFrameTime - lastFrameTime) / 1000;
        lastFrameTime = thisFrameTime;

        // Each frame adds 10° to the camera angle.
        // cameraAngle += dt * fnc.toRadian(10);

        // Fixed camera coordinates.
        const cameraX = 3 * Math.sin(cameraAngle);
        const cameraZ = 3 * Math.cos(cameraAngle);

        // Make the 'camera' look at the center.
        matView.setLookAt(
            new cls.vec3(cameraX, -.25, cameraZ),
            new cls.vec3(0, 0, 0),
            new cls.vec3(0, 1, 0)
        );
        // Set the camera FOV, screen size, and view distance.
        matProj.setPerspective(
            fnc.toRadian(SETTINGS.camera_fov), // FOV
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


        cubes.forEach((cube) => {
            cube.rotate(dt * fnc.toRadian(SETTINGS.object_rotation_speed));
            cube.scale = SETTINGS.object_size;
            cube.draw(gl, matWorldUniform);
        });

        // dt is the time spent between each image.
        // fps is a frequency, it's the invert of dt.
        SETTINGS.benchmark_fps = Math.ceil(1 / dt);

        // Loop calls, each time the drawing is ready.
        requestAnimationFrame(frame);
    };
    // First call, as soon as the page is loaded.
    requestAnimationFrame(frame);
    SETTINGS.benchmark_loading_time = Date.now() - T0;
}



try {
    main().then(() => {
        fnc.showError("No Errors! 🌞");
    })
    .catch((e) => {
        fnc.showError(`Uncaught async exception: ${e}`);
    })
} catch(e) {
    fnc.showError(`Uncaught synchronous exception: ${e}`);
}
