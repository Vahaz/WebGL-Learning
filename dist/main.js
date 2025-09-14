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
exports.loadTexture = loadTexture;
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
/* Create a WebGL Buffer type. (Opaque Handle)
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
/* Create vertex array object buffers, it read the vertices from GPU Buffer.
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
/* Create a WebGL texture and bind it to a TEXTURE_2D_ARRAY.
 * Set the parameters for the textures storage. (Target, Mipmap_Levels, Internal_Format, Width, Height, Images_Count)
 * Flip the origin point of WebGL. (PNG format start at the top and WebGL at the bottom)
 * Because texSubImage3D is async, waiting for each image to load is slow. So, we preload all images using a Promise.
 * Set the parameters on how to store each textures. (Target, Mipmap_Level, Internal_Format, Width, Height, Depth, Border, Format, Type, Offset)
 * Change the minimum and magnitude filters when scaling up and down textures.
 */
function loadTexture(gl, textures) {
    return __awaiter(this, void 0, void 0, function* () {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
        gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 128, 128, textures.length);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        const images = yield Promise.all(textures.map(src => getImage(src)));
        for (let i = 0; i < images.length; i++) {
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        }
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    });
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
const SETTINGS = {
    FOV: 60.0, // Default: 60.0
    ROTATION_ANGLE: 10.0, // Default: 10.0
};
const TEXTURES = [
    './img/cat_omg.png',
    './img/cat_stare.png'
];
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
        gl.vertexAttrib1f(depthAttribute, 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUNyRixHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxTQUFTO1FBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyRixDQUFDO0lBQ0QsS0FBSyxDQUFDLENBQU87UUFDVCxPQUFPLElBQUksSUFBSSxDQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzlCLENBQUM7SUFDTixDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQU8sSUFBWSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENB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QUFDLENBQUM7UUFFbkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDRixDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFNLENBQUM7WUFDbkUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBTSxDQUFDO1lBQ25FLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBVSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFB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RyxFQUFFLENBQUMsR0FBRyxFQUFHLElBQUk7SUFDdEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBSSxJQUFJO0lBQ3RCLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRyxJQUFJO0lBRXRCLFdBQVc7SUFDWCxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUcsSUFBSTtJQUN0QixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFJLElBQUk7SUFDdEIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUssS0FBSztJQUN2QixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFJLEtBQUs7SUFFdkIsY0FBYztJQUNkLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUs7SUFDdkIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFHLEtBQUs7SUFDdkIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBSSxLQUFLO0lBQ3ZCLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRyxLQUFLO0lBRXZCLGFBQWE7SUFDYixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUcsS0FBSztJQUN2QixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFJLEtBQUs7SUFDdkIsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUssS0FBSztJQUN2QixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFJLEtBQUs7SUFFdkIsWUFBWTtJQUNaLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUs7SUFDdkIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFHLEtBQUs7SUFDdkIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBSSxLQUFLO0lBQ3ZCLENBQUMs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T0FBTyxFQUFFLENBQUMsQ0FBQztRQUU5RSxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVuRiw4REFBOEQ7UUFDOUQsTUFBTSxLQUFLLEdBQUc7WUFDVixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUztZQUNuRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDdEYsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUN4RyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lB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QUFDO0lBQ3hELENBQUM7Q0FBQTtBQUVELEdBQUcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFL0IsSUFBSSxDQUFDO0lBQUMsSUFBSSxFQUFFLENBQUM7QUFBQyxDQUFDO0FBQUMsT0FBTSxDQUFDLEVBQUUsQ0FBQztJQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFBQyxDQUFDOzs7Ozs7O1VDOUt2RTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvY2xhc3MudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZnVuY3Rpb24udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZ2VvbWV0cnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy9cclxuLy8gQ0xBU1NcclxuLy9cclxuXHJcbmV4cG9ydCBjbGFzcyBTaGFwZSB7XHJcbiAgICBwcml2YXRlIG1hdFdvcmxkID0gbmV3IG1hdDQoKTtcclxuICAgIHByaXZhdGUgc2NhbGVWZWMgPSBuZXcgdmVjMygpO1xyXG4gICAgcHJpdmF0ZSByb3RhdGlvbiA9IG5ldyBxdWF0KCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBwb3M6IHZlYzMsXHJcbiAgICAgICAgcHJpdmF0ZSBzY2FsZTogbnVtYmVyLFxyXG4gICAgICAgIHByaXZhdGUgcm90YXRpb25BeGlzOiB2ZWMzLFxyXG4gICAgICAgIHByaXZhdGUgcm90YXRpb25BbmdsZTogbnVtYmVyLFxyXG4gICAgICAgIHB1YmxpYyByZWFkb25seSB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3QsXHJcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IG51bUluZGljZXM6IG51bWJlclxyXG4gICAgKSB7IH1cclxuXHJcbiAgICByb3RhdGUoYW5nbGU6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMucm90YXRpb25BbmdsZSA9IHRoaXMucm90YXRpb25BbmdsZSArIGFuZ2xlO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIG1hdFdvcmxkVW5pZm9ybTogV2ViR0xVbmlmb3JtTG9jYXRpb24pIHtcclxuICAgICAgICB0aGlzLnJvdGF0aW9uLnNldEF4aXNBbmdsZSh0aGlzLnJvdGF0aW9uQXhpcywgdGhpcy5yb3RhdGlvbkFuZ2xlKTtcclxuICAgICAgICB0aGlzLnNjYWxlVmVjLnNldCh0aGlzLnNjYWxlLCB0aGlzLnNjYWxlLCB0aGlzLnNjYWxlKTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXRXb3JsZC5zZXRGcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHRoaXMucm90YXRpb24sIHRoaXMucG9zLCB0aGlzLnNjYWxlVmVjKTtcclxuXHJcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRXb3JsZFVuaWZvcm0sIGZhbHNlLCB0aGlzLm1hdFdvcmxkLm1hdCk7XHJcbiAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KHRoaXMudmFvKTtcclxuICAgICAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCB0aGlzLm51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcclxuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XHJcbiAgICB9XHJcbiAgICBcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIHZlYzMge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciA9IDAuMCwgcHVibGljIHk6IG51bWJlciA9IDAuMCwgcHVibGljIHo6IG51bWJlciA9IDAuMCkge31cclxuXHJcbiAgICBhZGQodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueikgfVxyXG4gICAgc3VidHJhY3QodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueikgfVxyXG4gICAgbXVsdGlwbHkodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueikgfVxyXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIG5vcm1hbGl6ZSgpOiB2ZWMzIHtcclxuICAgICAgICBjb25zdCBsZW4gPSBNYXRoLmh5cG90KHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xyXG4gICAgICAgIHJldHVybiBsZW4gPiAwID8gbmV3IHZlYzModGhpcy54IC8gbGVuLCB0aGlzLnkgLyBsZW4sIHRoaXMueiAvIGxlbikgOiBuZXcgdmVjMygpO1xyXG4gICAgfVxyXG4gICAgY3Jvc3ModjogdmVjMyk6IHZlYzMge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMyhcclxuICAgICAgICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxyXG4gICAgICAgICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXHJcbiAgICAgICAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBkb3QodjogdmVjMyk6IG51bWJlciB7IHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2LnogfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgcXVhdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgeDogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgeTogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgejogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgdzogbnVtYmVyID0gMVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHNldEF4aXNBbmdsZShheGlzOiB2ZWMzLCBhbmdsZTogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3Qgbm9ybSA9IGF4aXMubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgaGFsZiA9IGFuZ2xlIC8gMjtcclxuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oaGFsZik7XHJcblxyXG4gICAgICAgIHRoaXMueCA9IG5vcm0ueCAqIHM7XHJcbiAgICAgICAgdGhpcy55ID0gbm9ybS55ICogcztcclxuICAgICAgICB0aGlzLnogPSBub3JtLnogKiBzO1xyXG4gICAgICAgIHRoaXMudyA9IE1hdGguY29zKGhhbGYpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIG1hdDQge1xyXG4gICAgcHVibGljIG1hdDogRmxvYXQzMkFycmF5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubWF0ID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XHJcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlkZW50aXR5KCk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hdDtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBjb3B5RnJvbShtYXQ6IG1hdDQpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm1hdC5zZXQobWF0Lm1hdCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcbiAgICAvKlxyXG4gICAgICogIHgsICAwLCAgMCwgMFxyXG4gICAgICogIDAsICB5LCAgMCwgMFxyXG4gICAgICogIDAsICAwLCAgeiwgMFxyXG4gICAgICogdHgsIHR5LCB0eiwgMVxyXG4gICAgICovXHJcbiAgICBtdWx0aXBseShvdGhlcjogbWF0NCk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IGEgPSB0aGlzLm1hdCwgYiA9IG90aGVyLm1hdDtcclxuICAgICAgICBjb25zdCBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA0OyArK2opIHtcclxuICAgICAgICAgICAgICAgIG91dFtqICogNCArIGldID1cclxuICAgICAgICAgICAgICAgIGFbMCAqIDQgKyBpXSAqIGJbaiAqIDQgKyAwXSArXHJcbiAgICAgICAgICAgICAgICBhWzEgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMV0gK1xyXG4gICAgICAgICAgICAgICAgYVsyICogNCArIGldICogYltqICogNCArIDJdICtcclxuICAgICAgICAgICAgICAgIGFbMyAqIDQgKyBpXSAqIGJbaiAqIDQgKyAzXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tYXQuc2V0KG91dCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFBlcnNwZWN0aXZlIG1hdHJpY2UsIHRoZSBmYWN0b3IgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSB0YW4gb2YgdGhlIEZPViBkaXZpZGVkIGJ5IDI6XHJcbiAgICAgKiBXZSBoYXZlIHRoZSBuZWFyIHBsYW5lIGFuZCBmYXIgcGxhbmUuIChvYmplY3RzIGFyZSBkcmF3biBpbi1iZXR3ZWVuKVxyXG4gICAgICogYXNwZWN0IGlzIHRoZSBhc3BlY3QtcmF0aW8gbGlrZSAxNjo5IG9uIG1vc3Qgc2NyZWVucy5cclxuICAgICAqIFdlIGNoYW5nZSBlYWNoIHZlcnRpY2VzIHgsIHkgYW5kIHogYnkgdGhlIGZvbGxvd2luZzpcclxuICAgICAqIDAsIDAsICAwLCAgMFxyXG4gICAgICogMCwgNSwgIDAsICAwXHJcbiAgICAgKiAwLCAwLCAxMCwgMTFcclxuICAgICAqIDAsIDAsIDE0LCAxNVxyXG4gICAgICovXHJcbiAgICBzZXRQZXJzcGVjdGl2ZShmb3ZSYWQ6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBmID0gMS4wIC8gTWF0aC50YW4oZm92UmFkIC8gMik7XHJcbiAgICAgICAgY29uc3QgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hdDtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgIGYgLyBhc3BlY3QsICAgICAwLCAgICAgIDAsICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAwLCAgICAgICAgICAgICAgZiwgICAgICAwLCAgICAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgMCwgICAgICAgICAgICAgIDAsICAgICAgKGZhciArIG5lYXIpICogbmYsICAgICAgLTEsXHJcbiAgICAgICAgICAgIDAsICAgICAgICAgICAgICAwLCAgICAgIDIqZmFyKm5lYXIqbmYsICAgICAgICAgICAwXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TG9va0F0KGV5ZTogdmVjMywgY2VudGVyOiB2ZWMzLCB1cDogdmVjMyk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IHogPSBleWUuc3VidHJhY3QoY2VudGVyKS5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCB4ID0gdXAuY3Jvc3Moeikubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgeSA9IHouY3Jvc3MoeCk7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubWF0O1xyXG4gICAgICAgIG0uc2V0KFtcclxuICAgICAgICAgICAgeC54LCAgICAgICAgICAgIHkueCwgICAgICAgICAgICB6LngsICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgeC55LCAgICAgICAgICAgIHkueSwgICAgICAgICAgICB6LnksICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgeC56LCAgICAgICAgICAgIHkueiwgICAgICAgICAgICB6LnosICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgLXguZG90KGV5ZSksICAgIC15LmRvdChleWUpLCAgICAtei5kb3QoZXllKSwgICAgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUocTogcXVhdCwgdjogdmVjMywgczogdmVjMyk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IHggPSBxLngsIHkgPSBxLnksIHogPSBxLnosIHcgPSBxLnc7XHJcbiAgICAgICAgY29uc3Qgc3ggPSBzLngsIHN5ID0gcy55LCBzeiA9IHMuejtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4ICsgeCwgeTIgPSB5ICsgeSwgejIgPSB6ICsgejtcclxuICAgICAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xyXG4gICAgICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XHJcbiAgICAgICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tYXQ7XHJcbiAgICAgICAgbS5zZXQoW1xyXG4gICAgICAgICAgICAoMSAtICh5eSArIHp6KSkgKiBzeCwgICAgICAgICAoeHkgKyB3eikgKiBzeCwgICAgICAgKHh6IC0gd3kpICogc3gsICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAoeHkgLSB3eikgKiBzeSwgICAoMSAtICh4eCArIHp6KSkgKiBzeSwgICAgICAgKHl6ICsgd3gpICogc3ksICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAoeHogKyB3eSkgKiBzeiwgICAgICAgICAoeXogLSB3eCkgKiBzeiwgKDEgLSAoeHggKyB5eSkpICogc3osICAgICAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHYueiwgICAgICAgICAgICAgICAgICAgIHYueSwgICAgICAgICAgICAgICAgICB2LnosICAgICAxXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn0iLCIvL1xyXG4vLyBGVU5DVElPTlxyXG4vL1xyXG5cclxuLy8gRGlzcGxheSBhbiBlcnJvciBtZXNzYWdlIHRvIHRoZSBIVE1MIEVsZW1lbnQgd2l0aCBpZCBcImVycm9yXCIuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3IobXNnOiBzdHJpbmcgPSBcIk5vIERhdGFcIik6IHZvaWQge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlcnJvclwiKTtcclxuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gRWxlbWVudCB3aXRoIElEOiBlcnJvclwiKTtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICBlbGVtZW50LmlubmVyVGV4dCA9IG1zZztcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRMb2dUaW1lKHRhcmdldDogc3RyaW5nLCBtc2c6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgbGV0IGNvbnRhaW5lciA9IG51bGw7XHJcbiAgICBpZiAodGFyZ2V0ID09IFwibG9hZGluZ1wiKSB7XHJcbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkaW5nXCIpO1xyXG4gICAgfSBlbHNlIGlmICh0YXJnZXQgPT0gXCJmcHNcIikge1xyXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRlc3RcIik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoY29udGFpbmVyID09PSBudWxsKSByZXR1cm4gY29uc29sZS5sb2coYE5vIEVsZW1lbnQgd2l0aCBJRDogJHt0YXJnZXR9YClcclxuICAgIGNvbnN0IHAgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcigncDpub3QoLnRpdGxlKScpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcclxuICAgIGlmIChwKSB7XHJcbiAgICAgICAgcC5pbm5lclRleHQgPSBtc2c7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICAgICAgZWxlbWVudC5pbm5lclRleHQgPSBtc2c7XHJcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjb25zb2xlLmxvZyhgJHt0YXJnZXR9OiAke21zZ31gKTtcclxufVxyXG5cclxuLy8gR2V0IHNoYWRlcnMgc291cmNlIGNvZGUuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTaGFkZXJTb3VyY2UodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xyXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgbG9hZGluZyBzaGFkZXIgY29kZSBhdCBcIiR7dXJsfVwiOiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SW1hZ2UodXJsOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxJbWFnZUVsZW1lbnQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgaW1hZ2Uuc3JjID0gdXJsO1xyXG4gICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoaW1hZ2UpO1xyXG4gICAgfSlcclxufVxyXG5cclxuLy8gUmV0dXJuIHRoZSBXZWJHTCBDb250ZXh0IGZyb20gdGhlIENhbnZhcyBFbGVtZW50LlxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCB7XHJcbiAgICByZXR1cm4gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsMicpIGFzIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgO1xyXG59XHJcblxyXG4vLyBDb252ZXJ0IGZyb20gZGVncmVlcyB0byByYWRpYW50LlxyXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYW5nbGU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gYW5nbGUgKiBNYXRoLlBJIC8gMTgwO1xyXG59XHJcblxyXG4vKiBDcmVhdGUgYSBXZWJHTCBCdWZmZXIgdHlwZS4gKE9wYXF1ZSBIYW5kbGUpXHJcbiAqIC0gU1RBVElDX0RSQVcgOiB3b250IHVwZGF0ZSBvZnRlbiwgYnV0IG9mdGVuIHVzZWQuXHJcbiAqIC0gQVJSQVlfQlVGRkVSIDogaW5kaWNhdGUgdGhlIHBsYWNlIHRvIHN0b3JlIHRoZSBBcnJheS5cclxuICogLSBFTEVNRU5UX0FSUkFZX0JVRkZFUiA6IFVzZWQgZm9yIGluZGljZXMgd2l0aCBjdWJlIHNoYXBlcyBkcmF3aW5nLlxyXG4gKiBCaW5kIHRoZSBCdWZmZXIgdG8gdGhlIENQVSwgYWRkIHRoZSBBcnJheSB0byB0aGUgQnVmZmVyIGFuZCBDbGVhciBhZnRlciB1c2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdGljQnVmZmVyKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBkYXRhOiBBcnJheUJ1ZmZlciwgaXNJbmRpY2U6IGJvb2xlYW4pOiBXZWJHTEJ1ZmZlciB7XHJcbiAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIGNvbnN0IHR5cGUgPSAoaXNJbmRpY2UgPT0gdHJ1ZSkgPyBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiA6IGdsLkFSUkFZX0JVRkZFUlxyXG4gICAgaWYoIWJ1ZmZlcikgeyBcclxuICAgICAgICBzaG93RXJyb3IoXCJGYWlsZWQgdG8gYWxsb2NhdGUgYnVmZmVyIHNwYWNlXCIpOyBcclxuICAgICAgICByZXR1cm4gMDsgXHJcbiAgICB9XHJcblxyXG4gICAgZ2wuYmluZEJ1ZmZlcih0eXBlLCBidWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YSh0eXBlLCBkYXRhLCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIG51bGwpO1xyXG4gICAgcmV0dXJuIGJ1ZmZlclxyXG59XHJcblxyXG4vKiBDcmVhdGUgdmVydGV4IGFycmF5IG9iamVjdCBidWZmZXJzLCBpdCByZWFkIHRoZSB2ZXJ0aWNlcyBmcm9tIEdQVSBCdWZmZXIuXHJcbiAqIFRoZSB2ZXJ0ZXggYnVmZmVyIGNvbnRhaW5zIHRoZSB2ZXJ0aWNlcyBjb29yZGluYXRlcyAoY2FuIGFsc28gY29udGFpbnMgY29sb3IgYW5kIHNpemUpLlxyXG4gKiBUaGUgaW5kZXggYnVmZmVyIGNvbnRhaW5zIHdpY2ggdmVydGV4IG5lZWQgdG8gYmUgZHJhd24gb24gc2NlbmUgdG8gYXZvaWQgZHVwbGljYXRlcyB2ZXJ0aWNlcy5cclxuICogSW4gY2FzZSBvZiBjb2xvcnMsIGFuIG9mZnNldCBvZiAzIGZsb2F0cyBpcyB1c2VkIGVhY2ggdGltZSB0byBhdm9pZCAoeCwgeSwgeikgY29vcmRpbmF0ZXMuXHJcbiAqIFRoZSB2ZXJ0ZXggc2hhZGVyIHBsYWNlIHRoZSB2ZXJ0aWNlcyBpbiBjbGlwIHNwYWNlIGFuZCB0aGUgZnJhZ21lbnQgc2hhZGVyIGNvbG9yIHRoZSBwaXhlbHMuIChEZWZhdWx0OiAwKVxyXG4gKiBWZXJ0ZXhBdHRyaWJQb2ludGVyIFtJbmRleCwgU2l6ZSwgVHlwZSwgSXNOb3JtYWxpemVkLCBTdHJpZGUsIE9mZnNldF1cclxuICogLSBJbmRleCAobG9jYXRpb24pXHJcbiAqIC0gU2l6ZSAoQ29tcG9uZW50IHBlciB2ZWN0b3IpXHJcbiAqIC0gVHlwZVxyXG4gKiAtIElzTm9ybWFsaXplZCAoaW50IHRvIGZsb2F0cywgZm9yIGNvbG9ycyB0cmFuc2Zvcm0gWzAsIDI1NV0gdG8gZmxvYXQgWzAsIDFdKVxyXG4gKiAtIFN0cmlkZSAoRGlzdGFuY2UgYmV0d2VlbiBlYWNoIHZlcnRleCBpbiB0aGUgYnVmZmVyKVxyXG4gKiAtIE9mZnNldCAoTnVtYmVyIG9mIHNraXBlZCBieXRlcyBiZWZvcmUgcmVhZGluZyBhdHRyaWJ1dGVzKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZBT0J1ZmZlcihcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgaW5kZXhCdWZmZXI6IFdlYkdMQnVmZmVyLCB1dkJ1ZmZlcjogV2ViR0xCdWZmZXIsXHJcbiAgICBwb3NBdHRyaWI6IG51bWJlciwgdXZBdHRyaWI6IG51bWJlclxyXG4pOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0IHtcclxuICAgIGNvbnN0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XHJcbiAgICBpZighdmFvKSB7IHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBWQU8gYnVmZmVyLlwiKTsgcmV0dXJuIDA7IH1cclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zQXR0cmliKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHV2QXR0cmliKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NBdHRyaWIsIDMsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7IC8vIGZvcm1hdDogKHgsIHksIHopIChhbGwgZjMyKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHV2QnVmZmVyKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodXZBdHRyaWIsIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIHJldHVybiB2YW87XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBhIHByb2dyYW0gYW5kIGxpbmsgdGhlIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlIHRvIGl0LlxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbShcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4U2hhZGVyU3JjOiBzdHJpbmcsXHJcbiAgICBmcmFnbWVudFNoYWRlclNyYzogc3RyaW5nXHJcbik6IFdlYkdMUHJvZ3JhbSB7XHJcbiAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XHJcbiAgICBjb25zdCBmcmFnbWVudFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpIGFzIFdlYkdMU2hhZGVyO1xyXG4gICAgY29uc3QgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2UodmVydGV4U2hhZGVyLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0ZXhTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XHJcbiAgICBpZighZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZyYWdtZW50U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb2dyYW0gc2V0IHVwIGZvciBVbmlmb3Jtcy5cclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcclxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgaWYoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBwcm9ncmFtIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZ3JhbTtcclxufVxyXG5cclxuXHJcbi8qIENyZWF0ZSBhIFdlYkdMIHRleHR1cmUgYW5kIGJpbmQgaXQgdG8gYSBURVhUVVJFXzJEX0FSUkFZLlxyXG4gKiBTZXQgdGhlIHBhcmFtZXRlcnMgZm9yIHRoZSB0ZXh0dXJlcyBzdG9yYWdlLiAoVGFyZ2V0LCBNaXBtYXBfTGV2ZWxzLCBJbnRlcm5hbF9Gb3JtYXQsIFdpZHRoLCBIZWlnaHQsIEltYWdlc19Db3VudClcclxuICogRmxpcCB0aGUgb3JpZ2luIHBvaW50IG9mIFdlYkdMLiAoUE5HIGZvcm1hdCBzdGFydCBhdCB0aGUgdG9wIGFuZCBXZWJHTCBhdCB0aGUgYm90dG9tKVxyXG4gKiBCZWNhdXNlIHRleFN1YkltYWdlM0QgaXMgYXN5bmMsIHdhaXRpbmcgZm9yIGVhY2ggaW1hZ2UgdG8gbG9hZCBpcyBzbG93LiBTbywgd2UgcHJlbG9hZCBhbGwgaW1hZ2VzIHVzaW5nIGEgUHJvbWlzZS5cclxuICogU2V0IHRoZSBwYXJhbWV0ZXJzIG9uIGhvdyB0byBzdG9yZSBlYWNoIHRleHR1cmVzLiAoVGFyZ2V0LCBNaXBtYXBfTGV2ZWwsIEludGVybmFsX0Zvcm1hdCwgV2lkdGgsIEhlaWdodCwgRGVwdGgsIEJvcmRlciwgRm9ybWF0LCBUeXBlLCBPZmZzZXQpXHJcbiAqIENoYW5nZSB0aGUgbWluaW11bSBhbmQgbWFnbml0dWRlIGZpbHRlcnMgd2hlbiBzY2FsaW5nIHVwIGFuZCBkb3duIHRleHR1cmVzLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRUZXh0dXJlKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCB0ZXh0dXJlczogc3RyaW5nW10pIHtcclxuICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJEX0FSUkFZLCB0ZXh0dXJlKTtcclxuICAgIGdsLnRleFN0b3JhZ2UzRChnbC5URVhUVVJFXzJEX0FSUkFZLCAxLCBnbC5SR0JBOCwgMTI4LCAxMjgsIHRleHR1cmVzLmxlbmd0aCk7XHJcbiAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcclxuXHJcbiAgICBjb25zdCBpbWFnZXMgPSBhd2FpdCBQcm9taXNlLmFsbCh0ZXh0dXJlcy5tYXAoc3JjID0+IGdldEltYWdlKHNyYykpKTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZ2wudGV4U3ViSW1hZ2UzRChnbC5URVhUVVJFXzJEX0FSUkFZLCAwLCAwLCAwLCBpLCAxMjgsIDEyOCwgMSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2VzW2ldKTtcclxuICAgIH1cclxuXHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbn0iLCIvLyBWZXJ0ZXggYnVmZmVyIGZvcm1hdDogWFlaXHJcblxyXG4vL1xyXG4vLyBDdWJlIGdlb21ldHJ5XHJcbi8vIHRha2VuIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJHTF9BUEkvVHV0b3JpYWwvQ3JlYXRpbmdfM0Rfb2JqZWN0c191c2luZ19XZWJHTFxyXG5leHBvcnQgY29uc3QgQ1VCRV9WRVJUSUNFUyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xyXG4gIC8vIEZyb250IGZhY2VcclxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAwIEFcclxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxIEJcclxuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAyIENcclxuICAtMS4wLCAxLjAsIDEuMCwgICAvLyAzIERcclxuXHJcbiAgLy8gQmFjayBmYWNlXHJcbiAgLTEuMCwgLTEuMCwgLTEuMCwgLy8gNFxyXG4gIC0xLjAsIDEuMCwgLTEuMCwgIC8vIDVcclxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyA2XHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAgLy8gN1xyXG5cclxuICAvLyBUb3AgZmFjZVxyXG4gIC0xLjAsIDEuMCwgLTEuMCwgIC8vIDhcclxuICAtMS4wLCAxLjAsIDEuMCwgICAvLyA5XHJcbiAgMS4wLCAxLjAsIDEuMCwgICAgLy8gMTBcclxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAxMVxyXG5cclxuICAvLyBCb3R0b20gZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIC8vIDEyXHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAgLy8gMTNcclxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxNFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgIC8vIDE1XHJcblxyXG4gIC8vIFJpZ2h0IGZhY2VcclxuICAxLjAsIC0xLjAsIC0xLjAsICAvLyAxNlxyXG4gIDEuMCwgMS4wLCAtMS4wLCAgIC8vIDE3XHJcbiAgMS4wLCAxLjAsIDEuMCwgICAgLy8gMThcclxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxOVxyXG5cclxuICAvLyBMZWZ0IGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAvLyAyMFxyXG4gIC0xLjAsIC0xLjAsIDEuMCwgIC8vIDIxXHJcbiAgLTEuMCwgMS4wLCAxLjAsICAgLy8gMjJcclxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyAyM1xyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBDVUJFX0lORElDRVMgPSBuZXcgVWludDE2QXJyYXkoW1xyXG4gIDAsIDEsIDIsXHJcbiAgMCwgMiwgMywgLy8gZnJvbnRcclxuICA0LCA1LCA2LFxyXG4gIDQsIDYsIDcsIC8vIGJhY2tcclxuICA4LCA5LCAxMCxcclxuICA4LCAxMCwgMTEsIC8vIHRvcFxyXG4gIDEyLCAxMywgMTQsXHJcbiAgMTIsIDE0LCAxNSwgLy8gYm90dG9tXHJcbiAgMTYsIDE3LCAxOCxcclxuICAxNiwgMTgsIDE5LCAvLyByaWdodFxyXG4gIDIwLCAyMSwgMjIsXHJcbiAgMjAsIDIyLCAyMywgLy8gbGVmdFxyXG5dKTtcclxuXHJcbmV4cG9ydCBjb25zdCBVVl9EQVRBID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gZnJvbnRcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBiYWNrXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gdG9wXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gYm90dG9tXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gcmlnaHRcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBsZWZ0XHJcbl0pIiwiaW1wb3J0ICogYXMgZm5jIGZyb20gXCIuL2Z1bmN0aW9uXCI7XHJcbmltcG9ydCAqIGFzIGNscyBmcm9tIFwiLi9jbGFzc1wiO1xyXG5pbXBvcnQgKiBhcyBnZW8gZnJvbSBcIi4vZ2VvbWV0cnlcIjtcclxuXHJcbi8vXHJcbi8vIE1BSU5cclxuLy9cclxuXHJcbmNvbnN0IFVQX1ZFQyA9IG5ldyBjbHMudmVjMygwLCAxLCAwKTtcclxuY29uc3QgVDAgPSBEYXRlLm5vdygpO1xyXG5jb25zdCBTRVRUSU5HUyA9IHtcclxuICAgIEZPViA6IDYwLjAsIC8vIERlZmF1bHQ6IDYwLjBcclxuICAgIFJPVEFUSU9OX0FOR0xFIDogMTAuMCwgLy8gRGVmYXVsdDogMTAuMFxyXG59XHJcbmNvbnN0IFRFWFRVUkVTID0gW1xyXG4gICAgJy4vaW1nL2NhdF9vbWcucG5nJyxcclxuICAgICcuL2ltZy9jYXRfc3RhcmUucG5nJ1xyXG5dXHJcblxyXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xyXG5cclxuICAgIC8vIENhbnZhcyBFbGVtZW50IGFuZCBSZW5kZXJpbmcgQ29udGV4dC5cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ2wtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY29uc3QgZ2wgPSBmbmMuZ2V0Q29udGV4dChjYW52YXMpO1xyXG5cclxuICAgIC8vIEN1YmUgdmVydGljZXMvaW5kaWNlcyBidWZmZXJzLlxyXG4gICAgY29uc3QgY3ViZVZlcnRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfVkVSVElDRVMsIGZhbHNlKTtcclxuICAgIGNvbnN0IGN1YmVJbmRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfSU5ESUNFUywgdHJ1ZSk7XHJcblxyXG4gICAgaWYgKCFjdWJlVmVydGljZXMgfHwgIWN1YmVJbmRpY2VzKSB7XHJcbiAgICAgICAgZm5jLnNob3dFcnJvcihgRmFpbGVkIHRvIGNyZWF0ZSBnZW86IGN1YmU6ICh2PSR7ISFjdWJlVmVydGljZXN9IGk9JHtjdWJlSW5kaWNlc30pYCk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEZldGNoIHNoYWRlcnMgY29kZSBhbmQgbGluayB0aGVtIHRvIGEgcHJvZ3JhbS5cclxuICAgIGNvbnN0IHZlcnRleFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy92ZXJ0ZXhfc2hhZGVyLnZlcnQnKTtcclxuICAgIGNvbnN0IGZyYWdtZW50U3JjID0gYXdhaXQgZm5jLmdldFNoYWRlclNvdXJjZSgnLi9zaGFkZXJzL2ZyYWdtZW50X3NoYWRlci5mcmFnJyk7XHJcbiAgICBjb25zdCBwcm9ncmFtID0gZm5jLmNyZWF0ZVByb2dyYW0oZ2wsIHZlcnRleFNyYywgZnJhZ21lbnRTcmMpO1xyXG5cclxuICAgIC8vIExvYWQgYWxsIGltYWdlcywgY3JlYXRlIGEgc3RvcmFnZSBhbmQgc3RvcmUgZWFjaCBpbWFnZSBpbnRvIGEgVGV4dHVyZSBBcnJheXMuXHJcbiAgICBmbmMubG9hZFRleHR1cmUoZ2wsIFRFWFRVUkVTKTtcclxuXHJcbiAgICAvLyBTdGF0aWMgYnVmZmVyIGZvciBVViBjb29yZGluYXRlcy4gTWlnaHQgYmUgY29uc3RhbnQgd2l0aCB0ZXh0dXJlIGFycmF5cy5cclxuICAgIGNvbnN0IHRleENvb3Jkc0J1ZmZlciA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIGdlby5VVl9EQVRBLCBmYWxzZSk7XHJcblxyXG5cclxuICAgIGNvbnN0IFQxID0gRGF0ZS5ub3coKTtcclxuICAgIGZuYy5zZXRMb2dUaW1lKFwidGVzdFwiLCBgJHtEYXRlLm5vdygpIC0gVDF9bXNgKTtcclxuXHJcbiAgICAvKiBHZXR0aW5nIHRoZSBhdHRyaWJ1dGVzIGZyb20gdGhlIHZlcnRleCBzaGFkZXIgZmlsZS5cclxuICAgICAqIEF0dHJpYnV0ZXMgbG9jYXRpb25zIGNhbiBiZSBmb3JjZWQgaW4gdGhlIHZlcnRleCBzaGFkZXIgZmlsZSB3aXRoIChsb2NhdGlvbj1udW1iZXIpLlxyXG4gICAgICogSWYgbm90IGZvcmNlZCwgV2ViR0wgZ2l2ZXMgdGhlbSBhIG51bWJlciwgeW91IGNhbiBnZXQgdGhpcyBudW1iZXIgd2l0aCBnbC5nZXRBdHRyaWJMb2NhdGlvbigpLlxyXG4gICAgICogSGVyZSwgYmVjYXVzZSB3ZSBzZXQgbWFudWFsbHkgdGhlIGF0dHJpYnV0ZSBsb2NhdGlvbiBpbiB0aGUgdmVydGV4IHNoYWRlcixcclxuICAgICAqIHdlIGNhbiByZXBsYWNlIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkgd2l0aCB0aGUgKGxvY2F0aW9uPW51bWJlcikgbnVtYmVyLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBwb3NpdGlvbkF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICd2ZXJ0ZXhQb3NpdGlvbicpOyAvLyBsb2NhdGlvbiA9IDBcclxuICAgIGNvbnN0IHV2QXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ2FVVicpOyAvLyBsb2NhdGlvbiA9IDFcclxuICAgIGNvbnN0IGRlcHRoQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ2FEZXB0aCcpOyAvLyBsb2NhdGlvbiA9IDJcclxuXHJcbiAgICAvLyBXZSBjYW4gbm90IHNwZWNpZnkgVW5pZm9ybXMgbG9jYXRpb25zIG1hbnVhbGx5LiBXZSBuZWVkIHRvIGdldCB0aGVtIHVzaW5nICdnZXRVbmlmb3JtTG9jYXRpb24nLlxyXG4gICAgY29uc3QgbWF0V29ybGRVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRXb3JsZCcpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG4gICAgY29uc3QgbWF0Vmlld1Byb2pVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRWaWV3UHJvaicpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG4gICAgY29uc3Qgc2FtcGxlclVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ3VTYW1wbGVyJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcblxyXG4gICAgLy8gVHlwZXNjcmlwdCB3YW50IHRvIHZlcmlmeSBpZiB0aGUgdmFyaWFibGVzIGFyZSBzZXQsIG5vdCB0aGUgYmVzdCB3YXkgdG8gZG8gaXQuXHJcbiAgICBpZihwb3NpdGlvbkF0dHJpYnV0ZSA8IDAgfHwgdXZBdHRyaWJ1dGUgPCAwIHx8IGRlcHRoQXR0cmlidXRlIDwgMCB8fCAhbWF0V29ybGRVbmlmb3JtIHx8ICFtYXRWaWV3UHJvalVuaWZvcm0gfHwgIXNhbXBsZXJVbmlmb3JtKSB7XHJcbiAgICAgICAgZm5jLnNob3dFcnJvcihgRmFpbGVkIHRvIGdldCBhdHRyaWJzL3VuaWZvcm1zIChNYXg6ICR7Z2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfQVRUUklCUyl9KTogYCArXHJcbiAgICAgICAgICAgIGAgcG9zPSR7cG9zaXRpb25BdHRyaWJ1dGV9YCArXHJcbiAgICAgICAgICAgIGAgdXY9JHt1dkF0dHJpYnV0ZX1gICtcclxuICAgICAgICAgICAgYCBkZXB0aD0ke2RlcHRoQXR0cmlidXRlfWAgK1xyXG4gICAgICAgICAgICBgIG1hdFdvcmxkPSR7ISFtYXRXb3JsZFVuaWZvcm19YCArXHJcbiAgICAgICAgICAgIGAgbWF0Vmlld1Byb2o9JHshIW1hdFZpZXdQcm9qVW5pZm9ybX1gICtcclxuICAgICAgICAgICAgYCBzYW1wbGVyPSR7ISFzYW1wbGVyVW5pZm9ybX1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29udHJvbCB0aGUgZGVwdGggb2YgdGhlIHRleHR1cmUgYXJyYXkuIFBpY2tpbmcgb3VyIGRpc3BsYXllZCB0ZXh0dXJlLlxyXG4gICAgZ2wudmVydGV4QXR0cmliMWYoZGVwdGhBdHRyaWJ1dGUsIDEpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBvdXIgdmVydGV4IGFycmF5IG9iamVjdCAoVkFPcykgYnVmZmVycy5cclxuICAgIGNvbnN0IGN1YmVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCBjdWJlVmVydGljZXMsIGN1YmVJbmRpY2VzLCB0ZXhDb29yZHNCdWZmZXIsIHBvc2l0aW9uQXR0cmlidXRlLCB1dkF0dHJpYnV0ZSk7XHJcbiAgICBpZighY3ViZVZBTykgcmV0dXJuIGZuYy5zaG93RXJyb3IoYEZhaWxlcyB0byBjcmVhdGUgVkFPczogY3ViZT0keyEhY3ViZVZBT31gKTtcclxuXHJcbiAgICBsZXQgcmFuZG9tID0gbmV3IGNscy52ZWMzKE1hdGgucmFuZG9tKCkgKiAxLCBNYXRoLnJhbmRvbSgpICogMSwgTWF0aC5yYW5kb20oKSAqIDEpO1xyXG5cclxuICAgIC8vIFN0b3JlIG91ciBjdWJlcywgZHJhdyB0aGVtIGVhY2ggdGltZS4gKGEgbG90IG9mIGRyYXcgY2FsbHMpXHJcbiAgICBjb25zdCBjdWJlcyA9IFtcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygwLCAwLjQsIDApLCAwLjQsIFVQX1ZFQywgMCwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLCAvLyBDZW50ZXJcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKHJhbmRvbSwgMC4zLCBVUF9WRUMsIGZuYy50b1JhZGlhbigyMCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygxLCAwLjEsIC0xKSwgMC4xLCBVUF9WRUMsIGZuYy50b1JhZGlhbig0MCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygtMSwgMC4xNSwgMSksIDAuMTUsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDYwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKC0xLCAwLjIsIC0xKSwgMC4yLCBVUF9WRUMsIGZuYy50b1JhZGlhbig4MCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcclxuICAgIF07XHJcblxyXG4gICAgbGV0IG1hdFZpZXcgPSBuZXcgY2xzLm1hdDQoKTtcclxuICAgIGxldCBtYXRQcm9qID0gbmV3IGNscy5tYXQ0KCk7XHJcbiAgICBsZXQgbWF0Vmlld1Byb2ogPSBuZXcgY2xzLm1hdDQoKTtcclxuXHJcbiAgICBsZXQgY2FtZXJhQW5nbGUgPSAwO1xyXG4gICAgLyogQWRkIGEgZnVuY3Rpb24gdG8gY2FsbCBpdCBlYWNoIGZyYW1lLlxyXG4gICAgICogLSBPdXRwdXQgTWVyZ2VyOiBNZXJnZSB0aGUgc2hhZGVkIHBpeGVsIGZyYWdtZW50IHdpdGggdGhlIGV4aXN0aW5nIHJlc3VsdCBpbWFnZS5cclxuICAgICAqIC0gUmFzdGVyaXplcjogV2ljaCBwaXhlbCBhcmUgcGFydCBvZiB0aGUgVmVydGljZXMgKyBXaWNoIHBhcnQgaXMgbW9kaWZpZWQgYnkgV2ViR0wuXHJcbiAgICAgKiAtIEdQVSBQcm9ncmFtOiBQYWlyIFZlcnRleCAmIEZyYWdtZW50IHNoYWRlcnMuXHJcbiAgICAgKiAtIFNldCBVbmlmb3JtcyAoY2FuIGJlIHNldCBhbnl3aGVyZSlcclxuICAgICAqIC0gRHJhdyBDYWxscyAody8gUHJpbWl0aXZlIGFzc2VtYmx5ICsgZm9yIGxvb3ApXHJcbiAgICAgKi9cclxuICAgIGxldCBsYXN0RnJhbWVUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcblxyXG4gICAgLy8gUmFuZG9taXplIGN1YmUgcm90YXRpb24gc3BlZWQgZWFjaCB0aW1lLlxyXG4gICAgbGV0IHJkbSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4MCk7XHJcblxyXG4gICAgY29uc3QgZnJhbWUgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGR0IChkZWx0YSB0aW1lKSB3aXRoIHRpbWUgaW4gc2Vjb25kcyBiZXR3ZWVuIGVhY2ggZnJhbWUuXHJcbiAgICAgICAgY29uc3QgdGhpc0ZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIGNvbnN0IGR0ID0gKHRoaXNGcmFtZVRpbWUgLSBsYXN0RnJhbWVUaW1lKSAvIDEwMDA7XHJcbiAgICAgICAgbGFzdEZyYW1lVGltZSA9IHRoaXNGcmFtZVRpbWU7XHJcblxyXG4gICAgICAgIC8vIEVhY2ggZnJhbWUgYWRkIDEwwrAgdG8gdGhlIGNhbWVyYSBhbmdsZS5cclxuICAgICAgICBjYW1lcmFBbmdsZSArPSBkdCAqIGZuYy50b1JhZGlhbigxMCk7XHJcblxyXG4gICAgICAgIC8vIEZpeGVkIGNhbWVyYSBjb29yZGluYXRlcy5cclxuICAgICAgICBjb25zdCBjYW1lcmFYID0gMyAqIE1hdGguc2luKGNhbWVyYUFuZ2xlKTtcclxuICAgICAgICBjb25zdCBjYW1lcmFaID0gMyAqIE1hdGguY29zKGNhbWVyYUFuZ2xlKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSB0aGUgJ2NhbWVyYScgbG9vayBhdCB0aGUgY2VudGVyLlxyXG4gICAgICAgIG1hdFZpZXcuc2V0TG9va0F0KFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoY2FtZXJhWCwgMSwgY2FtZXJhWiksXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAwLCAwKSxcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDEsIDApXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBTZXQgdGhlIGNhbWVyYSBGT1YsIHNjcmVlbiBzaXplIGFuZCB2aWV3IGRpc3RhbmNlLlxyXG4gICAgICAgIG1hdFByb2ouc2V0UGVyc3BlY3RpdmUoXHJcbiAgICAgICAgICAgIGZuYy50b1JhZGlhbihTRVRUSU5HUy5GT1YpLCAvLyBGT1ZcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCwgLy8gQVNQRUNUIFJBVElPXHJcbiAgICAgICAgICAgIDAuMSwgMTAwLjAgLy8gWi1ORUFSIC8gWi1GQVJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBHTE06IG1hdFZpZXdQcm9qID0gbWF0UHJvaiAqIG1hdFZpZXdcclxuICAgICAgICBtYXRWaWV3UHJvaiA9IG1hdFByb2oubXVsdGlwbHkobWF0Vmlldyk7XHJcblxyXG4gICAgICAgIC8vIFJlbmRlclxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCAqIGRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG5cclxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMDIsIDAuMDIsIDAuMDIsIDEpO1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XHJcbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNDVyk7XHJcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFZpZXdQcm9qVW5pZm9ybSwgZmFsc2UsIG1hdFZpZXdQcm9qLm1hdCk7XHJcblxyXG5cclxuICAgICAgICBjdWJlcy5mb3JFYWNoKChjdWJlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUaGUgY2VudGVyIGN1YmUgZG8gbm90IHJvdGF0ZSBvbiBpdHNlbGYuXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSAwKSB7IGN1YmUuZHJhdyhnbCwgbWF0V29ybGRVbmlmb3JtKTsgcmV0dXJuIH0gXHJcbiAgICAgICAgICAgIGN1YmUucm90YXRlKGR0ICogZm5jLnRvUmFkaWFuKHJkbSkpO1xyXG4gICAgICAgICAgICBjdWJlLmRyYXcoZ2wsIG1hdFdvcmxkVW5pZm9ybSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gTG9vcCBjYWxscywgZWFjaCB0aW1lIHRoZSBkcmF3aW5nIGlzIHJlYWR5LlxyXG4gICAgICAgIGZuYy5zZXRMb2dUaW1lKFwiZnBzXCIsIGAke01hdGguY2VpbChkdCl9bXNgKTtcclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gICAgfTtcclxuICAgIC8vIEZpcnN0IGNhbGwsIGFzIHNvb24sIGFzIHRoZSBwYWdlIGlzIGxvYWRlZC5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XHJcbiAgICBmbmMuc2V0TG9nVGltZShcImxvYWRpbmdcIiwgYCR7IERhdGUubm93KCkgLSBUMCB9bXNgKTtcclxufVxyXG5cclxuZm5jLnNob3dFcnJvcihcIk5vIEVycm9ycyEg8J+MnlwiKTtcclxuXHJcbnRyeSB7IG1haW4oKTsgfSBjYXRjaChlKSB7IGZuYy5zaG93RXJyb3IoYFVuY2F1Z2h0IGV4Y2VwdGlvbjogJHtlfWApOyB9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL21haW4udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=