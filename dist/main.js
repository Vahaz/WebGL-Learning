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
        gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld.m);
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
        this.m = new Float32Array(16);
        this.identity();
    }
    identity() {
        const m = this.m;
        m.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }
    copyFrom(mat) {
        this.m.set(mat.m);
        return this;
    }
    /**
     *  x,  0,  0, 0
     *  0,  y,  0, 0
     *  0,  0,  z, 0
     * tx, ty, tz, 1
     */
    multiply(other) {
        const a = this.m, b = other.m;
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
        this.m.set(out);
        return this;
    }
    /**
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
        const m = this.m;
        m[0] = f / aspect;
        m[1] = 0;
        m[2] = 0;
        m[3] = 0;
        m[4] = 0;
        m[5] = f;
        m[6] = 0;
        m[7] = 0;
        m[8] = 0;
        m[9] = 0;
        m[10] = (far + near) * nf;
        m[11] = -1;
        m[12] = 0;
        m[13] = 0;
        m[14] = 2 * far * near * nf;
        m[15] = 0;
        return this;
    }
    setLookAt(eye, center, up) {
        const z = eye.subtract(center).normalize();
        const x = up.cross(z).normalize();
        const y = z.cross(x);
        const m = this.m;
        m[0] = x.x;
        m[1] = y.x;
        m[2] = z.x;
        m[3] = 0;
        m[4] = x.y;
        m[5] = y.y;
        m[6] = z.y;
        m[7] = 0;
        m[8] = x.z;
        m[9] = y.z;
        m[10] = z.z;
        m[11] = 0;
        m[12] = -x.dot(eye);
        m[13] = -y.dot(eye);
        m[14] = -z.dot(eye);
        m[15] = 1;
        return this;
    }
    setFromRotationTranslationScale(q, v, s) {
        const x = q.x, y = q.y, z = q.z, w = q.w;
        const sx = s.x, sy = s.y, sz = s.z;
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        const m = this.m;
        m[0] = (1 - (yy + zz)) * sx;
        m[1] = (xy + wz) * sx;
        m[2] = (xz - wy) * sx;
        m[3] = 0;
        m[4] = (xy - wz) * sy;
        m[5] = (1 - (xx + zz)) * sy;
        m[6] = (yz + wx) * sy;
        m[7] = 0;
        m[8] = (xz + wy) * sz;
        m[9] = (yz - wx) * sz;
        m[10] = (1 - (xx + yy)) * sz;
        m[11] = 0;
        m[12] = v.x;
        m[13] = v.y;
        m[14] = v.z;
        m[15] = 1;
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
            gl.uniformMatrix4fv(matViewProjUniform, false, matViewProj.m);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUNyRixHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxTQUFTO1FBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyRixDQUFDO0lBQ0QsS0FBSyxDQUFDLENBQU87UUFDVCxPQUFPLElBQUksSUFBSSxDQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzlCLENBQUM7SUFDTixDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQU8sSUFBWSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENB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QUNULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVYLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFTLEVBQUUsTUFBWSxFQUFFLEVBQVE7UUFDdkMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVqQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELCtCQUErQixDQUFDLENBQU8sRUFBRSxDQUFPLEVBQUUsQ0FBTztRQUNyRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFD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QyxDQUFDO2dCQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUNILDhDQUE4QztZQUM5QyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsRUFBQztRQUNGLDhDQUE4QztRQUM5QyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxHQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FBQTtBQUVELEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFL0IsSUFBSSxDQUFDO0lBQUMsSUFBSSxFQUFFLENBQUM7QUFBQyxDQUFDO0FBQUMsT0FBTSxDQUFDLEVBQUUsQ0FBQztJQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxDQUFDOzs7Ozs7O1VDcE12RTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvY2xhc3MudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZnVuY3Rpb24udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZ2VvbWV0cnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy9cclxuLy8gQ0xBU1NcclxuLy9cclxuXHJcbmV4cG9ydCBjbGFzcyBTaGFwZSB7XHJcbiAgICBwcml2YXRlIG1hdFdvcmxkID0gbmV3IG1hdDQoKTtcclxuICAgIHByaXZhdGUgc2NhbGVWZWMgPSBuZXcgdmVjMygpO1xyXG4gICAgcHJpdmF0ZSByb3RhdGlvbiA9IG5ldyBxdWF0KCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBwb3M6IHZlYzMsXHJcbiAgICAgICAgcHJpdmF0ZSBzY2FsZTogbnVtYmVyLFxyXG4gICAgICAgIHByaXZhdGUgcm90YXRpb25BeGlzOiB2ZWMzLFxyXG4gICAgICAgIHByaXZhdGUgcm90YXRpb25BbmdsZTogbnVtYmVyLFxyXG4gICAgICAgIHB1YmxpYyByZWFkb25seSB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3QsXHJcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IG51bUluZGljZXM6IG51bWJlclxyXG4gICAgKSB7IH1cclxuXHJcbiAgICByb3RhdGUoYW5nbGU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMucm90YXRpb25BbmdsZSA9IHRoaXMucm90YXRpb25BbmdsZSArIGFuZ2xlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIG1hdFdvcmxkVW5pZm9ybTogV2ViR0xVbmlmb3JtTG9jYXRpb24pIHtcclxuICAgICAgICB0aGlzLnJvdGF0aW9uLnNldEF4aXNBbmdsZSh0aGlzLnJvdGF0aW9uQXhpcywgdGhpcy5yb3RhdGlvbkFuZ2xlKTtcclxuICAgICAgICB0aGlzLnNjYWxlVmVjLnNldCh0aGlzLnNjYWxlLCB0aGlzLnNjYWxlLCB0aGlzLnNjYWxlKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXRXb3JsZC5zZXRGcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHRoaXMucm90YXRpb24sIHRoaXMucG9zLCB0aGlzLnNjYWxlVmVjKTtcclxuXHJcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRXb3JsZFVuaWZvcm0sIGZhbHNlLCB0aGlzLm1hdFdvcmxkLm0pO1xyXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XHJcbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgdGhpcy5udW1JbmRpY2VzLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcbiAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyB2ZWMzIHtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIgPSAwLjAsIHB1YmxpYyB5OiBudW1iZXIgPSAwLjAsIHB1YmxpYyB6OiBudW1iZXIgPSAwLjApIHt9XHJcblxyXG4gICAgYWRkKHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnopIH1cclxuICAgIHN1YnRyYWN0KHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnopIH1cclxuICAgIG11bHRpcGx5KHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCAqIHYueCwgdGhpcy55ICogdi55LCB0aGlzLnogKiB2LnopIH1cclxuICAgIHNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMueiA9IHo7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBub3JtYWxpemUoKTogdmVjMyB7XHJcbiAgICAgICAgY29uc3QgbGVuID0gTWF0aC5oeXBvdCh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuICAgICAgICByZXR1cm4gbGVuID4gMCA/IG5ldyB2ZWMzKHRoaXMueCAvIGxlbiwgdGhpcy55IC8gbGVuLCB0aGlzLnogLyBsZW4pIDogbmV3IHZlYzMoKTtcclxuICAgIH1cclxuICAgIGNyb3NzKHY6IHZlYzMpOiB2ZWMzIHtcclxuICAgICAgICByZXR1cm4gbmV3IHZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMueSAqIHYueiAtIHRoaXMueiAqIHYueSxcclxuICAgICAgICAgICAgdGhpcy56ICogdi54IC0gdGhpcy54ICogdi56LFxyXG4gICAgICAgICAgICB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2LnhcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgZG90KHY6IHZlYzMpOiBudW1iZXIgeyByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56IH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIHF1YXQge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIHg6IG51bWJlciA9IDAsXHJcbiAgICAgICAgcHVibGljIHk6IG51bWJlciA9IDAsXHJcbiAgICAgICAgcHVibGljIHo6IG51bWJlciA9IDAsXHJcbiAgICAgICAgcHVibGljIHc6IG51bWJlciA9IDFcclxuICAgICkge31cclxuXHJcbiAgICBzZXRBeGlzQW5nbGUoYXhpczogdmVjMywgYW5nbGU6IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IG5vcm0gPSBheGlzLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IGhhbGYgPSBhbmdsZSAvIDI7XHJcbiAgICAgICAgY29uc3QgcyA9IE1hdGguc2luKGhhbGYpO1xyXG5cclxuICAgICAgICB0aGlzLnggPSBub3JtLnggKiBzO1xyXG4gICAgICAgIHRoaXMueSA9IG5vcm0ueSAqIHM7XHJcbiAgICAgICAgdGhpcy56ID0gbm9ybS56ICogcztcclxuICAgICAgICB0aGlzLncgPSBNYXRoLmNvcyhoYWxmKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBtYXQ0IHtcclxuICAgIHB1YmxpYyBtOiBGbG9hdDMyQXJyYXk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5tID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XHJcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlkZW50aXR5KCk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcbiAgICAgICAgbS5zZXQoW1xyXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgY29weUZyb20obWF0OiBtYXQ0KTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5tLnNldChtYXQubSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqICB4LCAgMCwgIDAsIDBcclxuICAgICAqICAwLCAgeSwgIDAsIDBcclxuICAgICAqICAwLCAgMCwgIHosIDBcclxuICAgICAqIHR4LCB0eSwgdHosIDFcclxuICAgICAqL1xyXG4gICAgbXVsdGlwbHkob3RoZXI6IG1hdDQpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBhID0gdGhpcy5tLCBiID0gb3RoZXIubTtcclxuICAgICAgICBjb25zdCBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA0OyArK2opIHtcclxuICAgICAgICAgICAgICAgIG91dFtqICogNCArIGldID1cclxuICAgICAgICAgICAgICAgIGFbMCAqIDQgKyBpXSAqIGJbaiAqIDQgKyAwXSArXHJcbiAgICAgICAgICAgICAgICBhWzEgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMV0gK1xyXG4gICAgICAgICAgICAgICAgYVsyICogNCArIGldICogYltqICogNCArIDJdICtcclxuICAgICAgICAgICAgICAgIGFbMyAqIDQgKyBpXSAqIGJbaiAqIDQgKyAzXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tLnNldChvdXQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUGVyc3BlY3RpdmUgbWF0cmljZSwgdGhlIGZhY3RvciBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIHRhbiBvZiB0aGUgRk9WIGRpdmlkZWQgYnkgMjpcclxuICAgICAqIFdlIGhhdmUgdGhlIG5lYXIgcGxhbmUgYW5kIGZhciBwbGFuZS4gKG9iamVjdHMgYXJlIGRyYXduIGluLWJldHdlZW4pXHJcbiAgICAgKiBhc3BlY3QgaXMgdGhlIGFzcGVjdC1yYXRpbyBsaWtlIDE2Ojkgb24gbW9zdCBzY3JlZW5zLlxyXG4gICAgICogV2UgY2hhbmdlIGVhY2ggdmVydGljZXMgeCwgeSBhbmQgeiBieSB0aGUgZm9sbG93aW5nOlxyXG4gICAgICogMCwgMCwgIDAsICAwXHJcbiAgICAgKiAwLCA1LCAgMCwgIDBcclxuICAgICAqIDAsIDAsIDEwLCAxMVxyXG4gICAgICogMCwgMCwgMTQsIDE1XHJcbiAgICAgKi9cclxuICAgIHNldFBlcnNwZWN0aXZlKGZvdlJhZDogbnVtYmVyLCBhc3BlY3Q6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IGYgPSAxLjAgLyBNYXRoLnRhbihmb3ZSYWQgLyAyKTtcclxuICAgICAgICBjb25zdCBuZiA9IDEgLyAobmVhciAtIGZhcik7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcclxuXHJcbiAgICAgICAgbVswXSA9IGYgLyBhc3BlY3Q7XHJcbiAgICAgICAgbVsxXSA9IDA7XHJcbiAgICAgICAgbVsyXSA9IDA7XHJcbiAgICAgICAgbVszXSA9IDA7XHJcblxyXG4gICAgICAgIG1bNF0gPSAwO1xyXG4gICAgICAgIG1bNV0gPSBmO1xyXG4gICAgICAgIG1bNl0gPSAwO1xyXG4gICAgICAgIG1bN10gPSAwO1xyXG5cclxuICAgICAgICBtWzhdID0gMDtcclxuICAgICAgICBtWzldID0gMDtcclxuICAgICAgICBtWzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xyXG4gICAgICAgIG1bMTFdID0gLTE7XHJcblxyXG4gICAgICAgIG1bMTJdID0gMDtcclxuICAgICAgICBtWzEzXSA9IDA7XHJcbiAgICAgICAgbVsxNF0gPSAyICogZmFyICogbmVhciAqIG5mO1xyXG4gICAgICAgIG1bMTVdID0gMDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TG9va0F0KGV5ZTogdmVjMywgY2VudGVyOiB2ZWMzLCB1cDogdmVjMyk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IHogPSBleWUuc3VidHJhY3QoY2VudGVyKS5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCB4ID0gdXAuY3Jvc3Moeikubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgeSA9IHouY3Jvc3MoeCk7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcclxuXHJcbiAgICAgICAgbVswXSA9IHgueDtcclxuICAgICAgICBtWzFdID0geS54O1xyXG4gICAgICAgIG1bMl0gPSB6Lng7XHJcbiAgICAgICAgbVszXSA9IDA7XHJcblxyXG4gICAgICAgIG1bNF0gPSB4Lnk7XHJcbiAgICAgICAgbVs1XSA9IHkueTtcclxuICAgICAgICBtWzZdID0gei55O1xyXG4gICAgICAgIG1bN10gPSAwO1xyXG5cclxuICAgICAgICBtWzhdID0geC56O1xyXG4gICAgICAgIG1bOV0gPSB5Lno7XHJcbiAgICAgICAgbVsxMF0gPSB6Lno7XHJcbiAgICAgICAgbVsxMV0gPSAwO1xyXG5cclxuICAgICAgICBtWzEyXSA9IC14LmRvdChleWUpO1xyXG4gICAgICAgIG1bMTNdID0gLXkuZG90KGV5ZSk7XHJcbiAgICAgICAgbVsxNF0gPSAtei5kb3QoZXllKTtcclxuICAgICAgICBtWzE1XSA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUocTogcXVhdCwgdjogdmVjMywgczogdmVjMyk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IHggPSBxLngsIHkgPSBxLnksIHogPSBxLnosIHcgPSBxLnc7XHJcbiAgICAgICAgY29uc3Qgc3ggPSBzLngsIHN5ID0gcy55LCBzeiA9IHMuejtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4ICsgeCwgeTIgPSB5ICsgeSwgejIgPSB6ICsgejtcclxuICAgICAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xyXG4gICAgICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XHJcbiAgICAgICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcclxuXHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcclxuXHJcbiAgICAgICAgbVswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xyXG4gICAgICAgIG1bMV0gPSAoeHkgKyB3eikgKiBzeDtcclxuICAgICAgICBtWzJdID0gKHh6IC0gd3kpICogc3g7XHJcbiAgICAgICAgbVszXSA9IDA7XHJcblxyXG4gICAgICAgIG1bNF0gPSAoeHkgLSB3eikgKiBzeTtcclxuICAgICAgICBtWzVdID0gKDEgLSAoeHggKyB6eikpICogc3k7XHJcbiAgICAgICAgbVs2XSA9ICh5eiArIHd4KSAqIHN5O1xyXG4gICAgICAgIG1bN10gPSAwO1xyXG5cclxuICAgICAgICBtWzhdID0gKHh6ICsgd3kpICogc3o7XHJcbiAgICAgICAgbVs5XSA9ICh5eiAtIHd4KSAqIHN6O1xyXG4gICAgICAgIG1bMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XHJcbiAgICAgICAgbVsxMV0gPSAwO1xyXG5cclxuICAgICAgICBtWzEyXSA9IHYueDtcclxuICAgICAgICBtWzEzXSA9IHYueTtcclxuICAgICAgICBtWzE0XSA9IHYuejtcclxuICAgICAgICBtWzE1XSA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59IiwiLy9cclxuLy8gRlVOQ1RJT05cclxuLy9cclxuXHJcbi8vIERpc3BsYXkgYW4gZXJyb3IgbWVzc2FnZSB0byB0aGUgSFRNTCBFbGVtZW50IHdpdGggaWQgXCJlcnJvclwiLlxyXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yKG1zZzogc3RyaW5nID0gXCJObyBEYXRhXCIpOiB2b2lkIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXJyb3JcIik7XHJcbiAgICBpZihjb250YWluZXIgPT09IG51bGwpIHJldHVybiBjb25zb2xlLmxvZyhcIk5vIEVsZW1lbnQgd2l0aCBJRDogZXJyb3JcIik7XHJcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgZWxlbWVudC5pbm5lclRleHQgPSBtc2c7XHJcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XHJcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0TG9nVGltZSh0YXJnZXQ6IHN0cmluZywgbXNnOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGxldCBjb250YWluZXIgPSBudWxsO1xyXG4gICAgaWYgKHRhcmdldCA9PSBcImxvYWRpbmdcIikge1xyXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZ1wiKTtcclxuICAgIH0gZWxzZSBpZiAodGFyZ2V0ID09IFwiZnBzXCIpIHtcclxuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc1wiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0ZXN0XCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKGBObyBFbGVtZW50IHdpdGggSUQ6ICR7dGFyZ2V0fWApXHJcbiAgICBjb25zdCBwID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJ3A6bm90KC50aXRsZSknKSBhcyBIVE1MRWxlbWVudCB8IG51bGw7XHJcbiAgICBpZiAocCkge1xyXG4gICAgICAgIHAuaW5uZXJUZXh0ID0gbXNnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xyXG4gICAgICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gbXNnO1xyXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY29uc29sZS5sb2coYCR7dGFyZ2V0fTogJHttc2d9YCk7XHJcbn1cclxuXHJcbi8vIEdldCBzaGFkZXJzIHNvdXJjZSBjb2RlLlxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2hhZGVyU291cmNlKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGxvYWRpbmcgc2hhZGVyIGNvZGUgYXQgXCIke3VybH1cIjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEltYWdlKHVybDogc3RyaW5nKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIGltYWdlLnNyYyA9IHVybDtcclxuICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltYWdlKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vIFJldHVybiB0aGUgV2ViR0wgQ29udGV4dCBmcm9tIHRoZSBDYW52YXMgRWxlbWVudC5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHQoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xyXG4gICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IDtcclxufVxyXG5cclxuLy8gQ29udmVydCBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFudC5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGFuZ2xlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGFuZ2xlICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIFdlYkdMIEJ1ZmZlciB0eXBlLiAoT3BhcXVlIEhhbmRsZSlcclxuICogLSBTVEFUSUNfRFJBVyA6IHdvbnQgdXBkYXRlIG9mdGVuLCBidXQgb2Z0ZW4gdXNlZC5cclxuICogLSBBUlJBWV9CVUZGRVIgOiBpbmRpY2F0ZSB0aGUgcGxhY2UgdG8gc3RvcmUgdGhlIEFycmF5LlxyXG4gKiAtIEVMRU1FTlRfQVJSQVlfQlVGRkVSIDogVXNlZCBmb3IgaW5kaWNlcyB3aXRoIGN1YmUgc2hhcGVzIGRyYXdpbmcuXHJcbiAqIEJpbmQgdGhlIEJ1ZmZlciB0byB0aGUgQ1BVLCBhZGQgdGhlIEFycmF5IHRvIHRoZSBCdWZmZXIgYW5kIENsZWFyIGFmdGVyIHVzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGF0aWNCdWZmZXIoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGRhdGE6IEFycmF5QnVmZmVyLCBpc0luZGljZTogYm9vbGVhbik6IFdlYkdMQnVmZmVyIHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgY29uc3QgdHlwZSA9IChpc0luZGljZSA9PSB0cnVlKSA/IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSIDogZ2wuQVJSQVlfQlVGRkVSXHJcbiAgICBpZighYnVmZmVyKSB7IFxyXG4gICAgICAgIHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBidWZmZXIgc3BhY2VcIik7IFxyXG4gICAgICAgIHJldHVybiAwOyBcclxuICAgIH1cclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIGJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgbnVsbCk7XHJcbiAgICByZXR1cm4gYnVmZmVyXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgdmVydGV4IGFycmF5IG9iamVjdCBidWZmZXJzLCBpdCByZWFkIHRoZSB2ZXJ0aWNlcyBmcm9tIEdQVSBCdWZmZXIuXHJcbiAqIFRoZSB2ZXJ0ZXggYnVmZmVyIGNvbnRhaW5zIHRoZSB2ZXJ0aWNlcyBjb29yZGluYXRlcyAoY2FuIGFsc28gY29udGFpbnMgY29sb3IgYW5kIHNpemUpLlxyXG4gKiBUaGUgaW5kZXggYnVmZmVyIGNvbnRhaW5zIHdpY2ggdmVydGV4IG5lZWQgdG8gYmUgZHJhd24gb24gc2NlbmUgdG8gYXZvaWQgZHVwbGljYXRlcyB2ZXJ0aWNlcy5cclxuICogSW4gY2FzZSBvZiBjb2xvcnMsIGFuIG9mZnNldCBvZiAzIGZsb2F0cyBpcyB1c2VkIGVhY2ggdGltZSB0byBhdm9pZCAoeCwgeSwgeikgY29vcmRpbmF0ZXMuXHJcbiAqIFRoZSB2ZXJ0ZXggc2hhZGVyIHBsYWNlIHRoZSB2ZXJ0aWNlcyBpbiBjbGlwIHNwYWNlIGFuZCB0aGUgZnJhZ21lbnQgc2hhZGVyIGNvbG9yIHRoZSBwaXhlbHMuIChEZWZhdWx0OiAwKVxyXG4gKiBWZXJ0ZXhBdHRyaWJQb2ludGVyIFtJbmRleCwgU2l6ZSwgVHlwZSwgSXNOb3JtYWxpemVkLCBTdHJpZGUsIE9mZnNldF1cclxuICogLSBJbmRleCAobG9jYXRpb24pXHJcbiAqIC0gU2l6ZSAoQ29tcG9uZW50IHBlciB2ZWN0b3IpXHJcbiAqIC0gVHlwZVxyXG4gKiAtIElzTm9ybWFsaXplZCAoaW50IHRvIGZsb2F0cywgZm9yIGNvbG9ycyB0cmFuc2Zvcm0gWzAsIDI1NV0gdG8gZmxvYXQgWzAsIDFdKVxyXG4gKiAtIFN0cmlkZSAoRGlzdGFuY2UgYmV0d2VlbiBlYWNoIHZlcnRleCBpbiB0aGUgYnVmZmVyKVxyXG4gKiAtIE9mZnNldCAoTnVtYmVyIG9mIHNraXBlZCBieXRlcyBiZWZvcmUgcmVhZGluZyBhdHRyaWJ1dGVzKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZBT0J1ZmZlcihcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgaW5kZXhCdWZmZXI6IFdlYkdMQnVmZmVyLCB1dkJ1ZmZlcjogV2ViR0xCdWZmZXIsXHJcbiAgICBwb3NBdHRyaWI6IG51bWJlciwgdXZBdHRyaWI6IG51bWJlclxyXG4pOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0IHtcclxuICAgIGNvbnN0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XHJcbiAgICBpZighdmFvKSB7IHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBWQU8gYnVmZmVyLlwiKTsgcmV0dXJuIDA7IH1cclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zQXR0cmliKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHV2QXR0cmliKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NBdHRyaWIsIDMsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7IC8vIGZvcm1hdDogKHgsIHksIHopIChhbGwgZjMyKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHV2QnVmZmVyKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodXZBdHRyaWIsIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIHJldHVybiB2YW87XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBhIHByb2dyYW0gYW5kIGxpbmsgdGhlIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlIHRvIGl0LlxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbShcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4U2hhZGVyU3JjOiBzdHJpbmcsXHJcbiAgICBmcmFnbWVudFNoYWRlclNyYzogc3RyaW5nXHJcbik6IFdlYkdMUHJvZ3JhbSB7XHJcbiAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XHJcbiAgICBjb25zdCBmcmFnbWVudFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpIGFzIFdlYkdMU2hhZGVyO1xyXG4gICAgY29uc3QgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2UodmVydGV4U2hhZGVyLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0ZXhTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XHJcbiAgICBpZighZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZyYWdtZW50U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb2dyYW0gc2V0IHVwIGZvciBVbmlmb3Jtcy5cclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcclxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgaWYoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBwcm9ncmFtIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZ3JhbTtcclxufSIsIi8vIFZlcnRleCBidWZmZXIgZm9ybWF0OiBYWVpcclxuXHJcbi8vXHJcbi8vIEN1YmUgZ2VvbWV0cnlcclxuLy8gdGFrZW4gZnJvbTogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYkdMX0FQSS9UdXRvcmlhbC9DcmVhdGluZ18zRF9vYmplY3RzX3VzaW5nX1dlYkdMXHJcbmV4cG9ydCBjb25zdCBDVUJFX1ZFUlRJQ0VTID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgLy8gRnJvbnQgZmFjZVxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgIC8vIDAgQVxyXG4gIDEuMCwgLTEuMCwgMS4wLCAgIC8vIDEgQlxyXG4gIDEuMCwgMS4wLCAxLjAsICAgIC8vIDIgQ1xyXG4gIC0xLjAsIDEuMCwgMS4wLCAgIC8vIDMgRFxyXG5cclxuICAvLyBCYWNrIGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAvLyA0XHJcbiAgLTEuMCwgMS4wLCAtMS4wLCAgLy8gNVxyXG4gIDEuMCwgMS4wLCAtMS4wLCAgIC8vIDZcclxuICAxLjAsIC0xLjAsIC0xLjAsICAvLyA3XHJcblxyXG4gIC8vIFRvcCBmYWNlXHJcbiAgLTEuMCwgMS4wLCAtMS4wLCAgLy8gOFxyXG4gIC0xLjAsIDEuMCwgMS4wLCAgIC8vIDlcclxuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAxMFxyXG4gIDEuMCwgMS4wLCAtMS4wLCAgIC8vIDExXHJcblxyXG4gIC8vIEJvdHRvbSBmYWNlXHJcbiAgLTEuMCwgLTEuMCwgLTEuMCwgLy8gMTJcclxuICAxLjAsIC0xLjAsIC0xLjAsICAvLyAxM1xyXG4gIDEuMCwgLTEuMCwgMS4wLCAgIC8vIDE0XHJcbiAgLTEuMCwgLTEuMCwgMS4wLCAgLy8gMTVcclxuXHJcbiAgLy8gUmlnaHQgZmFjZVxyXG4gIDEuMCwgLTEuMCwgLTEuMCwgIC8vIDE2XHJcbiAgMS4wLCAxLjAsIC0xLjAsICAgLy8gMTdcclxuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAxOFxyXG4gIDEuMCwgLTEuMCwgMS4wLCAgIC8vIDE5XHJcblxyXG4gIC8vIExlZnQgZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIC8vIDIwXHJcbiAgLTEuMCwgLTEuMCwgMS4wLCAgLy8gMjFcclxuICAtMS4wLCAxLjAsIDEuMCwgICAvLyAyMlxyXG4gIC0xLjAsIDEuMCwgLTEuMCwgIC8vIDIzXHJcbl0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IENVQkVfSU5ESUNFUyA9IG5ldyBVaW50MTZBcnJheShbXHJcbiAgMCwgMSwgMixcclxuICAwLCAyLCAzLCAvLyBmcm9udFxyXG4gIDQsIDUsIDYsXHJcbiAgNCwgNiwgNywgLy8gYmFja1xyXG4gIDgsIDksIDEwLFxyXG4gIDgsIDEwLCAxMSwgLy8gdG9wXHJcbiAgMTIsIDEzLCAxNCxcclxuICAxMiwgMTQsIDE1LCAvLyBib3R0b21cclxuICAxNiwgMTcsIDE4LFxyXG4gIDE2LCAxOCwgMTksIC8vIHJpZ2h0XHJcbiAgMjAsIDIxLCAyMixcclxuICAyMCwgMjIsIDIzLCAvLyBsZWZ0XHJcbl0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFVWX0RBVEEgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBmcm9udFxyXG4gIDAsMCwgICAxLDAsICAgIDEsMSwgICAgMCwxLCAgIC8vIGJhY2tcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyB0b3BcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBib3R0b21cclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyByaWdodFxyXG4gIDAsMCwgICAxLDAsICAgIDEsMSwgICAgMCwxLCAgIC8vIGxlZnRcclxuXSkiLCJpbXBvcnQgKiBhcyBmbmMgZnJvbSBcIi4vZnVuY3Rpb25cIjtcclxuaW1wb3J0ICogYXMgY2xzIGZyb20gXCIuL2NsYXNzXCI7XHJcbmltcG9ydCAqIGFzIGdlbyBmcm9tIFwiLi9nZW9tZXRyeVwiO1xyXG5cclxuLy9cclxuLy8gTUFJTlxyXG4vL1xyXG5cclxuY29uc3QgVVBfVkVDID0gbmV3IGNscy52ZWMzKDAsIDEsIDApO1xyXG5jb25zdCBUMCA9IERhdGUubm93KCk7XHJcbmNvbnN0IFRFWFRVUkVTID0gW1xyXG4gICAgJy4vaW1nL2NhdF9vbWcucG5nJyxcclxuICAgICcuL2ltZy9jYXRfc3RhcmUucG5nJ1xyXG5dXHJcbmNvbnN0IFNFVFRJTkdTID0ge1xyXG4gICAgRk9WIDogNjAuMCwgLy8gRGVmYXVsdDogNjAuMFxyXG4gICAgUk9UQVRJT05fQU5HTEUgOiAxMC4wLCAvLyBEZWZhdWx0OiAxMC4wXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgXHJcblxyXG4gICAgLy8gQ2FudmFzIEVsZW1lbnQgYW5kIFJlbmRlcmluZyBDb250ZXh0LlxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbC1jYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjb25zdCBnbCA9IGZuYy5nZXRDb250ZXh0KGNhbnZhcyk7XHJcblxyXG4gICAgLy8gQ3ViZSB2ZXJ0aWNlcy9pbmRpY2VzIGJ1ZmZlcnMuXHJcbiAgICBjb25zdCBjdWJlVmVydGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9WRVJUSUNFUywgZmFsc2UpO1xyXG4gICAgY29uc3QgY3ViZUluZGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9JTkRJQ0VTLCB0cnVlKTtcclxuXHJcbiAgICBpZiAoIWN1YmVWZXJ0aWNlcyB8fCAhY3ViZUluZGljZXMpIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gY3JlYXRlIGdlbzogY3ViZTogKHY9JHshIWN1YmVWZXJ0aWNlc30gaT0ke2N1YmVJbmRpY2VzfSlgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmV0Y2ggc2hhZGVycyBjb2RlIGFuZCBsaW5rIHRoZW0gdG8gYSBwcm9ncmFtLlxyXG4gICAgY29uc3QgdmVydGV4U3JjID0gYXdhaXQgZm5jLmdldFNoYWRlclNvdXJjZSgnLi9zaGFkZXJzL3ZlcnRleF9zaGFkZXIudmVydCcpO1xyXG4gICAgY29uc3QgZnJhZ21lbnRTcmMgPSBhd2FpdCBmbmMuZ2V0U2hhZGVyU291cmNlKCcuL3NoYWRlcnMvZnJhZ21lbnRfc2hhZGVyLmZyYWcnKTtcclxuICAgIGNvbnN0IHByb2dyYW0gPSBmbmMuY3JlYXRlUHJvZ3JhbShnbCwgdmVydGV4U3JjLCBmcmFnbWVudFNyYyk7XHJcblxyXG5cclxuICAgIC8vIENyZWF0ZSBhIHRleHR1cmUgYW5kIGJpbmQgb3VyIGltYWdlLlxyXG4gICAgY29uc3QgdGV4dHVyZSA9IGdsLmNyZWF0ZVRleHR1cmUoKTtcclxuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkRfQVJSQVksIHRleHR1cmUpO1xyXG5cclxuICAgIC8vIFRhcmdldCwgTWlwbWFwX0xldmVscywgSW50ZXJuYWxfRm9ybWF0LCBXaWR0aCwgSGVpZ2h0LCBJbWFnZXNfQ291bnRcclxuICAgIGdsLnRleFN0b3JhZ2UzRChnbC5URVhUVVJFXzJEX0FSUkFZLCAxLCBnbC5SR0JBOCwgMTI4LCAxMjgsIFRFWFRVUkVTLmxlbmd0aCk7XHJcblxyXG4gICAgLy8gRmxpcCB0aGUgb3JpZ2luIHBvaW50IG9mIFdlYkdMLiAoUE5HIGZvcm1hdCBzdGFydCBhdCB0aGUgdG9wIGFuZCBXZWJHTCBhdCB0aGUgYm90dG9tKVxyXG4gICAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcblxyXG4gICAgLy8gQmVjYXVzZSB0ZXhTdWJJbWFnZTNEIGlzIGFzeW5jLCB3YWl0aW5nIGZvciBlYWNoIGltYWdlIHRvIGxvYWQgaXMgc2xvdy4gU28sIHdlIHByZWxvYWQgYWxsIGltYWdlcyB1c2luZyBhIFByb21pc2UuXHJcbiAgICBjb25zdCBpbWFnZXMgPSBhd2FpdCBQcm9taXNlLmFsbChURVhUVVJFUy5tYXAoc3JjID0+IGZuYy5nZXRJbWFnZShzcmMpKSk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGdsLnRleFN1YkltYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMCwgMCwgMCwgaSwgMTI4LCAxMjgsIDEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlc1tpXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hhbmdlIHRoZSBtaW5pbXVtIGFuZCBtYWduaXR1ZGUgZmlsdGVycyB3aGVuIHNjYWxpbmcgdXAgYW5kIGRvd24gdGV4dHVyZXMuXHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblxyXG4gICAgLy8gU3RhdGljIGJ1ZmZlciBmb3IgVVYgY29vcmRpbmF0ZXMuIE1pZ2h0IGJlIGNvbnN0YW50IHdpdGggdGV4dHVyZSBhcnJheXMuXHJcbiAgICBjb25zdCB0ZXhDb29yZHNCdWZmZXIgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uVVZfREFUQSwgZmFsc2UpO1xyXG5cclxuXHJcbiAgICBjb25zdCBUMSA9IERhdGUubm93KCk7XHJcbiAgICBmbmMuc2V0TG9nVGltZShcInRlc3RcIiwgYCR7RGF0ZS5ub3coKSAtIFQxfW1zYCk7XHJcblxyXG4gICAgLypcclxuICAgICogR2V0dGluZyB0aGUgYXR0cmlidXRlcyBmcm9tIHRoZSB2ZXJ0ZXggc2hhZGVyIGZpbGUuXHJcbiAgICAqIEF0dHJpYnV0ZXMgbG9jYXRpb25zIGNhbiBiZSBmb3JjZWQgaW4gdGhlIHZlcnRleCBzaGFkZXIgZmlsZSB3aXRoIChsb2NhdGlvbj1udW1iZXIpLlxyXG4gICAgKiBJZiBub3QgZm9yY2VkLCBXZWJHTCBnaXZlcyB0aGVtIGEgbnVtYmVyLCB5b3UgY2FuIGdldCB0aGlzIG51bWJlciB3aXRoIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkuXHJcbiAgICAqIEhlcmUsIGJlY2F1c2Ugd2Ugc2V0IG1hbnVhbGx5IHRoZSBhdHRyaWJ1dGUgbG9jYXRpb24gaW4gdGhlIHZlcnRleCBzaGFkZXIsXHJcbiAgICAqIHdlIGNhbiByZXBsYWNlIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkgd2l0aCB0aGUgKGxvY2F0aW9uPW51bWJlcikgbnVtYmVyLlxyXG4gICAgKi9cclxuICAgIGNvbnN0IHBvc2l0aW9uQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleFBvc2l0aW9uJyk7IC8vIGxvY2F0aW9uID0gMFxyXG4gICAgY29uc3QgdXZBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYVVWJyk7IC8vIGxvY2F0aW9uID0gMVxyXG4gICAgY29uc3QgZGVwdGhBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYURlcHRoJyk7IC8vIGxvY2F0aW9uID0gMlxyXG5cclxuICAgIC8vIFdlIGNhbiBub3Qgc3BlY2lmeSBVbmlmb3JtcyBsb2NhdGlvbnMgbWFudWFsbHkuIFdlIG5lZWQgdG8gZ2V0IHRoZW0gdXNpbmcgJ2dldFVuaWZvcm1Mb2NhdGlvbicuXHJcbiAgICBjb25zdCBtYXRXb3JsZFVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFdvcmxkJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcbiAgICBjb25zdCBtYXRWaWV3UHJvalVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFZpZXdQcm9qJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcbiAgICBjb25zdCBzYW1wbGVyVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAndVNhbXBsZXInKSBhcyBXZWJHTFVuaWZvcm1Mb2NhdGlvbjtcclxuXHJcbiAgICAvLyBUeXBlc2NyaXB0IHdhbnQgdG8gdmVyaWZ5IGlmIHRoZSB2YXJpYWJsZXMgYXJlIHNldCwgbm90IHRoZSBiZXN0IHdheSB0byBkbyBpdC5cclxuICAgIGlmKHBvc2l0aW9uQXR0cmlidXRlIDwgMCB8fCB1dkF0dHJpYnV0ZSA8IDAgfHwgZGVwdGhBdHRyaWJ1dGUgPCAwIHx8ICFtYXRXb3JsZFVuaWZvcm0gfHwgIW1hdFZpZXdQcm9qVW5pZm9ybSB8fCAhc2FtcGxlclVuaWZvcm0pIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gZ2V0IGF0dHJpYnMvdW5pZm9ybXMgKE1heDogJHtnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9BVFRSSUJTKX0pOiBgICtcclxuICAgICAgICAgICAgYCBwb3M9JHtwb3NpdGlvbkF0dHJpYnV0ZX1gICtcclxuICAgICAgICAgICAgYCB1dj0ke3V2QXR0cmlidXRlfWAgK1xyXG4gICAgICAgICAgICBgIGRlcHRoPSR7ZGVwdGhBdHRyaWJ1dGV9YCArXHJcbiAgICAgICAgICAgIGAgbWF0V29ybGQ9JHshIW1hdFdvcmxkVW5pZm9ybX1gICtcclxuICAgICAgICAgICAgYCBtYXRWaWV3UHJvaj0keyEhbWF0Vmlld1Byb2pVbmlmb3JtfWAgK1xyXG4gICAgICAgICAgICBgIHNhbXBsZXI9JHshIXNhbXBsZXJVbmlmb3JtfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb250cm9sIHRoZSBkZXB0aCBvZiB0aGUgdGV4dHVyZSBhcnJheS4gUGlja2luZyBvdXIgZGlzcGxheWVkIHRleHR1cmUuXHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWIxZihkZXB0aEF0dHJpYnV0ZSwgMCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIG91ciB2ZXJ0ZXggYXJyYXkgb2JqZWN0IChWQU9zKSBidWZmZXJzLlxyXG4gICAgY29uc3QgY3ViZVZBTyA9IGZuYy5jcmVhdGVWQU9CdWZmZXIoZ2wsIGN1YmVWZXJ0aWNlcywgY3ViZUluZGljZXMsIHRleENvb3Jkc0J1ZmZlciwgcG9zaXRpb25BdHRyaWJ1dGUsIHV2QXR0cmlidXRlKTtcclxuICAgIGlmKCFjdWJlVkFPKSByZXR1cm4gZm5jLnNob3dFcnJvcihgRmFpbGVzIHRvIGNyZWF0ZSBWQU9zOiBjdWJlPSR7ISFjdWJlVkFPfWApO1xyXG5cclxuICAgIGxldCByYW5kb20gPSBuZXcgY2xzLnZlYzMoTWF0aC5yYW5kb20oKSAqIDEsIE1hdGgucmFuZG9tKCkgKiAxLCBNYXRoLnJhbmRvbSgpICogMSk7XHJcblxyXG4gICAgLy8gU3RvcmUgb3VyIGN1YmVzLCBkcmF3IHRoZW0gZWFjaCB0aW1lLiAoYSBsb3Qgb2YgZHJhdyBjYWxscylcclxuICAgIGNvbnN0IGN1YmVzID0gW1xyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDAsIDAuNCwgMCksIDAuNCwgVVBfVkVDLCAwLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksIC8vIENlbnRlclxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUocmFuZG9tLCAwLjMsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDIwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDEsIDAuMSwgLTEpLCAwLjEsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDQwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKC0xLCAwLjE1LCAxKSwgMC4xNSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoLTEsIDAuMiwgLTEpLCAwLjIsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDgwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgXTtcclxuXHJcbiAgICBsZXQgbWF0VmlldyA9IG5ldyBjbHMubWF0NCgpO1xyXG4gICAgbGV0IG1hdFByb2ogPSBuZXcgY2xzLm1hdDQoKTtcclxuICAgIGxldCBtYXRWaWV3UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xyXG5cclxuICAgIGxldCBjYW1lcmFBbmdsZSA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIGZ1bmN0aW9uIHRvIGNhbGwgaXQgZWFjaCBmcmFtZS5cclxuICAgICAqIC0gT3V0cHV0IE1lcmdlcjogTWVyZ2UgdGhlIHNoYWRlZCBwaXhlbCBmcmFnbWVudCB3aXRoIHRoZSBleGlzdGluZyByZXN1bHQgaW1hZ2UuXHJcbiAgICAgKiAtIFJhc3Rlcml6ZXI6IFdpY2ggcGl4ZWwgYXJlIHBhcnQgb2YgdGhlIFZlcnRpY2VzICsgV2ljaCBwYXJ0IGlzIG1vZGlmaWVkIGJ5IFdlYkdMLlxyXG4gICAgICogLSBHUFUgUHJvZ3JhbTogUGFpciBWZXJ0ZXggJiBGcmFnbWVudCBzaGFkZXJzLlxyXG4gICAgICogLSBTZXQgVW5pZm9ybXMgKGNhbiBiZSBzZXQgYW55d2hlcmUpXHJcbiAgICAgKiAtIERyYXcgQ2FsbHMgKHcvIFByaW1pdGl2ZSBhc3NlbWJseSArIGZvciBsb29wKVxyXG4gICAgICovXHJcbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgIC8vIFJhbmRvbWl6ZSBjdWJlIHJvdGF0aW9uIHNwZWVkIGVhY2ggdGltZS5cclxuICAgIGxldCByZG0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxODApO1xyXG5cclxuICAgIGNvbnN0IGZyYW1lID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBkdCAoZGVsdGEgdGltZSkgd2l0aCB0aW1lIGluIHNlY29uZHMgYmV0d2VlbiBlYWNoIGZyYW1lLlxyXG4gICAgICAgIGNvbnN0IHRoaXNGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBjb25zdCBkdCA9ICh0aGlzRnJhbWVUaW1lIC0gbGFzdEZyYW1lVGltZSkgLyAxMDAwO1xyXG4gICAgICAgIGxhc3RGcmFtZVRpbWUgPSB0aGlzRnJhbWVUaW1lO1xyXG5cclxuICAgICAgICAvLyBFYWNoIGZyYW1lIGFkZCAxMMKwIHRvIHRoZSBjYW1lcmEgYW5nbGUuXHJcbiAgICAgICAgY2FtZXJhQW5nbGUgKz0gZHQgKiBmbmMudG9SYWRpYW4oMTApO1xyXG5cclxuICAgICAgICAvLyBGaXhlZCBjYW1lcmEgY29vcmRpbmF0ZXMuXHJcbiAgICAgICAgY29uc3QgY2FtZXJhWCA9IDMgKiBNYXRoLnNpbihjYW1lcmFBbmdsZSk7XHJcbiAgICAgICAgY29uc3QgY2FtZXJhWiA9IDMgKiBNYXRoLmNvcyhjYW1lcmFBbmdsZSk7XHJcblxyXG4gICAgICAgIC8vIE1ha2UgdGhlICdjYW1lcmEnIGxvb2sgYXQgdGhlIGNlbnRlci5cclxuICAgICAgICBtYXRWaWV3LnNldExvb2tBdChcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKGNhbWVyYVgsIDEsIGNhbWVyYVopLFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoMCwgMCwgMCksXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAxLCAwKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgLy8gU2V0IHRoZSBjYW1lcmEgRk9WLCBzY3JlZW4gc2l6ZSBhbmQgdmlldyBkaXN0YW5jZS5cclxuICAgICAgICBtYXRQcm9qLnNldFBlcnNwZWN0aXZlKFxyXG4gICAgICAgICAgICBmbmMudG9SYWRpYW4oU0VUVElOR1MuRk9WKSwgLy8gRk9WXHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCAvIGNhbnZhcy5oZWlnaHQsIC8vIEFTUEVDVCBSQVRJT1xyXG4gICAgICAgICAgICAwLjEsIDEwMC4wIC8vIFotTkVBUiAvIFotRkFSXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gR0xNOiBtYXRWaWV3UHJvaiA9IG1hdFByb2ogKiBtYXRWaWV3XHJcbiAgICAgICAgbWF0Vmlld1Byb2ogPSBtYXRQcm9qLm11bHRpcGx5KG1hdFZpZXcpO1xyXG5cclxuICAgICAgICAvLyBSZW5kZXJcclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpbztcclxuXHJcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAyLCAwLjAyLCAwLjAyLCAxKTtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xyXG4gICAgICAgIGdsLmZyb250RmFjZShnbC5DQ1cpO1xyXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRWaWV3UHJvalVuaWZvcm0sIGZhbHNlLCBtYXRWaWV3UHJvai5tKTtcclxuXHJcblxyXG4gICAgICAgIGN1YmVzLmZvckVhY2goKGN1YmUsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBjZW50ZXIgY3ViZSBkbyBub3Qgcm90YXRlIG9uIGl0c2VsZi5cclxuICAgICAgICAgICAgaWYgKGluZGV4ID09IDApIHsgY3ViZS5kcmF3KGdsLCBtYXRXb3JsZFVuaWZvcm0pOyByZXR1cm4gfSBcclxuICAgICAgICAgICAgY3ViZS5yb3RhdGUoZHQgKiBmbmMudG9SYWRpYW4ocmRtKSk7XHJcbiAgICAgICAgICAgIGN1YmUuZHJhdyhnbCwgbWF0V29ybGRVbmlmb3JtKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBMb29wIGNhbGxzLCBlYWNoIHRpbWUgdGhlIGRyYXdpbmcgaXMgcmVhZHkuXHJcbiAgICAgICAgZm5jLnNldExvZ1RpbWUoXCJmcHNcIiwgYCR7TWF0aC5jZWlsKGR0KX1tc2ApO1xyXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XHJcbiAgICB9O1xyXG4gICAgLy8gRmlyc3QgY2FsbCwgYXMgc29vbiwgYXMgdGhlIHBhZ2UgaXMgbG9hZGVkLlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxuICAgIGZuYy5zZXRMb2dUaW1lKFwibG9hZGluZ1wiLCBgJHsgRGF0ZS5ub3coKSAtIFQwIH1tc2ApO1xyXG59XHJcblxyXG5mbmMuc2hvd0Vycm9yKFwiTm8gRXJyb3JzISDwn4yeXCIpO1xyXG5cclxudHJ5IHsgbWFpbigpOyB9IGNhdGNoKGUpIHsgZm5jLnNob3dFcnJvcihgVW5jYXVnaHQgZXhjZXB0aW9uOiAke2V9YCk7IH0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvbWFpbi50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==