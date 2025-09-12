/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/class.ts":
/*!**********************!*\
  !*** ./src/class.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {


//
// CLASS
//
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mat4 = exports.quat = exports.vec3 = exports.Shape = void 0;
class Shape {
    constructor(pos, scale, rotationAxis, rotationAngle, vao, numIndices) {
        this.pos = pos;
        this.scale = scale;
        this.rotationAxis = rotationAxis;
        this.rotationAngle = rotationAngle;
        this.vao = vao;
        this.numIndices = numIndices;
        this.matWorld = new mat4();
        this.scaleVec = new vec3();
        this.rotation = new quat();
    }
    rotate(angle) {
        this.rotationAngle = this.rotationAngle + angle;
    }
    draw(gl, matWorldUniform) {
        this.rotation.setAxisAngle(this.rotationAxis, this.rotationAngle);
        this.scaleVec.set(this.scale, this.scale, this.scale);
        this.matWorld.setFromRotationTranslationScale(this.rotation, this.pos, this.scaleVec);
        gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld.mat);
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }
}
exports.Shape = Shape;
class vec3 {
    constructor(x = 0.0, y = 0.0, z = 0.0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    add(v) { return new vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    subtract(v) { return new vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    multiply(v) { return new vec3(this.x * v.x, this.y * v.y, this.z * v.z); }
    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    normalize() {
        const len = Math.hypot(this.x, this.y, this.z);
        return len > 0 ? new vec3(this.x / len, this.y / len, this.z / len) : new vec3();
    }
    cross(v) {
        return new vec3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
}
exports.vec3 = vec3;
class quat {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    setAxisAngle(axis, angle) {
        const norm = axis.normalize();
        const half = angle / 2;
        const s = Math.sin(half);
        this.x = norm.x * s;
        this.y = norm.y * s;
        this.z = norm.z * s;
        this.w = Math.cos(half);
        return this;
    }
}
exports.quat = quat;
class mat4 {
    constructor() {
        this.mat = new Float32Array(16);
        this.identity();
    }
    identity() {
        const m = this.mat;
        m.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }
    copyFrom(mat) {
        this.mat.set(mat.mat);
        return this;
    }
    /*
     *  x,  0,  0, 0
     *  0,  y,  0, 0
     *  0,  0,  z, 0
     * tx, ty, tz, 1
     */
    multiply(other) {
        const a = this.mat, b = other.mat;
        const out = new Float32Array(16);
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                out[j * 4 + i] =
                    a[0 * 4 + i] * b[j * 4 + 0] +
                        a[1 * 4 + i] * b[j * 4 + 1] +
                        a[2 * 4 + i] * b[j * 4 + 2] +
                        a[3 * 4 + i] * b[j * 4 + 3];
            }
        }
        this.mat.set(out);
        return this;
    }
    /*
     * Perspective matrice, the factor is calculated from the tan of the FOV divided by 2:
     * We have the near plane and far plane. (objects are drawn in-between)
     * aspect is the aspect-ratio like 16:9 on most screens.
     * We change each vertices x, y and z by the following:
     * 0, 0,  0,  0
     * 0, 5,  0,  0
     * 0, 0, 10, 11
     * 0, 0, 14, 15
     */
    setPerspective(fovRad, aspect, near, far) {
        const f = 1.0 / Math.tan(fovRad / 2);
        const nf = 1 / (near - far);
        const m = this.mat;
        m.set([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) * nf, -1,
            0, 0, 2 * far * near * nf, 0
        ]);
        return this;
    }
    setLookAt(eye, center, up) {
        const z = eye.subtract(center).normalize();
        const x = up.cross(z).normalize();
        const y = z.cross(x);
        const m = this.mat;
        m.set([
            x.x, y.x, z.x, 0,
            x.y, y.y, z.y, 0,
            x.z, y.z, z.z, 0,
            -x.dot(eye), -y.dot(eye), -z.dot(eye), 1
        ]);
        return this;
    }
    setFromRotationTranslationScale(q, v, s) {
        const x = q.x, y = q.y, z = q.z, w = q.w;
        const sx = s.x, sy = s.y, sz = s.z;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        const m = this.mat;
        m.set([
            (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
            (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
            (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
            v.z, v.y, v.z, 1
        ]);
        return this;
    }
}
exports.mat4 = mat4;


/***/ }),

/***/ "./src/function.ts":
/*!*************************!*\
  !*** ./src/function.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports) {


//
// FUNCTION
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.showError = showError;
exports.setLogTime = setLogTime;
exports.getShaderSource = getShaderSource;
exports.getImage = getImage;
exports.getContext = getContext;
exports.toRadian = toRadian;
exports.createStaticBuffer = createStaticBuffer;
exports.createVAOBuffer = createVAOBuffer;
exports.createProgram = createProgram;
// Display an error message to the HTML Element with id "error".
function showError(msg = "No Data") {
    const container = document.getElementById("error");
    if (container === null)
        return console.log("No Element with ID: error");
    const element = document.createElement('p');
    element.innerText = msg;
    container.appendChild(element);
    console.log(msg);
}
function setLogTime(target, msg) {
    let container = null;
    if (target == "loading") {
        container = document.getElementById("loading");
    }
    else if (target == "fps") {
        container = document.getElementById("fps");
    }
    else {
        container = document.getElementById("test");
    }
    if (container === null)
        return console.log(`No Element with ID: ${target}`);
    const p = container.querySelector('p:not(.title)');
    if (p) {
        p.innerText = msg;
    }
    else {
        const element = document.createElement('p');
        element.innerText = msg;
        container.appendChild(element);
    }
    console.log(`${target}: ${msg}`);
}
// Get shaders source code.
function getShaderSource(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        if (!response.ok) {
            throw new Error(`Error while loading shader code at "${url}": ${response.statusText}`);
        }
        return response.text();
    });
}
function getImage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const image = new Image();
            image.src = url;
            image.onload = () => resolve(image);
        });
    });
}
// Return the WebGL Context from the Canvas Element.
function getContext(canvas) {
    return canvas.getContext('webgl2');
}
// Convert from degrees to radiant.
function toRadian(angle) {
    return angle * Math.PI / 180;
}
/**
 * Create a WebGL Buffer type. (Opaque Handle)
 * - STATIC_DRAW : wont update often, but often used.
 * - ARRAY_BUFFER : indicate the place to store the Array.
 * - ELEMENT_ARRAY_BUFFER : Used for indices with cube shapes drawing.
 * Bind the Buffer to the CPU, add the Array to the Buffer and Clear after use.
 */
function createStaticBuffer(gl, data, isIndice) {
    const buffer = gl.createBuffer();
    const type = (isIndice == true) ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
    if (!buffer) {
        showError("Failed to allocate buffer space");
        return 0;
    }
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);
    gl.bindBuffer(type, null);
    return buffer;
}
/**
 * Create vertex array object buffers, it read the vertices from GPU Buffer.
 * The vertex buffer contains the vertices coordinates (can also contains color and size).
 * The index buffer contains wich vertex need to be drawn on scene to avoid duplicates vertices.
 * In case of colors, an offset of 3 floats is used each time to avoid (x, y, z) coordinates.
 * The vertex shader place the vertices in clip space and the fragment shader color the pixels. (Default: 0)
 * VertexAttribPointer [Index, Size, Type, IsNormalized, Stride, Offset]
 * - Index (location)
 * - Size (Component per vector)
 * - Type
 * - IsNormalized (int to floats, for colors transform [0, 255] to float [0, 1])
 * - Stride (Distance between each vertex in the buffer)
 * - Offset (Number of skiped bytes before reading attributes)
 */
function createVAOBuffer(gl, vertexBuffer, indexBuffer, uvBuffer, posAttrib, uvAttrib) {
    const vao = gl.createVertexArray();
    if (!vao) {
        showError("Failed to allocate VAO buffer.");
        return 0;
    }
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(posAttrib);
    gl.enableVertexAttribArray(uvAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0); // format: (x, y, z) (all f32)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.vertexAttribPointer(uvAttrib, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return vao;
}
// Create a program and link the vertex and fragment shader source code to it.
function createProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        showError(error || "No shader debug log provided.");
        return 0;
    }
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        showError(error || "No shader debug log provided.");
        return 0;
    }
    // Program set up for Uniforms.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const error = gl.getProgramInfoLog(program);
        showError(error || "No program debug log provided.");
        return 0;
    }
    return program;
}


/***/ }),

/***/ "./src/geometry.ts":
/*!*************************!*\
  !*** ./src/geometry.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


// Vertex buffer format: XYZ
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UV_DATA = exports.CUBE_INDICES = exports.CUBE_VERTICES = void 0;
//
// Cube geometry
// taken from: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
exports.CUBE_VERTICES = new Float32Array([
    // Front face
    -1.0, -1.0, 1.0, // 0 A
    1.0, -1.0, 1.0, // 1 B
    1.0, 1.0, 1.0, // 2 C
    -1.0, 1.0, 1.0, // 3 D
    // Back face
    -1.0, -1.0, -1.0, // 4
    -1.0, 1.0, -1.0, // 5
    1.0, 1.0, -1.0, // 6
    1.0, -1.0, -1.0, // 7
    // Top face
    -1.0, 1.0, -1.0, // 8
    -1.0, 1.0, 1.0, // 9
    1.0, 1.0, 1.0, // 10
    1.0, 1.0, -1.0, // 11
    // Bottom face
    -1.0, -1.0, -1.0, // 12
    1.0, -1.0, -1.0, // 13
    1.0, -1.0, 1.0, // 14
    -1.0, -1.0, 1.0, // 15
    // Right face
    1.0, -1.0, -1.0, // 16
    1.0, 1.0, -1.0, // 17
    1.0, 1.0, 1.0, // 18
    1.0, -1.0, 1.0, // 19
    // Left face
    -1.0, -1.0, -1.0, // 20
    -1.0, -1.0, 1.0, // 21
    -1.0, 1.0, 1.0, // 22
    -1.0, 1.0, -1.0, // 23
]);
exports.CUBE_INDICES = new Uint16Array([
    0, 1, 2,
    0, 2, 3, // front
    4, 5, 6,
    4, 6, 7, // back
    8, 9, 10,
    8, 10, 11, // top
    12, 13, 14,
    12, 14, 15, // bottom
    16, 17, 18,
    16, 18, 19, // right
    20, 21, 22,
    20, 22, 23, // left
]);
exports.UV_DATA = new Float32Array([
    0, 0, 1, 0, 1, 1, 0, 1, // front
    0, 0, 1, 0, 1, 1, 0, 1, // back
    0, 0, 1, 0, 1, 1, 0, 1, // top
    0, 0, 1, 0, 1, 1, 0, 1, // bottom
    0, 0, 1, 0, 1, 1, 0, 1, // right
    0, 0, 1, 0, 1, 1, 0, 1, // left
]);


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const fnc = __webpack_require__(/*! ./function */ "./src/function.ts");
const cls = __webpack_require__(/*! ./class */ "./src/class.ts");
const geo = __webpack_require__(/*! ./geometry */ "./src/geometry.ts");
//
// MAIN
//
const UP_VEC = new cls.vec3(0, 1, 0);
const T0 = Date.now();
const TEXTURES = [
    './img/cat_omg.png',
    './img/cat_stare.png'
];
const SETTINGS = {
    FOV: 60.0, // Default: 60.0
    ROTATION_ANGLE: 10.0, // Default: 10.0
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Canvas Element and Rendering Context.
        const canvas = document.getElementById("webgl-canvas");
        const gl = fnc.getContext(canvas);
        // Cube vertices/indices buffers.
        const cubeVertices = fnc.createStaticBuffer(gl, geo.CUBE_VERTICES, false);
        const cubeIndices = fnc.createStaticBuffer(gl, geo.CUBE_INDICES, true);
        if (!cubeVertices || !cubeIndices) {
            fnc.showError(`Failed to create geo: cube: (v=${!!cubeVertices} i=${cubeIndices})`);
            return;
        }
        // Fetch shaders code and link them to a program.
        const vertexSrc = yield fnc.getShaderSource('./shaders/vertex_shader.vert');
        const fragmentSrc = yield fnc.getShaderSource('./shaders/fragment_shader.frag');
        const program = fnc.createProgram(gl, vertexSrc, fragmentSrc);
        // Create a texture and bind our image.
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
        // Target, Mipmap_Levels, Internal_Format, Width, Height, Images_Count
        gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 128, 128, TEXTURES.length);
        // Flip the origin point of WebGL. (PNG format start at the top and WebGL at the bottom)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // Because texSubImage3D is async, waiting for each image to load is slow. So, we preload all images using a Promise.
        const images = yield Promise.all(TEXTURES.map(src => fnc.getImage(src)));
        for (let i = 0; i < images.length; i++) {
            // Target, Mipmap_Level, Internal_Format, Width, Height, Depth, Border, Format, Type, Offset
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        }
        // Change the minimum and magnitude filters when scaling up and down textures.
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Static buffer for UV coordinates. Might be constant with texture arrays.
        const texCoordsBuffer = fnc.createStaticBuffer(gl, geo.UV_DATA, false);
        const T1 = Date.now();
        fnc.setLogTime("test", `${Date.now() - T1}ms`);
        /*
        * Getting the attributes from the vertex shader file.
        * Attributes locations can be forced in the vertex shader file with (location=number).
        * If not forced, WebGL gives them a number, you can get this number with gl.getAttribLocation().
        * Here, because we set manually the attribute location in the vertex shader,
        * we can replace gl.getAttribLocation() with the (location=number) number.
        */
        const positionAttribute = gl.getAttribLocation(program, 'vertexPosition'); // location = 0
        const uvAttribute = gl.getAttribLocation(program, 'aUV'); // location = 1
        const depthAttribute = gl.getAttribLocation(program, 'aDepth'); // location = 2
        // We can not specify Uniforms locations manually. We need to get them using 'getUniformLocation'.
        const matWorldUniform = gl.getUniformLocation(program, 'matWorld');
        const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj');
        const samplerUniform = gl.getUniformLocation(program, 'uSampler');
        // Typescript want to verify if the variables are set, not the best way to do it.
        if (positionAttribute < 0 || uvAttribute < 0 || depthAttribute < 0 || !matWorldUniform || !matViewProjUniform || !samplerUniform) {
            fnc.showError(`Failed to get attribs/uniforms (Max: ${gl.getParameter(gl.MAX_VERTEX_ATTRIBS)}): ` +
                ` pos=${positionAttribute}` +
                ` uv=${uvAttribute}` +
                ` depth=${depthAttribute}` +
                ` matWorld=${!!matWorldUniform}` +
                ` matViewProj=${!!matViewProjUniform}` +
                ` sampler=${!!samplerUniform}`);
            return;
        }
        // Control the depth of the texture array. Picking our displayed texture.
        gl.vertexAttrib1f(depthAttribute, 0);
        // Create our vertex array object (VAOs) buffers.
        const cubeVAO = fnc.createVAOBuffer(gl, cubeVertices, cubeIndices, texCoordsBuffer, positionAttribute, uvAttribute);
        if (!cubeVAO)
            return fnc.showError(`Failes to create VAOs: cube=${!!cubeVAO}`);
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
        /**
         * Add a function to call it each frame.
         * - Output Merger: Merge the shaded pixel fragment with the existing result image.
         * - Rasterizer: Wich pixel are part of the Vertices + Wich part is modified by WebGL.
         * - GPU Program: Pair Vertex & Fragment shaders.
         * - Set Uniforms (can be set anywhere)
         * - Draw Calls (w/ Primitive assembly + for loop)
         */
        let lastFrameTime = performance.now();
        // Randomize cube rotation speed each time.
        let rdm = Math.floor(Math.random() * 180);
        const frame = () => __awaiter(this, void 0, void 0, function* () {
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
            matView.setLookAt(new cls.vec3(cameraX, 1, cameraZ), new cls.vec3(0, 0, 0), new cls.vec3(0, 1, 0));
            // Set the camera FOV, screen size and view distance.
            matProj.setPerspective(fnc.toRadian(SETTINGS.FOV), // FOV
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
                if (index == 0) {
                    cube.draw(gl, matWorldUniform);
                    return;
                }
                cube.rotate(dt * fnc.toRadian(rdm));
                cube.draw(gl, matWorldUniform);
            });
            // Loop calls, each time the drawing is ready.
            fnc.setLogTime("fps", `${Math.ceil(dt)}ms`);
            requestAnimationFrame(frame);
        });
        // First call, as soon, as the page is loaded.
        requestAnimationFrame(frame);
        fnc.setLogTime("loading", `${Date.now() - T0}ms`);
    });
}
fnc.showError("No Errors! 🌞");
try {
    main();
}
catch (e) {
    fnc.showError(`Uncaught exception: ${e}`);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUNyRixHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxTQUFTO1FBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyRixDQUFDO0lBQ0QsS0FBSyxDQUFDLENBQU87UUFDVCxPQUFPLElBQUksSUFBSSxDQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzlCLENBQUM7SUFDTixDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQU8sSUFBWSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENB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QUFDLENBQUM7UUFFbkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDRixDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFNLENBQUM7WUFDbkUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBTSxDQUFDO1lBQ25FLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFB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QUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFbkYsOERBQThEO1FBQzlELE1BQU0sS0FBSyxHQUFHO1lBQ1YsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVM7WUFDbkcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQ3RGLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDeEcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUMxRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFD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QUMsQ0FBQztBQUUvQixJQUFJLENBQUM7SUFBQyxJQUFJLEVBQUUsQ0FBQztBQUFDLENBQUM7QUFBQyxPQUFNLENBQUMsRUFBRSxDQUFDO0lBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFDLENBQUM7Ozs7Ozs7VUNyTXZFO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9jbGFzcy50cyIsIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9mdW5jdGlvbi50cyIsIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9nZW9tZXRyeS50cyIsIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9tYWluLnRzIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvL1xyXG4vLyBDTEFTU1xyXG4vL1xyXG5cclxuZXhwb3J0IGNsYXNzIFNoYXBlIHtcclxuICAgIHByaXZhdGUgbWF0V29ybGQgPSBuZXcgbWF0NCgpO1xyXG4gICAgcHJpdmF0ZSBzY2FsZVZlYyA9IG5ldyB2ZWMzKCk7XHJcbiAgICBwcml2YXRlIHJvdGF0aW9uID0gbmV3IHF1YXQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwcml2YXRlIHBvczogdmVjMyxcclxuICAgICAgICBwcml2YXRlIHNjYWxlOiBudW1iZXIsXHJcbiAgICAgICAgcHJpdmF0ZSByb3RhdGlvbkF4aXM6IHZlYzMsXHJcbiAgICAgICAgcHJpdmF0ZSByb3RhdGlvbkFuZ2xlOiBudW1iZXIsXHJcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IHZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCxcclxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgbnVtSW5kaWNlczogbnVtYmVyXHJcbiAgICApIHsgfVxyXG5cclxuICAgIHJvdGF0ZShhbmdsZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbkFuZ2xlID0gdGhpcy5yb3RhdGlvbkFuZ2xlICsgYW5nbGU7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgbWF0V29ybGRVbmlmb3JtOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbikge1xyXG4gICAgICAgIHRoaXMucm90YXRpb24uc2V0QXhpc0FuZ2xlKHRoaXMucm90YXRpb25BeGlzLCB0aGlzLnJvdGF0aW9uQW5nbGUpO1xyXG4gICAgICAgIHRoaXMuc2NhbGVWZWMuc2V0KHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUpO1xyXG5cclxuICAgICAgICB0aGlzLm1hdFdvcmxkLnNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUodGhpcy5yb3RhdGlvbiwgdGhpcy5wb3MsIHRoaXMuc2NhbGVWZWMpO1xyXG5cclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFdvcmxkVW5pZm9ybSwgZmFsc2UsIHRoaXMubWF0V29ybGQubWF0KTtcclxuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52YW8pO1xyXG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIHRoaXMubnVtSW5kaWNlcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xyXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgdmVjMyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyID0gMC4wLCBwdWJsaWMgeTogbnVtYmVyID0gMC4wLCBwdWJsaWMgejogbnVtYmVyID0gMC4wKSB7fVxyXG5cclxuICAgIGFkZCh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56KSB9XHJcbiAgICBzdWJ0cmFjdCh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSwgdGhpcy56IC0gdi56KSB9XHJcbiAgICBtdWx0aXBseSh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56KSB9XHJcbiAgICBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsaXplKCk6IHZlYzMge1xyXG4gICAgICAgIGNvbnN0IGxlbiA9IE1hdGguaHlwb3QodGhpcy54LCB0aGlzLnksIHRoaXMueik7XHJcbiAgICAgICAgcmV0dXJuIGxlbiA+IDAgPyBuZXcgdmVjMyh0aGlzLnggLyBsZW4sIHRoaXMueSAvIGxlbiwgdGhpcy56IC8gbGVuKSA6IG5ldyB2ZWMzKCk7XHJcbiAgICB9XHJcbiAgICBjcm9zcyh2OiB2ZWMzKTogdmVjMyB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKFxyXG4gICAgICAgICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXHJcbiAgICAgICAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcclxuICAgICAgICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIGRvdCh2OiB2ZWMzKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYueiB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBxdWF0IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyB4OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB5OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB6OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB3OiBudW1iZXIgPSAxXHJcbiAgICApIHt9XHJcblxyXG4gICAgc2V0QXhpc0FuZ2xlKGF4aXM6IHZlYzMsIGFuZ2xlOiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBub3JtID0gYXhpcy5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCBoYWxmID0gYW5nbGUgLyAyO1xyXG4gICAgICAgIGNvbnN0IHMgPSBNYXRoLnNpbihoYWxmKTtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gbm9ybS54ICogcztcclxuICAgICAgICB0aGlzLnkgPSBub3JtLnkgKiBzO1xyXG4gICAgICAgIHRoaXMueiA9IG5vcm0ueiAqIHM7XHJcbiAgICAgICAgdGhpcy53ID0gTWF0aC5jb3MoaGFsZik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgbWF0NCB7XHJcbiAgICBwdWJsaWMgbWF0OiBGbG9hdDMyQXJyYXk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tYXQgPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcclxuICAgICAgICB0aGlzLmlkZW50aXR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWRlbnRpdHkoKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubWF0O1xyXG4gICAgICAgIG0uc2V0KFtcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvcHlGcm9tKG1hdDogbWF0NCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMubWF0LnNldChtYXQubWF0KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIC8qXHJcbiAgICAgKiAgeCwgIDAsICAwLCAwXHJcbiAgICAgKiAgMCwgIHksICAwLCAwXHJcbiAgICAgKiAgMCwgIDAsICB6LCAwXHJcbiAgICAgKiB0eCwgdHksIHR6LCAxXHJcbiAgICAgKi9cclxuICAgIG11bHRpcGx5KG90aGVyOiBtYXQ0KTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgYSA9IHRoaXMubWF0LCBiID0gb3RoZXIubWF0O1xyXG4gICAgICAgIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7ICsraSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7ICsraikge1xyXG4gICAgICAgICAgICAgICAgb3V0W2ogKiA0ICsgaV0gPVxyXG4gICAgICAgICAgICAgICAgYVswICogNCArIGldICogYltqICogNCArIDBdICtcclxuICAgICAgICAgICAgICAgIGFbMSAqIDQgKyBpXSAqIGJbaiAqIDQgKyAxXSArXHJcbiAgICAgICAgICAgICAgICBhWzIgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMl0gK1xyXG4gICAgICAgICAgICAgICAgYVszICogNCArIGldICogYltqICogNCArIDNdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1hdC5zZXQob3V0KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGVyc3BlY3RpdmUgbWF0cmljZSwgdGhlIGZhY3RvciBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIHRhbiBvZiB0aGUgRk9WIGRpdmlkZWQgYnkgMjpcclxuICAgICAqIFdlIGhhdmUgdGhlIG5lYXIgcGxhbmUgYW5kIGZhciBwbGFuZS4gKG9iamVjdHMgYXJlIGRyYXduIGluLWJldHdlZW4pXHJcbiAgICAgKiBhc3BlY3QgaXMgdGhlIGFzcGVjdC1yYXRpbyBsaWtlIDE2Ojkgb24gbW9zdCBzY3JlZW5zLlxyXG4gICAgICogV2UgY2hhbmdlIGVhY2ggdmVydGljZXMgeCwgeSBhbmQgeiBieSB0aGUgZm9sbG93aW5nOlxyXG4gICAgICogMCwgMCwgIDAsICAwXHJcbiAgICAgKiAwLCA1LCAgMCwgIDBcclxuICAgICAqIDAsIDAsIDEwLCAxMVxyXG4gICAgICogMCwgMCwgMTQsIDE1XHJcbiAgICAgKi9cclxuICAgIHNldFBlcnNwZWN0aXZlKGZvdlJhZDogbnVtYmVyLCBhc3BlY3Q6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IGYgPSAxLjAgLyBNYXRoLnRhbihmb3ZSYWQgLyAyKTtcclxuICAgICAgICBjb25zdCBuZiA9IDEgLyAobmVhciAtIGZhcik7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubWF0O1xyXG4gICAgICAgIG0uc2V0KFtcclxuICAgICAgICAgICAgZiAvIGFzcGVjdCwgICAgIDAsICAgICAgMCwgICAgICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgIDAsICAgICAgICAgICAgICBmLCAgICAgIDAsICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAwLCAgICAgICAgICAgICAgMCwgICAgICAoZmFyICsgbmVhcikgKiBuZiwgICAgICAtMSxcclxuICAgICAgICAgICAgMCwgICAgICAgICAgICAgIDAsICAgICAgMipmYXIqbmVhcipuZiwgICAgICAgICAgIDBcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRMb29rQXQoZXllOiB2ZWMzLCBjZW50ZXI6IHZlYzMsIHVwOiB2ZWMzKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgeiA9IGV5ZS5zdWJ0cmFjdChjZW50ZXIpLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IHggPSB1cC5jcm9zcyh6KS5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCB5ID0gei5jcm9zcyh4KTtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tYXQ7XHJcbiAgICAgICAgbS5zZXQoW1xyXG4gICAgICAgICAgICB4LngsICAgICAgICAgICAgeS54LCAgICAgICAgICAgIHoueCwgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICB4LnksICAgICAgICAgICAgeS55LCAgICAgICAgICAgIHoueSwgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICB4LnosICAgICAgICAgICAgeS56LCAgICAgICAgICAgIHoueiwgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAteC5kb3QoZXllKSwgICAgLXkuZG90KGV5ZSksICAgIC16LmRvdChleWUpLCAgICAxXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShxOiBxdWF0LCB2OiB2ZWMzLCBzOiB2ZWMzKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgeCA9IHEueCwgeSA9IHEueSwgeiA9IHEueiwgdyA9IHEudztcclxuICAgICAgICBjb25zdCBzeCA9IHMueCwgc3kgPSBzLnksIHN6ID0gcy56O1xyXG5cclxuICAgICAgICBjb25zdCB4MiA9IHggKyB4LCB5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xyXG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XHJcbiAgICAgICAgY29uc3QgeXkgPSB5ICogeTIsIHl6ID0geSAqIHoyLCB6eiA9IHogKiB6MjtcclxuICAgICAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hdDtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgICgxIC0gKHl5ICsgenopKSAqIHN4LCAgICAgICAgICh4eSArIHd6KSAqIHN4LCAgICAgICAoeHogLSB3eSkgKiBzeCwgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICh4eSAtIHd6KSAqIHN5LCAgICgxIC0gKHh4ICsgenopKSAqIHN5LCAgICAgICAoeXogKyB3eCkgKiBzeSwgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICh4eiArIHd5KSAqIHN6LCAgICAgICAgICh5eiAtIHd4KSAqIHN6LCAoMSAtICh4eCArIHl5KSkgKiBzeiwgICAgIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdi56LCAgICAgICAgICAgICAgICAgICAgdi55LCAgICAgICAgICAgICAgICAgIHYueiwgICAgIDFcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSIsIi8vXHJcbi8vIEZVTkNUSU9OXHJcbi8vXHJcblxyXG4vLyBEaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UgdG8gdGhlIEhUTUwgRWxlbWVudCB3aXRoIGlkIFwiZXJyb3JcIi5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvcihtc2c6IHN0cmluZyA9IFwiTm8gRGF0YVwiKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVycm9yXCIpO1xyXG4gICAgaWYoY29udGFpbmVyID09PSBudWxsKSByZXR1cm4gY29uc29sZS5sb2coXCJObyBFbGVtZW50IHdpdGggSUQ6IGVycm9yXCIpO1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gbXNnO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgY29uc29sZS5sb2cobXNnKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldExvZ1RpbWUodGFyZ2V0OiBzdHJpbmcsIG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBsZXQgY29udGFpbmVyID0gbnVsbDtcclxuICAgIGlmICh0YXJnZXQgPT0gXCJsb2FkaW5nXCIpIHtcclxuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmdcIik7XHJcbiAgICB9IGVsc2UgaWYgKHRhcmdldCA9PSBcImZwc1wiKSB7XHJcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGVzdFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBpZihjb250YWluZXIgPT09IG51bGwpIHJldHVybiBjb25zb2xlLmxvZyhgTm8gRWxlbWVudCB3aXRoIElEOiAke3RhcmdldH1gKVxyXG4gICAgY29uc3QgcCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCdwOm5vdCgudGl0bGUpJykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xyXG4gICAgaWYgKHApIHtcclxuICAgICAgICBwLmlubmVyVGV4dCA9IG1zZztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgICAgICBlbGVtZW50LmlubmVyVGV4dCA9IG1zZztcclxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNvbnNvbGUubG9nKGAke3RhcmdldH06ICR7bXNnfWApO1xyXG59XHJcblxyXG4vLyBHZXQgc2hhZGVycyBzb3VyY2UgY29kZS5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNoYWRlclNvdXJjZSh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciB3aGlsZSBsb2FkaW5nIHNoYWRlciBjb2RlIGF0IFwiJHt1cmx9XCI6ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJbWFnZSh1cmw6IHN0cmluZyk6IFByb21pc2U8SFRNTEltYWdlRWxlbWVudD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICBpbWFnZS5zcmMgPSB1cmw7XHJcbiAgICAgICAgaW1hZ2Uub25sb2FkID0gKCkgPT4gcmVzb2x2ZShpbWFnZSk7XHJcbiAgICB9KVxyXG59XHJcblxyXG4vLyBSZXR1cm4gdGhlIFdlYkdMIENvbnRleHQgZnJvbSB0aGUgQ2FudmFzIEVsZW1lbnQuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZXh0KGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IHtcclxuICAgIHJldHVybiBjYW52YXMuZ2V0Q29udGV4dCgnd2ViZ2wyJykgYXMgV2ViR0wyUmVuZGVyaW5nQ29udGV4dCA7XHJcbn1cclxuXHJcbi8vIENvbnZlcnQgZnJvbSBkZWdyZWVzIHRvIHJhZGlhbnQuXHJcbmV4cG9ydCBmdW5jdGlvbiB0b1JhZGlhbihhbmdsZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgIHJldHVybiBhbmdsZSAqIE1hdGguUEkgLyAxODA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBXZWJHTCBCdWZmZXIgdHlwZS4gKE9wYXF1ZSBIYW5kbGUpXHJcbiAqIC0gU1RBVElDX0RSQVcgOiB3b250IHVwZGF0ZSBvZnRlbiwgYnV0IG9mdGVuIHVzZWQuXHJcbiAqIC0gQVJSQVlfQlVGRkVSIDogaW5kaWNhdGUgdGhlIHBsYWNlIHRvIHN0b3JlIHRoZSBBcnJheS5cclxuICogLSBFTEVNRU5UX0FSUkFZX0JVRkZFUiA6IFVzZWQgZm9yIGluZGljZXMgd2l0aCBjdWJlIHNoYXBlcyBkcmF3aW5nLlxyXG4gKiBCaW5kIHRoZSBCdWZmZXIgdG8gdGhlIENQVSwgYWRkIHRoZSBBcnJheSB0byB0aGUgQnVmZmVyIGFuZCBDbGVhciBhZnRlciB1c2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdGljQnVmZmVyKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBkYXRhOiBBcnJheUJ1ZmZlciwgaXNJbmRpY2U6IGJvb2xlYW4pOiBXZWJHTEJ1ZmZlciB7XHJcbiAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIGNvbnN0IHR5cGUgPSAoaXNJbmRpY2UgPT0gdHJ1ZSkgPyBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiA6IGdsLkFSUkFZX0JVRkZFUlxyXG4gICAgaWYoIWJ1ZmZlcikgeyBcclxuICAgICAgICBzaG93RXJyb3IoXCJGYWlsZWQgdG8gYWxsb2NhdGUgYnVmZmVyIHNwYWNlXCIpOyBcclxuICAgICAgICByZXR1cm4gMDsgXHJcbiAgICB9XHJcblxyXG4gICAgZ2wuYmluZEJ1ZmZlcih0eXBlLCBidWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YSh0eXBlLCBkYXRhLCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIG51bGwpO1xyXG4gICAgcmV0dXJuIGJ1ZmZlclxyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIHZlcnRleCBhcnJheSBvYmplY3QgYnVmZmVycywgaXQgcmVhZCB0aGUgdmVydGljZXMgZnJvbSBHUFUgQnVmZmVyLlxyXG4gKiBUaGUgdmVydGV4IGJ1ZmZlciBjb250YWlucyB0aGUgdmVydGljZXMgY29vcmRpbmF0ZXMgKGNhbiBhbHNvIGNvbnRhaW5zIGNvbG9yIGFuZCBzaXplKS5cclxuICogVGhlIGluZGV4IGJ1ZmZlciBjb250YWlucyB3aWNoIHZlcnRleCBuZWVkIHRvIGJlIGRyYXduIG9uIHNjZW5lIHRvIGF2b2lkIGR1cGxpY2F0ZXMgdmVydGljZXMuXHJcbiAqIEluIGNhc2Ugb2YgY29sb3JzLCBhbiBvZmZzZXQgb2YgMyBmbG9hdHMgaXMgdXNlZCBlYWNoIHRpbWUgdG8gYXZvaWQgKHgsIHksIHopIGNvb3JkaW5hdGVzLlxyXG4gKiBUaGUgdmVydGV4IHNoYWRlciBwbGFjZSB0aGUgdmVydGljZXMgaW4gY2xpcCBzcGFjZSBhbmQgdGhlIGZyYWdtZW50IHNoYWRlciBjb2xvciB0aGUgcGl4ZWxzLiAoRGVmYXVsdDogMClcclxuICogVmVydGV4QXR0cmliUG9pbnRlciBbSW5kZXgsIFNpemUsIFR5cGUsIElzTm9ybWFsaXplZCwgU3RyaWRlLCBPZmZzZXRdXHJcbiAqIC0gSW5kZXggKGxvY2F0aW9uKVxyXG4gKiAtIFNpemUgKENvbXBvbmVudCBwZXIgdmVjdG9yKVxyXG4gKiAtIFR5cGVcclxuICogLSBJc05vcm1hbGl6ZWQgKGludCB0byBmbG9hdHMsIGZvciBjb2xvcnMgdHJhbnNmb3JtIFswLCAyNTVdIHRvIGZsb2F0IFswLCAxXSlcclxuICogLSBTdHJpZGUgKERpc3RhbmNlIGJldHdlZW4gZWFjaCB2ZXJ0ZXggaW4gdGhlIGJ1ZmZlcilcclxuICogLSBPZmZzZXQgKE51bWJlciBvZiBza2lwZWQgYnl0ZXMgYmVmb3JlIHJlYWRpbmcgYXR0cmlidXRlcylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWQU9CdWZmZXIoXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHZlcnRleEJ1ZmZlcjogV2ViR0xCdWZmZXIsIGluZGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgdXZCdWZmZXI6IFdlYkdMQnVmZmVyLFxyXG4gICAgcG9zQXR0cmliOiBudW1iZXIsIHV2QXR0cmliOiBudW1iZXJcclxuKTogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCB7XHJcbiAgICBjb25zdCB2YW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xyXG4gICAgaWYoIXZhbykgeyBzaG93RXJyb3IoXCJGYWlsZWQgdG8gYWxsb2NhdGUgVkFPIGJ1ZmZlci5cIik7IHJldHVybiAwOyB9XHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkodmFvKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHBvc0F0dHJpYik7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh1dkF0dHJpYik7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zQXR0cmliLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApOyAvLyBmb3JtYXQ6ICh4LCB5LCB6KSAoYWxsIGYzMilcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB1dkJ1ZmZlcik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHV2QXR0cmliLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhCdWZmZXIpO1xyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICByZXR1cm4gdmFvO1xyXG59XHJcblxyXG4vLyBDcmVhdGUgYSBwcm9ncmFtIGFuZCBsaW5rIHRoZSB2ZXJ0ZXggYW5kIGZyYWdtZW50IHNoYWRlciBzb3VyY2UgY29kZSB0byBpdC5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHZlcnRleFNoYWRlclNyYzogc3RyaW5nLFxyXG4gICAgZnJhZ21lbnRTaGFkZXJTcmM6IHN0cmluZ1xyXG4pOiBXZWJHTFByb2dyYW0ge1xyXG4gICAgY29uc3QgdmVydGV4U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpIGFzIFdlYkdMU2hhZGVyO1xyXG4gICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcclxuICAgIGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblxyXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydGV4U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydGV4U2hhZGVyKTtcclxuICAgIGlmKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodmVydGV4U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2UoZnJhZ21lbnRTaGFkZXIsIGZyYWdtZW50U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcihmcmFnbWVudFNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKGZyYWdtZW50U2hhZGVyKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm9ncmFtIHNldCB1cCBmb3IgVW5pZm9ybXMuXHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XHJcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgIGlmKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSk7XHJcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gcHJvZ3JhbSBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHByb2dyYW07XHJcbn0iLCIvLyBWZXJ0ZXggYnVmZmVyIGZvcm1hdDogWFlaXHJcblxyXG4vL1xyXG4vLyBDdWJlIGdlb21ldHJ5XHJcbi8vIHRha2VuIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJHTF9BUEkvVHV0b3JpYWwvQ3JlYXRpbmdfM0Rfb2JqZWN0c191c2luZ19XZWJHTFxyXG5leHBvcnQgY29uc3QgQ1VCRV9WRVJUSUNFUyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gIC8vIEZyb250IGZhY2VcclxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAwIEFcclxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxIEJcclxuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAyIENcclxuICAtMS4wLCAxLjAsIDEuMCwgICAvLyAzIERcclxuXHJcbiAgLy8gQmFjayBmYWNlXHJcbiAgLTEuMCwgLTEuMCwgLTEuMCwgLy8gNFxyXG4gIC0xLjAsIDEuMCwgLTEuMCwgIC8vIDVcclxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyA2XHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAgLy8gN1xyXG5cclxuICAvLyBUb3AgZmFjZVxyXG4gIC0xLjAsIDEuMCwgLTEuMCwgIC8vIDhcclxuICAtMS4wLCAxLjAsIDEuMCwgICAvLyA5XHJcbiAgMS4wLCAxLjAsIDEuMCwgICAgLy8gMTBcclxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAxMVxyXG5cclxuICAvLyBCb3R0b20gZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIC8vIDEyXHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAgLy8gMTNcclxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxNFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgIC8vIDE1XHJcblxyXG4gIC8vIFJpZ2h0IGZhY2VcclxuICAxLjAsIC0xLjAsIC0xLjAsICAvLyAxNlxyXG4gIDEuMCwgMS4wLCAtMS4wLCAgIC8vIDE3XHJcbiAgMS4wLCAxLjAsIDEuMCwgICAgLy8gMThcclxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxOVxyXG5cclxuICAvLyBMZWZ0IGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAvLyAyMFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgIC8vIDIxXHJcbiAgLTEuMCwgMS4wLCAxLjAsICAgLy8gMjJcclxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyAyM1xyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBDVUJFX0lORElDRVMgPSBuZXcgVWludDE2QXJyYXkoW1xyXG4gIDAsIDEsIDIsXHJcbiAgMCwgMiwgMywgLy8gZnJvbnRcclxuICA0LCA1LCA2LFxyXG4gIDQsIDYsIDcsIC8vIGJhY2tcclxuICA4LCA5LCAxMCxcclxuICA4LCAxMCwgMTEsIC8vIHRvcFxyXG4gIDEyLCAxMywgMTQsXHJcbiAgMTIsIDE0LCAxNSwgLy8gYm90dG9tXHJcbiAgMTYsIDE3LCAxOCxcclxuICAxNiwgMTgsIDE5LCAvLyByaWdodFxyXG4gIDIwLCAyMSwgMjIsXHJcbiAgMjAsIDIyLCAyMywgLy8gbGVmdFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBVVl9EQVRBID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gZnJvbnRcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBiYWNrXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gdG9wXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gYm90dG9tXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gcmlnaHRcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBsZWZ0XHJcbl0pIiwiaW1wb3J0ICogYXMgZm5jIGZyb20gXCIuL2Z1bmN0aW9uXCI7XHJcbmltcG9ydCAqIGFzIGNscyBmcm9tIFwiLi9jbGFzc1wiO1xyXG5pbXBvcnQgKiBhcyBnZW8gZnJvbSBcIi4vZ2VvbWV0cnlcIjtcclxuXHJcbi8vXHJcbi8vIE1BSU5cclxuLy9cclxuXHJcbmNvbnN0IFVQX1ZFQyA9IG5ldyBjbHMudmVjMygwLCAxLCAwKTtcclxuY29uc3QgVDAgPSBEYXRlLm5vdygpO1xyXG5jb25zdCBURVhUVVJFUyA9IFtcclxuICAgICcuL2ltZy9jYXRfb21nLnBuZycsXHJcbiAgICAnLi9pbWcvY2F0X3N0YXJlLnBuZydcclxuXVxyXG5jb25zdCBTRVRUSU5HUyA9IHtcclxuICAgIEZPViA6IDYwLjAsIC8vIERlZmF1bHQ6IDYwLjBcclxuICAgIFJPVEFUSU9OX0FOR0xFIDogMTAuMCwgLy8gRGVmYXVsdDogMTAuMFxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xyXG5cclxuICAgIFxyXG5cclxuICAgIC8vIENhbnZhcyBFbGVtZW50IGFuZCBSZW5kZXJpbmcgQ29udGV4dC5cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ2wtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY29uc3QgZ2wgPSBmbmMuZ2V0Q29udGV4dChjYW52YXMpO1xyXG5cclxuICAgIC8vIEN1YmUgdmVydGljZXMvaW5kaWNlcyBidWZmZXJzLlxyXG4gICAgY29uc3QgY3ViZVZlcnRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfVkVSVElDRVMsIGZhbHNlKTtcclxuICAgIGNvbnN0IGN1YmVJbmRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfSU5ESUNFUywgdHJ1ZSk7XHJcblxyXG4gICAgaWYgKCFjdWJlVmVydGljZXMgfHwgIWN1YmVJbmRpY2VzKSB7XHJcbiAgICAgICAgZm5jLnNob3dFcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSBnZW86IGN1YmU6ICh2PSR7ISFjdWJlVmVydGljZXN9IGk9JHtjdWJlSW5kaWNlc30pYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZldGNoIHNoYWRlcnMgY29kZSBhbmQgbGluayB0aGVtIHRvIGEgcHJvZ3JhbS5cclxuICAgIGNvbnN0IHZlcnRleFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy92ZXJ0ZXhfc2hhZGVyLnZlcnQnKTtcclxuICAgIGNvbnN0IGZyYWdtZW50U3JjID0gYXdhaXQgZm5jLmdldFNoYWRlclNvdXJjZSgnLi9zaGFkZXJzL2ZyYWdtZW50X3NoYWRlci5mcmFnJyk7XHJcbiAgICBjb25zdCBwcm9ncmFtID0gZm5jLmNyZWF0ZVByb2dyYW0oZ2wsIHZlcnRleFNyYywgZnJhZ21lbnRTcmMpO1xyXG5cclxuXHJcbiAgICAvLyBDcmVhdGUgYSB0ZXh0dXJlIGFuZCBiaW5kIG91ciBpbWFnZS5cclxuICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJEX0FSUkFZLCB0ZXh0dXJlKTtcclxuXHJcbiAgICAvLyBUYXJnZXQsIE1pcG1hcF9MZXZlbHMsIEludGVybmFsX0Zvcm1hdCwgV2lkdGgsIEhlaWdodCwgSW1hZ2VzX0NvdW50XHJcbiAgICBnbC50ZXhTdG9yYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMSwgZ2wuUkdCQTgsIDEyOCwgMTI4LCBURVhUVVJFUy5sZW5ndGgpO1xyXG5cclxuICAgIC8vIEZsaXAgdGhlIG9yaWdpbiBwb2ludCBvZiBXZWJHTC4gKFBORyBmb3JtYXQgc3RhcnQgYXQgdGhlIHRvcCBhbmQgV2ViR0wgYXQgdGhlIGJvdHRvbSlcclxuICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xyXG5cclxuICAgIC8vIEJlY2F1c2UgdGV4U3ViSW1hZ2UzRCBpcyBhc3luYywgd2FpdGluZyBmb3IgZWFjaCBpbWFnZSB0byBsb2FkIGlzIHNsb3cuIFNvLCB3ZSBwcmVsb2FkIGFsbCBpbWFnZXMgdXNpbmcgYSBQcm9taXNlLlxyXG4gICAgY29uc3QgaW1hZ2VzID0gYXdhaXQgUHJvbWlzZS5hbGwoVEVYVFVSRVMubWFwKHNyYyA9PiBmbmMuZ2V0SW1hZ2Uoc3JjKSkpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbWFnZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAvLyBUYXJnZXQsIE1pcG1hcF9MZXZlbCwgSW50ZXJuYWxfRm9ybWF0LCBXaWR0aCwgSGVpZ2h0LCBEZXB0aCwgQm9yZGVyLCBGb3JtYXQsIFR5cGUsIE9mZnNldFxyXG4gICAgICAgIGdsLnRleFN1YkltYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMCwgMCwgMCwgaSwgMTI4LCAxMjgsIDEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlc1tpXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hhbmdlIHRoZSBtaW5pbXVtIGFuZCBtYWduaXR1ZGUgZmlsdGVycyB3aGVuIHNjYWxpbmcgdXAgYW5kIGRvd24gdGV4dHVyZXMuXHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblxyXG4gICAgLy8gU3RhdGljIGJ1ZmZlciBmb3IgVVYgY29vcmRpbmF0ZXMuIE1pZ2h0IGJlIGNvbnN0YW50IHdpdGggdGV4dHVyZSBhcnJheXMuXHJcbiAgICBjb25zdCB0ZXhDb29yZHNCdWZmZXIgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uVVZfREFUQSwgZmFsc2UpO1xyXG5cclxuXHJcbiAgICBjb25zdCBUMSA9IERhdGUubm93KCk7XHJcbiAgICBmbmMuc2V0TG9nVGltZShcInRlc3RcIiwgYCR7RGF0ZS5ub3coKSAtIFQxfW1zYCk7XHJcblxyXG4gICAgLypcclxuICAgICogR2V0dGluZyB0aGUgYXR0cmlidXRlcyBmcm9tIHRoZSB2ZXJ0ZXggc2hhZGVyIGZpbGUuXHJcbiAgICAqIEF0dHJpYnV0ZXMgbG9jYXRpb25zIGNhbiBiZSBmb3JjZWQgaW4gdGhlIHZlcnRleCBzaGFkZXIgZmlsZSB3aXRoIChsb2NhdGlvbj1udW1iZXIpLlxyXG4gICAgKiBJZiBub3QgZm9yY2VkLCBXZWJHTCBnaXZlcyB0aGVtIGEgbnVtYmVyLCB5b3UgY2FuIGdldCB0aGlzIG51bWJlciB3aXRoIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkuXHJcbiAgICAqIEhlcmUsIGJlY2F1c2Ugd2Ugc2V0IG1hbnVhbGx5IHRoZSBhdHRyaWJ1dGUgbG9jYXRpb24gaW4gdGhlIHZlcnRleCBzaGFkZXIsXHJcbiAgICAqIHdlIGNhbiByZXBsYWNlIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkgd2l0aCB0aGUgKGxvY2F0aW9uPW51bWJlcikgbnVtYmVyLlxyXG4gICAgKi9cclxuICAgIGNvbnN0IHBvc2l0aW9uQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleFBvc2l0aW9uJyk7IC8vIGxvY2F0aW9uID0gMFxyXG4gICAgY29uc3QgdXZBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYVVWJyk7IC8vIGxvY2F0aW9uID0gMVxyXG4gICAgY29uc3QgZGVwdGhBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYURlcHRoJyk7IC8vIGxvY2F0aW9uID0gMlxyXG5cclxuICAgIC8vIFdlIGNhbiBub3Qgc3BlY2lmeSBVbmlmb3JtcyBsb2NhdGlvbnMgbWFudWFsbHkuIFdlIG5lZWQgdG8gZ2V0IHRoZW0gdXNpbmcgJ2dldFVuaWZvcm1Mb2NhdGlvbicuXHJcbiAgICBjb25zdCBtYXRXb3JsZFVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFdvcmxkJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcbiAgICBjb25zdCBtYXRWaWV3UHJvalVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFZpZXdQcm9qJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcbiAgICBjb25zdCBzYW1wbGVyVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAndVNhbXBsZXInKSBhcyBXZWJHTFVuaWZvcm1Mb2NhdGlvbjtcclxuXHJcbiAgICAvLyBUeXBlc2NyaXB0IHdhbnQgdG8gdmVyaWZ5IGlmIHRoZSB2YXJpYWJsZXMgYXJlIHNldCwgbm90IHRoZSBiZXN0IHdheSB0byBkbyBpdC5cclxuICAgIGlmKHBvc2l0aW9uQXR0cmlidXRlIDwgMCB8fCB1dkF0dHJpYnV0ZSA8IDAgfHwgZGVwdGhBdHRyaWJ1dGUgPCAwIHx8ICFtYXRXb3JsZFVuaWZvcm0gfHwgIW1hdFZpZXdQcm9qVW5pZm9ybSB8fCAhc2FtcGxlclVuaWZvcm0pIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gZ2V0IGF0dHJpYnMvdW5pZm9ybXMgKE1heDogJHtnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9BVFRSSUJTKX0pOiBgICtcclxuICAgICAgICAgICAgYCBwb3M9JHtwb3NpdGlvbkF0dHJpYnV0ZX1gICtcclxuICAgICAgICAgICAgYCB1dj0ke3V2QXR0cmlidXRlfWAgK1xyXG4gICAgICAgICAgICBgIGRlcHRoPSR7ZGVwdGhBdHRyaWJ1dGV9YCArXHJcbiAgICAgICAgICAgIGAgbWF0V29ybGQ9JHshIW1hdFdvcmxkVW5pZm9ybX1gICtcclxuICAgICAgICAgICAgYCBtYXRWaWV3UHJvaj0keyEhbWF0Vmlld1Byb2pVbmlmb3JtfWAgK1xyXG4gICAgICAgICAgICBgIHNhbXBsZXI9JHshIXNhbXBsZXJVbmlmb3JtfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb250cm9sIHRoZSBkZXB0aCBvZiB0aGUgdGV4dHVyZSBhcnJheS4gUGlja2luZyBvdXIgZGlzcGxheWVkIHRleHR1cmUuXHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWIxZihkZXB0aEF0dHJpYnV0ZSwgMCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIG91ciB2ZXJ0ZXggYXJyYXkgb2JqZWN0IChWQU9zKSBidWZmZXJzLlxyXG4gICAgY29uc3QgY3ViZVZBTyA9IGZuYy5jcmVhdGVWQU9CdWZmZXIoZ2wsIGN1YmVWZXJ0aWNlcywgY3ViZUluZGljZXMsIHRleENvb3Jkc0J1ZmZlciwgcG9zaXRpb25BdHRyaWJ1dGUsIHV2QXR0cmlidXRlKTtcclxuICAgIGlmKCFjdWJlVkFPKSByZXR1cm4gZm5jLnNob3dFcnJvcihgRmFpbGVzIHRvIGNyZWF0ZSBWQU9zOiBjdWJlPSR7ISFjdWJlVkFPfWApO1xyXG5cclxuICAgIGxldCByYW5kb20gPSBuZXcgY2xzLnZlYzMoTWF0aC5yYW5kb20oKSAqIDEsIE1hdGgucmFuZG9tKCkgKiAxLCBNYXRoLnJhbmRvbSgpICogMSk7XHJcblxyXG4gICAgLy8gU3RvcmUgb3VyIGN1YmVzLCBkcmF3IHRoZW0gZWFjaCB0aW1lLiAoYSBsb3Qgb2YgZHJhdyBjYWxscylcclxuICAgIGNvbnN0IGN1YmVzID0gW1xyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDAsIDAuNCwgMCksIDAuNCwgVVBfVkVDLCAwLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksIC8vIENlbnRlclxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUocmFuZG9tLCAwLjMsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDIwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDEsIDAuMSwgLTEpLCAwLjEsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDQwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKC0xLCAwLjE1LCAxKSwgMC4xNSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoLTEsIDAuMiwgLTEpLCAwLjIsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDgwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgXTtcclxuXHJcbiAgICBsZXQgbWF0VmlldyA9IG5ldyBjbHMubWF0NCgpO1xyXG4gICAgbGV0IG1hdFByb2ogPSBuZXcgY2xzLm1hdDQoKTtcclxuICAgIGxldCBtYXRWaWV3UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xyXG5cclxuICAgIGxldCBjYW1lcmFBbmdsZSA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIGZ1bmN0aW9uIHRvIGNhbGwgaXQgZWFjaCBmcmFtZS5cclxuICAgICAqIC0gT3V0cHV0IE1lcmdlcjogTWVyZ2UgdGhlIHNoYWRlZCBwaXhlbCBmcmFnbWVudCB3aXRoIHRoZSBleGlzdGluZyByZXN1bHQgaW1hZ2UuXHJcbiAgICAgKiAtIFJhc3Rlcml6ZXI6IFdpY2ggcGl4ZWwgYXJlIHBhcnQgb2YgdGhlIFZlcnRpY2VzICsgV2ljaCBwYXJ0IGlzIG1vZGlmaWVkIGJ5IFdlYkdMLlxyXG4gICAgICogLSBHUFUgUHJvZ3JhbTogUGFpciBWZXJ0ZXggJiBGcmFnbWVudCBzaGFkZXJzLlxyXG4gICAgICogLSBTZXQgVW5pZm9ybXMgKGNhbiBiZSBzZXQgYW55d2hlcmUpXHJcbiAgICAgKiAtIERyYXcgQ2FsbHMgKHcvIFByaW1pdGl2ZSBhc3NlbWJseSArIGZvciBsb29wKVxyXG4gICAgICovXHJcbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgIC8vIFJhbmRvbWl6ZSBjdWJlIHJvdGF0aW9uIHNwZWVkIGVhY2ggdGltZS5cclxuICAgIGxldCByZG0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODApO1xyXG5cclxuICAgIGNvbnN0IGZyYW1lID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBkdCAoZGVsdGEgdGltZSkgd2l0aCB0aW1lIGluIHNlY29uZHMgYmV0d2VlbiBlYWNoIGZyYW1lLlxyXG4gICAgICAgIGNvbnN0IHRoaXNGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBjb25zdCBkdCA9ICh0aGlzRnJhbWVUaW1lIC0gbGFzdEZyYW1lVGltZSkgLyAxMDAwO1xyXG4gICAgICAgIGxhc3RGcmFtZVRpbWUgPSB0aGlzRnJhbWVUaW1lO1xyXG5cclxuICAgICAgICAvLyBFYWNoIGZyYW1lIGFkZCAxMMKwIHRvIHRoZSBjYW1lcmEgYW5nbGUuXHJcbiAgICAgICAgY2FtZXJhQW5nbGUgKz0gZHQgKiBmbmMudG9SYWRpYW4oMTApO1xyXG5cclxuICAgICAgICAvLyBGaXhlZCBjYW1lcmEgY29vcmRpbmF0ZXMuXHJcbiAgICAgICAgY29uc3QgY2FtZXJhWCA9IDMgKiBNYXRoLnNpbihjYW1lcmFBbmdsZSk7XHJcbiAgICAgICAgY29uc3QgY2FtZXJhWiA9IDMgKiBNYXRoLmNvcyhjYW1lcmFBbmdsZSk7XHJcblxyXG4gICAgICAgIC8vIE1ha2UgdGhlICdjYW1lcmEnIGxvb2sgYXQgdGhlIGNlbnRlci5cclxuICAgICAgICBtYXRWaWV3LnNldExvb2tBdChcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKGNhbWVyYVgsIDEsIGNhbWVyYVopLFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoMCwgMCwgMCksXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAxLCAwKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gU2V0IHRoZSBjYW1lcmEgRk9WLCBzY3JlZW4gc2l6ZSBhbmQgdmlldyBkaXN0YW5jZS5cclxuICAgICAgICBtYXRQcm9qLnNldFBlcnNwZWN0aXZlKFxyXG4gICAgICAgICAgICBmbmMudG9SYWRpYW4oU0VUVElOR1MuRk9WKSwgLy8gRk9WXHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCAvIGNhbnZhcy5oZWlnaHQsIC8vIEFTUEVDVCBSQVRJT1xyXG4gICAgICAgICAgICAwLjEsIDEwMC4wIC8vIFotTkVBUiAvIFotRkFSXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gR0xNOiBtYXRWaWV3UHJvaiA9IG1hdFByb2ogKiBtYXRWaWV3XHJcbiAgICAgICAgbWF0Vmlld1Byb2ogPSBtYXRQcm9qLm11bHRpcGx5KG1hdFZpZXcpO1xyXG5cclxuICAgICAgICAvLyBSZW5kZXJcclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpbztcclxuXHJcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAyLCAwLjAyLCAwLjAyLCAxKTtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xyXG4gICAgICAgIGdsLmZyb250RmFjZShnbC5DQ1cpO1xyXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRWaWV3UHJvalVuaWZvcm0sIGZhbHNlLCBtYXRWaWV3UHJvai5tYXQpO1xyXG5cclxuXHJcbiAgICAgICAgY3ViZXMuZm9yRWFjaCgoY3ViZSwgaW5kZXgpID0+IHtcclxuICAgICAgICAgICAgLy8gVGhlIGNlbnRlciBjdWJlIGRvIG5vdCByb3RhdGUgb24gaXRzZWxmLlxyXG4gICAgICAgICAgICBpZiAoaW5kZXggPT0gMCkgeyBjdWJlLmRyYXcoZ2wsIG1hdFdvcmxkVW5pZm9ybSk7IHJldHVybiB9IFxyXG4gICAgICAgICAgICBjdWJlLnJvdGF0ZShkdCAqIGZuYy50b1JhZGlhbihyZG0pKTtcclxuICAgICAgICAgICAgY3ViZS5kcmF3KGdsLCBtYXRXb3JsZFVuaWZvcm0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIExvb3AgY2FsbHMsIGVhY2ggdGltZSB0aGUgZHJhd2luZyBpcyByZWFkeS5cclxuICAgICAgICBmbmMuc2V0TG9nVGltZShcImZwc1wiLCBgJHtNYXRoLmNlaWwoZHQpfW1zYCk7XHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxuICAgIH07XHJcbiAgICAvLyBGaXJzdCBjYWxsLCBhcyBzb29uLCBhcyB0aGUgcGFnZSBpcyBsb2FkZWQuXHJcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gICAgZm5jLnNldExvZ1RpbWUoXCJsb2FkaW5nXCIsIGAkeyBEYXRlLm5vdygpIC0gVDAgfW1zYCk7XHJcbn1cclxuXHJcbmZuYy5zaG93RXJyb3IoXCJObyBFcnJvcnMhIPCfjJ5cIik7XHJcblxyXG50cnkgeyBtYWluKCk7IH0gY2F0Y2goZSkgeyBmbmMuc2hvd0Vycm9yKGBVbmNhdWdodCBleGNlcHRpb246ICR7ZX1gKTsgfSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9tYWluLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9