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
exports.setDisplayedLoadingTime = setDisplayedLoadingTime;
exports.getShaderSource = getShaderSource;
exports.getImage = getImage;
exports.getContext = getContext;
exports.toRadian = toRadian;
exports.createStaticBuffer = createStaticBuffer;
exports.createVAOBuffer = createVAOBuffer;
exports.createProgram = createProgram;
// Display an error message to the HTML Element with id "error-container".
function showError(msg = "No Data") {
    const container = document.getElementById("error-container");
    if (container === null)
        return console.log("No Element with ID: error-container");
    const element = document.createElement('p');
    element.innerText = msg;
    container.appendChild(element);
    console.log(msg);
}
function setDisplayedLoadingTime(msg) {
    const container = document.getElementById("loading-time");
    if (container === null)
        return console.log("No Element with ID: loading-time");
    const element = document.createElement('p');
    element.innerText = msg;
    container.appendChild(element);
    console.log(msg);
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
function createVAOBuffer(gl, vertexBuffer, indexBuffer, texBuffer, posAttrib, texAttrib) {
    const vao = gl.createVertexArray();
    if (!vao) {
        showError("Failed to allocate VAO buffer.");
        return 0;
    }
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(posAttrib);
    gl.enableVertexAttribArray(texAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(posAttrib, 3, gl.FLOAT, false, 0, 0); // format: (x, y, z) (all f32)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.vertexAttribPointer(texAttrib, 2, gl.FLOAT, false, 0, 0);
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
exports.UV_COORDS = exports.CUBE_INDICES = exports.CUBE_VERTICES = void 0;
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
// For my tilemap: 
// 1,0,   1,0,    1,1,    0,1, [= Cat_OMG]
exports.UV_COORDS = new Float32Array([
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
const START = Date.now();
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
        // Target, Mipmap_Level, Internal_Format, Width, Height, Images_Count
        gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 128, 128, TEXTURES.length);
        // Flip the origin point of WebGL. (PNG format start at the top and WebGL at the bottom)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // For each textures/images we load them, and set their depth/index.
        for (let i = 0; i < TEXTURES.length; i++) {
            const image = yield fnc.getImage(TEXTURES[i]);
            // Target, Mipmap_Level, xOffset, yOffset, zOffset (Depth), Width, Height, Internal_Format, Image
            gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);
        }
        // Change the minimum and magnitude filters when scaling up and down textures.
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        // Static buffer for UV coordinates. Might be constant with texture arrays.
        const texCoordsBuffer = fnc.createStaticBuffer(gl, geo.UV_COORDS, false);
        /*
        * Getting the attributes from the vertex shader file.
        * Attributes locations can be forced in the vertex shader file with (location=number).
        * If not forced, WebGL gives them a number, you can get this number with gl.getAttribLocation().
        * Here, because we set manually the attribute location in the vertex shader,
        * we can replace gl.getAttribLocation() with the (location=number) number.
        */
        const positionAttribute = gl.getAttribLocation(program, 'vertexPosition'); // location = 0
        const texAttribute = gl.getAttribLocation(program, 'aTexCoord'); // location = 1
        const depthAttribute = gl.getAttribLocation(program, 'aDepth'); // location = 2
        // We can not specify Uniforms locations manually. We need to get them using 'getUniformLocation'.
        const matWorldUniform = gl.getUniformLocation(program, 'matWorld');
        const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj');
        const samplerUniform = gl.getUniformLocation(program, 'uSampler');
        // Typescript want to verify if the variables are set, not the best way to do it.
        if (positionAttribute < 0 || texAttribute < 0 || depthAttribute < 0 || !matWorldUniform || !matViewProjUniform || !samplerUniform) {
            fnc.showError(`Failed to get attribs/uniforms (Max: ${gl.getParameter(gl.MAX_VERTEX_ATTRIBS)}): ` +
                `pos=${positionAttribute}` +
                `tex=${texAttribute}` +
                `depth=${depthAttribute}` +
                `matWorld=${!!matWorldUniform}` +
                `matViewProj=${!!matViewProjUniform}` +
                `sampler=${!!samplerUniform}`);
            return;
        }
        // Control the depth of the texture array. Picking our displayed texture.
        gl.vertexAttrib1f(depthAttribute, 0);
        // Create our vertex array object (VAOs) buffers.
        const cubeVAO = fnc.createVAOBuffer(gl, cubeVertices, cubeIndices, texCoordsBuffer, positionAttribute, texAttribute);
        if (!cubeVAO)
            return fnc.showError(`Failes to create VAOs: cube=${!!cubeVAO}`);
        // Store our cubes, draw them each time. (a lot of draw calls)
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
         * - Output Merger: Merge the shaded pixel fragment with the existing result image.
         * - Rasterizer: Wich pixel are part of the Vertices + Wich part is modified by WebGL.
         * - GPU Program: Pair Vertex & Fragment shaders.
         * - Set Uniforms (can be set anywhere)
         * - Draw Calls (w/ Primitive assembly + for loop)
         */
        let lastFrameTime = performance.now();
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
                cube.rotate(dt * fnc.toRadian(Math.floor(Math.random() * 180)));
                cube.draw(gl, matWorldUniform);
            });
            // Loop calls, each time the drawing is ready.
            requestAnimationFrame(frame);
        });
        // First call, as soon, as the page is loaded.
        requestAnimationFrame(frame);
        fnc.setDisplayedLoadingTime(`${Date.now() - START}ms`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUNyRixHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxTQUFTO1FBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyRixDQUFDO0lBQ0QsS0FBSyxDQUFDLENBQU87UUFDVCxPQUFPLElBQUksSUFBSSxDQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzlCLENBQUM7SUFDTixDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQU8sSUFBWSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENB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QUNULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVYLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFTLEVBQUUsTUFBWSxFQUFFLEVBQVE7UUFDdkMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVqQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELCtCQUErQixDQUFDLENBQU8sRUFBRSxDQUFPLEVBQUUsQ0FBTztRQUNyRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFD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QUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDeEcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUN4RyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQzFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztTQUM1RyxDQUFDO1FBRUYsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMs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QUFFLGVBQWUsQ0FBQyxDQUFDO29CQUFDLE9BQU07Z0JBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1lBQ0gsOENBQThDO1lBQzlDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsRUFBQztRQUNGLDhDQUE4QztRQUM5QyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsdUJBQXVCLENBQUMsR0FBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBTSxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQUE7QUFFRCxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRS9CLElBQUksQ0FBQztJQUFDLElBQUksRUFBRSxDQUFDO0FBQUMsQ0FBQztBQUFDLE9BQU0sQ0FBQyxFQUFFLENBQUM7SUFBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsQ0FBQzs7Ozs7OztVQ3RMdkU7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYmdsLy4vc3JjL2NsYXNzLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL2Z1bmN0aW9uLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL2dlb21ldHJ5LnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vXG4vLyBDTEFTU1xuLy9cblxuZXhwb3J0IGNsYXNzIFNoYXBlIHtcbiAgICBwcml2YXRlIG1hdFdvcmxkID0gbmV3IG1hdDQoKTtcbiAgICBwcml2YXRlIHNjYWxlVmVjID0gbmV3IHZlYzMoKTtcbiAgICBwcml2YXRlIHJvdGF0aW9uID0gbmV3IHF1YXQoKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHBvczogdmVjMyxcbiAgICAgICAgcHJpdmF0ZSBzY2FsZTogbnVtYmVyLFxuICAgICAgICBwcml2YXRlIHJvdGF0aW9uQXhpczogdmVjMyxcbiAgICAgICAgcHJpdmF0ZSByb3RhdGlvbkFuZ2xlOiBudW1iZXIsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSB2YW86IFdlYkdMVmVydGV4QXJyYXlPYmplY3QsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBudW1JbmRpY2VzOiBudW1iZXJcbiAgICApIHsgfVxuXG4gICAgcm90YXRlKGFuZ2xlOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbkFuZ2xlID0gdGhpcy5yb3RhdGlvbkFuZ2xlICsgYW5nbGU7XG4gICAgfVxuXG4gICAgZHJhdyhnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgbWF0V29ybGRVbmlmb3JtOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbikge1xuICAgICAgICB0aGlzLnJvdGF0aW9uLnNldEF4aXNBbmdsZSh0aGlzLnJvdGF0aW9uQXhpcywgdGhpcy5yb3RhdGlvbkFuZ2xlKTtcbiAgICAgICAgdGhpcy5zY2FsZVZlYy5zZXQodGhpcy5zY2FsZSwgdGhpcy5zY2FsZSwgdGhpcy5zY2FsZSk7XG5cbiAgICAgICAgdGhpcy5tYXRXb3JsZC5zZXRGcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHRoaXMucm90YXRpb24sIHRoaXMucG9zLCB0aGlzLnNjYWxlVmVjKTtcblxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFdvcmxkVW5pZm9ybSwgZmFsc2UsIHRoaXMubWF0V29ybGQubSk7XG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIHRoaXMubnVtSW5kaWNlcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XG4gICAgfVxuICAgIFxufVxuXG5leHBvcnQgY2xhc3MgdmVjMyB7XG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciA9IDAuMCwgcHVibGljIHk6IG51bWJlciA9IDAuMCwgcHVibGljIHo6IG51bWJlciA9IDAuMCkge31cblxuICAgIGFkZCh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56KSB9XG4gICAgc3VidHJhY3QodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueikgfVxuICAgIG11bHRpcGx5KHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCAqIHYueCwgdGhpcy55ICogdi55LCB0aGlzLnogKiB2LnopIH1cbiAgICBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IHRoaXMge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLnogPSB6O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgbm9ybWFsaXplKCk6IHZlYzMge1xuICAgICAgICBjb25zdCBsZW4gPSBNYXRoLmh5cG90KHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xuICAgICAgICByZXR1cm4gbGVuID4gMCA/IG5ldyB2ZWMzKHRoaXMueCAvIGxlbiwgdGhpcy55IC8gbGVuLCB0aGlzLnogLyBsZW4pIDogbmV3IHZlYzMoKTtcbiAgICB9XG4gICAgY3Jvc3ModjogdmVjMyk6IHZlYzMge1xuICAgICAgICByZXR1cm4gbmV3IHZlYzMoXG4gICAgICAgICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXG4gICAgICAgICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXG4gICAgICAgICAgICB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2LnhcbiAgICAgICAgKTtcbiAgICB9XG4gICAgZG90KHY6IHZlYzMpOiBudW1iZXIgeyByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56IH1cbn1cblxuZXhwb3J0IGNsYXNzIHF1YXQge1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgeDogbnVtYmVyID0gMCxcbiAgICAgICAgcHVibGljIHk6IG51bWJlciA9IDAsXG4gICAgICAgIHB1YmxpYyB6OiBudW1iZXIgPSAwLFxuICAgICAgICBwdWJsaWMgdzogbnVtYmVyID0gMVxuICAgICkge31cblxuICAgIHNldEF4aXNBbmdsZShheGlzOiB2ZWMzLCBhbmdsZTogbnVtYmVyKTogdGhpcyB7XG4gICAgICAgIGNvbnN0IG5vcm0gPSBheGlzLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCBoYWxmID0gYW5nbGUgLyAyO1xuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oaGFsZik7XG5cbiAgICAgICAgdGhpcy54ID0gbm9ybS54ICogcztcbiAgICAgICAgdGhpcy55ID0gbm9ybS55ICogcztcbiAgICAgICAgdGhpcy56ID0gbm9ybS56ICogcztcbiAgICAgICAgdGhpcy53ID0gTWF0aC5jb3MoaGFsZik7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgbWF0NCB7XG4gICAgcHVibGljIG06IEZsb2F0MzJBcnJheTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLm0gPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xuICAgIH1cblxuICAgIGlkZW50aXR5KCk6IHRoaXMge1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xuICAgICAgICBtLnNldChbXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXG4gICAgICAgICAgICAwLCAwLCAwLCAxXG4gICAgICAgIF0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBjb3B5RnJvbShtYXQ6IG1hdDQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5tLnNldChtYXQubSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIFxuICAgIC8qKlxuICAgICAqICB4LCAgMCwgIDAsIDBcbiAgICAgKiAgMCwgIHksICAwLCAwXG4gICAgICogIDAsICAwLCAgeiwgMFxuICAgICAqIHR4LCB0eSwgdHosIDFcbiAgICAgKi9cbiAgICBtdWx0aXBseShvdGhlcjogbWF0NCk6IHRoaXMge1xuICAgICAgICBjb25zdCBhID0gdGhpcy5tLCBiID0gb3RoZXIubTtcbiAgICAgICAgY29uc3Qgb3V0ID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNDsgKytqKSB7XG4gICAgICAgICAgICAgICAgb3V0W2ogKiA0ICsgaV0gPVxuICAgICAgICAgICAgICAgIGFbMCAqIDQgKyBpXSAqIGJbaiAqIDQgKyAwXSArXG4gICAgICAgICAgICAgICAgYVsxICogNCArIGldICogYltqICogNCArIDFdICtcbiAgICAgICAgICAgICAgICBhWzIgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMl0gK1xuICAgICAgICAgICAgICAgIGFbMyAqIDQgKyBpXSAqIGJbaiAqIDQgKyAzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubS5zZXQob3V0KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyc3BlY3RpdmUgbWF0cmljZSwgdGhlIGZhY3RvciBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIHRhbiBvZiB0aGUgRk9WIGRpdmlkZWQgYnkgMjpcbiAgICAgKiBXZSBoYXZlIHRoZSBuZWFyIHBsYW5lIGFuZCBmYXIgcGxhbmUuIChvYmplY3RzIGFyZSBkcmF3biBpbi1iZXR3ZWVuKVxuICAgICAqIGFzcGVjdCBpcyB0aGUgYXNwZWN0LXJhdGlvIGxpa2UgMTY6OSBvbiBtb3N0IHNjcmVlbnMuXG4gICAgICogV2UgY2hhbmdlIGVhY2ggdmVydGljZXMgeCwgeSBhbmQgeiBieSB0aGUgZm9sbG93aW5nOlxuICAgICAqIDAsIDAsICAwLCAgMFxuICAgICAqIDAsIDUsICAwLCAgMFxuICAgICAqIDAsIDAsIDEwLCAxMVxuICAgICAqIDAsIDAsIDE0LCAxNVxuICAgICAqL1xuICAgIHNldFBlcnNwZWN0aXZlKGZvdlJhZDogbnVtYmVyLCBhc3BlY3Q6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlcik6IHRoaXMge1xuICAgICAgICBjb25zdCBmID0gMS4wIC8gTWF0aC50YW4oZm92UmFkIC8gMik7XG4gICAgICAgIGNvbnN0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcblxuICAgICAgICBtWzBdID0gZiAvIGFzcGVjdDtcbiAgICAgICAgbVsxXSA9IDA7XG4gICAgICAgIG1bMl0gPSAwO1xuICAgICAgICBtWzNdID0gMDtcblxuICAgICAgICBtWzRdID0gMDtcbiAgICAgICAgbVs1XSA9IGY7XG4gICAgICAgIG1bNl0gPSAwO1xuICAgICAgICBtWzddID0gMDtcblxuICAgICAgICBtWzhdID0gMDtcbiAgICAgICAgbVs5XSA9IDA7XG4gICAgICAgIG1bMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgICAgIG1bMTFdID0gLTE7XG5cbiAgICAgICAgbVsxMl0gPSAwO1xuICAgICAgICBtWzEzXSA9IDA7XG4gICAgICAgIG1bMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZjtcbiAgICAgICAgbVsxNV0gPSAwO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldExvb2tBdChleWU6IHZlYzMsIGNlbnRlcjogdmVjMywgdXA6IHZlYzMpOiB0aGlzIHtcbiAgICAgICAgY29uc3QgeiA9IGV5ZS5zdWJ0cmFjdChjZW50ZXIpLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCB4ID0gdXAuY3Jvc3Moeikubm9ybWFsaXplKCk7XG4gICAgICAgIGNvbnN0IHkgPSB6LmNyb3NzKHgpO1xuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xuXG4gICAgICAgIG1bMF0gPSB4Lng7XG4gICAgICAgIG1bMV0gPSB5Lng7XG4gICAgICAgIG1bMl0gPSB6Lng7XG4gICAgICAgIG1bM10gPSAwO1xuXG4gICAgICAgIG1bNF0gPSB4Lnk7XG4gICAgICAgIG1bNV0gPSB5Lnk7XG4gICAgICAgIG1bNl0gPSB6Lnk7XG4gICAgICAgIG1bN10gPSAwO1xuXG4gICAgICAgIG1bOF0gPSB4Lno7XG4gICAgICAgIG1bOV0gPSB5Lno7XG4gICAgICAgIG1bMTBdID0gei56O1xuICAgICAgICBtWzExXSA9IDA7XG5cbiAgICAgICAgbVsxMl0gPSAteC5kb3QoZXllKTtcbiAgICAgICAgbVsxM10gPSAteS5kb3QoZXllKTtcbiAgICAgICAgbVsxNF0gPSAtei5kb3QoZXllKTtcbiAgICAgICAgbVsxNV0gPSAxO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUocTogcXVhdCwgdjogdmVjMywgczogdmVjMyk6IHRoaXMge1xuICAgICAgICBjb25zdCB4ID0gcS54LCB5ID0gcS55LCB6ID0gcS56LCB3ID0gcS53O1xuICAgICAgICBjb25zdCBzeCA9IHMueCwgc3kgPSBzLnksIHN6ID0gcy56O1xuXG4gICAgICAgIGNvbnN0IHgyID0geCArIHgsIHkyID0geSArIHksIHoyID0geiArIHo7XG4gICAgICAgIGNvbnN0IHh4ID0geCAqIHgyLCB4eSA9IHggKiB5MiwgeHogPSB4ICogejI7XG4gICAgICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XG4gICAgICAgIGNvbnN0IHd4ID0gdyAqIHgyLCB3eSA9IHcgKiB5Miwgd3ogPSB3ICogejI7XG5cbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcblxuICAgICAgICBtWzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gICAgICAgIG1bMV0gPSAoeHkgKyB3eikgKiBzeDtcbiAgICAgICAgbVsyXSA9ICh4eiAtIHd5KSAqIHN4O1xuICAgICAgICBtWzNdID0gMDtcblxuICAgICAgICBtWzRdID0gKHh5IC0gd3opICogc3k7XG4gICAgICAgIG1bNV0gPSAoMSAtICh4eCArIHp6KSkgKiBzeTtcbiAgICAgICAgbVs2XSA9ICh5eiArIHd4KSAqIHN5O1xuICAgICAgICBtWzddID0gMDtcblxuICAgICAgICBtWzhdID0gKHh6ICsgd3kpICogc3o7XG4gICAgICAgIG1bOV0gPSAoeXogLSB3eCkgKiBzejtcbiAgICAgICAgbVsxMF0gPSAoMSAtICh4eCArIHl5KSkgKiBzejtcbiAgICAgICAgbVsxMV0gPSAwO1xuXG4gICAgICAgIG1bMTJdID0gdi54O1xuICAgICAgICBtWzEzXSA9IHYueTtcbiAgICAgICAgbVsxNF0gPSB2Lno7XG4gICAgICAgIG1bMTVdID0gMTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59IiwiLy9cbi8vIEZVTkNUSU9OXG4vL1xuXG4vLyBEaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UgdG8gdGhlIEhUTUwgRWxlbWVudCB3aXRoIGlkIFwiZXJyb3ItY29udGFpbmVyXCIuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0Vycm9yKG1zZzogc3RyaW5nID0gXCJObyBEYXRhXCIpOiB2b2lkIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVycm9yLWNvbnRhaW5lclwiKTtcbiAgICBpZihjb250YWluZXIgPT09IG51bGwpIHJldHVybiBjb25zb2xlLmxvZyhcIk5vIEVsZW1lbnQgd2l0aCBJRDogZXJyb3ItY29udGFpbmVyXCIpO1xuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgZWxlbWVudC5pbm5lclRleHQgPSBtc2c7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuICAgIGNvbnNvbGUubG9nKG1zZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXREaXNwbGF5ZWRMb2FkaW5nVGltZShtc2c6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGluZy10aW1lXCIpO1xuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gRWxlbWVudCB3aXRoIElEOiBsb2FkaW5nLXRpbWVcIilcbiAgICBjb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gbXNnO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICBjb25zb2xlLmxvZyhtc2cpO1xufVxuXG4vLyBHZXQgc2hhZGVycyBzb3VyY2UgY29kZS5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTaGFkZXJTb3VyY2UodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcbiAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgbG9hZGluZyBzaGFkZXIgY29kZSBhdCBcIiR7dXJsfVwiOiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZS50ZXh0KCk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRJbWFnZSh1cmw6IHN0cmluZyk6IFByb21pc2U8SFRNTEltYWdlRWxlbWVudD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICBpbWFnZS5zcmMgPSB1cmw7XG4gICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoaW1hZ2UpO1xuICAgIH0pXG59XG5cbi8vIFJldHVybiB0aGUgV2ViR0wgQ29udGV4dCBmcm9tIHRoZSBDYW52YXMgRWxlbWVudC5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb250ZXh0KGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IHtcbiAgICByZXR1cm4gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsMicpIGFzIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgO1xufVxuXG4vLyBDb252ZXJ0IGZyb20gZGVncmVlcyB0byByYWRpYW50LlxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGFuZ2xlOiBudW1iZXIpOiBudW1iZXIge1xuICAgIHJldHVybiBhbmdsZSAqIE1hdGguUEkgLyAxODA7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgV2ViR0wgQnVmZmVyIHR5cGUuIChPcGFxdWUgSGFuZGxlKVxuICogLSBTVEFUSUNfRFJBVyA6IHdvbnQgdXBkYXRlIG9mdGVuLCBidXQgb2Z0ZW4gdXNlZC5cbiAqIC0gQVJSQVlfQlVGRkVSIDogaW5kaWNhdGUgdGhlIHBsYWNlIHRvIHN0b3JlIHRoZSBBcnJheS5cbiAqIC0gRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiBVc2VkIGZvciBpbmRpY2VzIHdpdGggY3ViZSBzaGFwZXMgZHJhd2luZy5cbiAqIEJpbmQgdGhlIEJ1ZmZlciB0byB0aGUgQ1BVLCBhZGQgdGhlIEFycmF5IHRvIHRoZSBCdWZmZXIgYW5kIENsZWFyIGFmdGVyIHVzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0YXRpY0J1ZmZlcihnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgZGF0YTogQXJyYXlCdWZmZXIsIGlzSW5kaWNlOiBib29sZWFuKTogV2ViR0xCdWZmZXIge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgIGNvbnN0IHR5cGUgPSAoaXNJbmRpY2UgPT0gdHJ1ZSkgPyBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiA6IGdsLkFSUkFZX0JVRkZFUlxuICAgIGlmKCFidWZmZXIpIHsgXG4gICAgICAgIHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBidWZmZXIgc3BhY2VcIik7IFxuICAgICAgICByZXR1cm4gMDsgXG4gICAgfVxuXG4gICAgZ2wuYmluZEJ1ZmZlcih0eXBlLCBidWZmZXIpO1xuICAgIGdsLmJ1ZmZlckRhdGEodHlwZSwgZGF0YSwgZ2wuU1RBVElDX0RSQVcpO1xuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgbnVsbCk7XG4gICAgcmV0dXJuIGJ1ZmZlclxufVxuXG4vKipcbiAqIENyZWF0ZSB2ZXJ0ZXggYXJyYXkgb2JqZWN0IGJ1ZmZlcnMsIGl0IHJlYWQgdGhlIHZlcnRpY2VzIGZyb20gR1BVIEJ1ZmZlci5cbiAqIFRoZSB2ZXJ0ZXggYnVmZmVyIGNvbnRhaW5zIHRoZSB2ZXJ0aWNlcyBjb29yZGluYXRlcyAoY2FuIGFsc28gY29udGFpbnMgY29sb3IgYW5kIHNpemUpLlxuICogVGhlIGluZGV4IGJ1ZmZlciBjb250YWlucyB3aWNoIHZlcnRleCBuZWVkIHRvIGJlIGRyYXduIG9uIHNjZW5lIHRvIGF2b2lkIGR1cGxpY2F0ZXMgdmVydGljZXMuXG4gKiBJbiBjYXNlIG9mIGNvbG9ycywgYW4gb2Zmc2V0IG9mIDMgZmxvYXRzIGlzIHVzZWQgZWFjaCB0aW1lIHRvIGF2b2lkICh4LCB5LCB6KSBjb29yZGluYXRlcy5cbiAqIFRoZSB2ZXJ0ZXggc2hhZGVyIHBsYWNlIHRoZSB2ZXJ0aWNlcyBpbiBjbGlwIHNwYWNlIGFuZCB0aGUgZnJhZ21lbnQgc2hhZGVyIGNvbG9yIHRoZSBwaXhlbHMuIChEZWZhdWx0OiAwKVxuICogVmVydGV4QXR0cmliUG9pbnRlciBbSW5kZXgsIFNpemUsIFR5cGUsIElzTm9ybWFsaXplZCwgU3RyaWRlLCBPZmZzZXRdXG4gKiAtIEluZGV4IChsb2NhdGlvbilcbiAqIC0gU2l6ZSAoQ29tcG9uZW50IHBlciB2ZWN0b3IpXG4gKiAtIFR5cGVcbiAqIC0gSXNOb3JtYWxpemVkIChpbnQgdG8gZmxvYXRzLCBmb3IgY29sb3JzIHRyYW5zZm9ybSBbMCwgMjU1XSB0byBmbG9hdCBbMCwgMV0pXG4gKiAtIFN0cmlkZSAoRGlzdGFuY2UgYmV0d2VlbiBlYWNoIHZlcnRleCBpbiB0aGUgYnVmZmVyKVxuICogLSBPZmZzZXQgKE51bWJlciBvZiBza2lwZWQgYnl0ZXMgYmVmb3JlIHJlYWRpbmcgYXR0cmlidXRlcylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZBT0J1ZmZlcihcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcbiAgICB2ZXJ0ZXhCdWZmZXI6IFdlYkdMQnVmZmVyLCBpbmRleEJ1ZmZlcjogV2ViR0xCdWZmZXIsIHRleEJ1ZmZlcjogV2ViR0xCdWZmZXIsXG4gICAgcG9zQXR0cmliOiBudW1iZXIsIHRleEF0dHJpYjogbnVtYmVyXG4pOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0IHtcbiAgICBjb25zdCB2YW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xuICAgIGlmKCF2YW8pIHsgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGFsbG9jYXRlIFZBTyBidWZmZXIuXCIpOyByZXR1cm4gMDsgfVxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHBvc0F0dHJpYik7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGV4QXR0cmliKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHBvc0F0dHJpYiwgMywgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTsgLy8gZm9ybWF0OiAoeCwgeSwgeikgKGFsbCBmMzIpXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB0ZXhCdWZmZXIpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodGV4QXR0cmliLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgIHJldHVybiB2YW87XG59XG5cbi8vIENyZWF0ZSBhIHByb2dyYW0gYW5kIGxpbmsgdGhlIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlIHRvIGl0LlxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oXG4gICAgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsXG4gICAgdmVydGV4U2hhZGVyU3JjOiBzdHJpbmcsXG4gICAgZnJhZ21lbnRTaGFkZXJTcmM6IHN0cmluZ1xuKTogV2ViR0xQcm9ncmFtIHtcbiAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XG4gICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcbiAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydGV4U2hhZGVyU3JjKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRleFNoYWRlcik7XG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0ZXhTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKTtcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gc2hhZGVyIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTaGFkZXJTcmMpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xuICAgIGlmKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoZnJhZ21lbnRTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLy8gUHJvZ3JhbSBzZXQgdXAgZm9yIFVuaWZvcm1zLlxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG4gICAgaWYoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSk7XG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHByb2dyYW0gZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBwcm9ncmFtO1xufSIsIi8vIFZlcnRleCBidWZmZXIgZm9ybWF0OiBYWVpcblxuLy9cbi8vIEN1YmUgZ2VvbWV0cnlcbi8vIHRha2VuIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJHTF9BUEkvVHV0b3JpYWwvQ3JlYXRpbmdfM0Rfb2JqZWN0c191c2luZ19XZWJHTFxuZXhwb3J0IGNvbnN0IENVQkVfVkVSVElDRVMgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgLy8gRnJvbnQgZmFjZVxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAwIEFcbiAgMS4wLCAtMS4wLCAxLjAsICAgLy8gMSBCXG4gIDEuMCwgMS4wLCAxLjAsICAgIC8vIDIgQ1xuICAtMS4wLCAxLjAsIDEuMCwgICAvLyAzIERcblxuICAvLyBCYWNrIGZhY2VcbiAgLTEuMCwgLTEuMCwgLTEuMCwgLy8gNFxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyA1XG4gIDEuMCwgMS4wLCAtMS4wLCAgIC8vIDZcbiAgMS4wLCAtMS4wLCAtMS4wLCAgLy8gN1xuXG4gIC8vIFRvcCBmYWNlXG4gIC0xLjAsIDEuMCwgLTEuMCwgIC8vIDhcbiAgLTEuMCwgMS4wLCAxLjAsICAgLy8gOVxuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAxMFxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAxMVxuXG4gIC8vIEJvdHRvbSBmYWNlXG4gIC0xLjAsIC0xLjAsIC0xLjAsIC8vIDEyXG4gIDEuMCwgLTEuMCwgLTEuMCwgIC8vIDEzXG4gIDEuMCwgLTEuMCwgMS4wLCAgIC8vIDE0XG4gIC0xLjAsIC0xLjAsIDEuMCwgIC8vIDE1XG5cbiAgLy8gUmlnaHQgZmFjZVxuICAxLjAsIC0xLjAsIC0xLjAsICAvLyAxNlxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAxN1xuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAxOFxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxOVxuXG4gIC8vIExlZnQgZmFjZVxuICAtMS4wLCAtMS4wLCAtMS4wLCAvLyAyMFxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAyMVxuICAtMS4wLCAxLjAsIDEuMCwgICAvLyAyMlxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyAyM1xuXSk7XG5cbmV4cG9ydCBjb25zdCBDVUJFX0lORElDRVMgPSBuZXcgVWludDE2QXJyYXkoW1xuICAwLCAxLCAyLFxuICAwLCAyLCAzLCAvLyBmcm9udFxuICA0LCA1LCA2LFxuICA0LCA2LCA3LCAvLyBiYWNrXG4gIDgsIDksIDEwLFxuICA4LCAxMCwgMTEsIC8vIHRvcFxuICAxMiwgMTMsIDE0LFxuICAxMiwgMTQsIDE1LCAvLyBib3R0b21cbiAgMTYsIDE3LCAxOCxcbiAgMTYsIDE4LCAxOSwgLy8gcmlnaHRcbiAgMjAsIDIxLCAyMixcbiAgMjAsIDIyLCAyMywgLy8gbGVmdFxuXSk7XG5cbi8vIEZvciBteSB0aWxlbWFwOiBcbi8vIDEsMCwgICAxLDAsICAgIDEsMSwgICAgMCwxLCBbPSBDYXRfT01HXVxuZXhwb3J0IGNvbnN0IFVWX0NPT1JEUyA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgLy8gZnJvbnRcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsIC8vIGJhY2tcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsICAgLy8gdG9wXG4gIDAsMCwgICAxLDAsICAgIDEsMSwgICAgMCwxLCAgIC8vIGJvdHRvbVxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyByaWdodFxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBsZWZ0XG5dKSIsImltcG9ydCAqIGFzIGZuYyBmcm9tIFwiLi9mdW5jdGlvblwiO1xuaW1wb3J0ICogYXMgY2xzIGZyb20gXCIuL2NsYXNzXCI7XG5pbXBvcnQgKiBhcyBnZW8gZnJvbSBcIi4vZ2VvbWV0cnlcIjtcblxuLy9cbi8vIE1BSU5cbi8vXG5cbmNvbnN0IFVQX1ZFQyA9IG5ldyBjbHMudmVjMygwLCAxLCAwKTtcbmNvbnN0IFNUQVJUID0gRGF0ZS5ub3coKTtcbmNvbnN0IFRFWFRVUkVTID0gW1xuICAgICcuL2ltZy9jYXRfb21nLnBuZycsXG4gICAgJy4vaW1nL2NhdF9zdGFyZS5wbmcnXG5dXG5jb25zdCBTRVRUSU5HUyA9IHtcbiAgICBGT1YgOiA2MC4wLCAvLyBEZWZhdWx0OiA2MC4wXG4gICAgUk9UQVRJT05fQU5HTEUgOiAxMC4wLCAvLyBEZWZhdWx0OiAxMC4wXG59XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICAvLyBDYW52YXMgRWxlbWVudCBhbmQgUmVuZGVyaW5nIENvbnRleHQuXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbC1jYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XG4gICAgY29uc3QgZ2wgPSBmbmMuZ2V0Q29udGV4dChjYW52YXMpO1xuXG4gICAgLy8gQ3ViZSB2ZXJ0aWNlcy9pbmRpY2VzIGJ1ZmZlcnMuXG4gICAgY29uc3QgY3ViZVZlcnRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfVkVSVElDRVMsIGZhbHNlKTtcbiAgICBjb25zdCBjdWJlSW5kaWNlcyA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIGdlby5DVUJFX0lORElDRVMsIHRydWUpO1xuXG4gICAgaWYgKCFjdWJlVmVydGljZXMgfHwgIWN1YmVJbmRpY2VzKSB7XG4gICAgICAgIGZuYy5zaG93RXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgZ2VvOiBjdWJlOiAodj0keyEhY3ViZVZlcnRpY2VzfSBpPSR7Y3ViZUluZGljZXN9KWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRmV0Y2ggc2hhZGVycyBjb2RlIGFuZCBsaW5rIHRoZW0gdG8gYSBwcm9ncmFtLlxuICAgIGNvbnN0IHZlcnRleFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy92ZXJ0ZXhfc2hhZGVyLnZlcnQnKTtcbiAgICBjb25zdCBmcmFnbWVudFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy9mcmFnbWVudF9zaGFkZXIuZnJhZycpO1xuICAgIGNvbnN0IHByb2dyYW0gPSBmbmMuY3JlYXRlUHJvZ3JhbShnbCwgdmVydGV4U3JjLCBmcmFnbWVudFNyYyk7XG5cbiAgICAvLyBDcmVhdGUgYSB0ZXh0dXJlIGFuZCBiaW5kIG91ciBpbWFnZS5cbiAgICBjb25zdCB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkRfQVJSQVksIHRleHR1cmUpO1xuXG4gICAgLy8gVGFyZ2V0LCBNaXBtYXBfTGV2ZWwsIEludGVybmFsX0Zvcm1hdCwgV2lkdGgsIEhlaWdodCwgSW1hZ2VzX0NvdW50XG4gICAgZ2wudGV4U3RvcmFnZTNEKGdsLlRFWFRVUkVfMkRfQVJSQVksIDEsIGdsLlJHQkE4LCAxMjgsIDEyOCwgVEVYVFVSRVMubGVuZ3RoKTtcblxuICAgIC8vIEZsaXAgdGhlIG9yaWdpbiBwb2ludCBvZiBXZWJHTC4gKFBORyBmb3JtYXQgc3RhcnQgYXQgdGhlIHRvcCBhbmQgV2ViR0wgYXQgdGhlIGJvdHRvbSlcbiAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcblxuICAgIC8vIEZvciBlYWNoIHRleHR1cmVzL2ltYWdlcyB3ZSBsb2FkIHRoZW0sIGFuZCBzZXQgdGhlaXIgZGVwdGgvaW5kZXguXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBURVhUVVJFUy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpbWFnZSA9IGF3YWl0IGZuYy5nZXRJbWFnZShURVhUVVJFU1tpXSk7XG4gICAgICAgIC8vIFRhcmdldCwgTWlwbWFwX0xldmVsLCB4T2Zmc2V0LCB5T2Zmc2V0LCB6T2Zmc2V0IChEZXB0aCksIFdpZHRoLCBIZWlnaHQsIEludGVybmFsX0Zvcm1hdCwgSW1hZ2VcbiAgICAgICAgZ2wudGV4U3ViSW1hZ2UzRChnbC5URVhUVVJFXzJEX0FSUkFZLCAwLCAwLCAwLCBpLCAxMjgsIDEyOCwgMSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UpO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSB0aGUgbWluaW11bSBhbmQgbWFnbml0dWRlIGZpbHRlcnMgd2hlbiBzY2FsaW5nIHVwIGFuZCBkb3duIHRleHR1cmVzLlxuICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5ORUFSRVNUKTtcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG5cbiAgICAvLyBTdGF0aWMgYnVmZmVyIGZvciBVViBjb29yZGluYXRlcy4gTWlnaHQgYmUgY29uc3RhbnQgd2l0aCB0ZXh0dXJlIGFycmF5cy5cbiAgICBjb25zdCB0ZXhDb29yZHNCdWZmZXIgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uVVZfQ09PUkRTLCBmYWxzZSk7XG5cbiAgICAvKlxuICAgICogR2V0dGluZyB0aGUgYXR0cmlidXRlcyBmcm9tIHRoZSB2ZXJ0ZXggc2hhZGVyIGZpbGUuXG4gICAgKiBBdHRyaWJ1dGVzIGxvY2F0aW9ucyBjYW4gYmUgZm9yY2VkIGluIHRoZSB2ZXJ0ZXggc2hhZGVyIGZpbGUgd2l0aCAobG9jYXRpb249bnVtYmVyKS5cbiAgICAqIElmIG5vdCBmb3JjZWQsIFdlYkdMIGdpdmVzIHRoZW0gYSBudW1iZXIsIHlvdSBjYW4gZ2V0IHRoaXMgbnVtYmVyIHdpdGggZ2wuZ2V0QXR0cmliTG9jYXRpb24oKS5cbiAgICAqIEhlcmUsIGJlY2F1c2Ugd2Ugc2V0IG1hbnVhbGx5IHRoZSBhdHRyaWJ1dGUgbG9jYXRpb24gaW4gdGhlIHZlcnRleCBzaGFkZXIsXG4gICAgKiB3ZSBjYW4gcmVwbGFjZSBnbC5nZXRBdHRyaWJMb2NhdGlvbigpIHdpdGggdGhlIChsb2NhdGlvbj1udW1iZXIpIG51bWJlci5cbiAgICAqL1xuICAgIGNvbnN0IHBvc2l0aW9uQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleFBvc2l0aW9uJyk7IC8vIGxvY2F0aW9uID0gMFxuICAgIGNvbnN0IHRleEF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICdhVGV4Q29vcmQnKTsgLy8gbG9jYXRpb24gPSAxXG4gICAgY29uc3QgZGVwdGhBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYURlcHRoJyk7IC8vIGxvY2F0aW9uID0gMlxuXG4gICAgLy8gV2UgY2FuIG5vdCBzcGVjaWZ5IFVuaWZvcm1zIGxvY2F0aW9ucyBtYW51YWxseS4gV2UgbmVlZCB0byBnZXQgdGhlbSB1c2luZyAnZ2V0VW5pZm9ybUxvY2F0aW9uJy5cbiAgICBjb25zdCBtYXRXb3JsZFVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFdvcmxkJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XG4gICAgY29uc3QgbWF0Vmlld1Byb2pVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRWaWV3UHJvaicpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xuICAgIGNvbnN0IHNhbXBsZXJVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICd1U2FtcGxlcicpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xuXG4gICAgLy8gVHlwZXNjcmlwdCB3YW50IHRvIHZlcmlmeSBpZiB0aGUgdmFyaWFibGVzIGFyZSBzZXQsIG5vdCB0aGUgYmVzdCB3YXkgdG8gZG8gaXQuXG4gICAgaWYocG9zaXRpb25BdHRyaWJ1dGUgPCAwIHx8IHRleEF0dHJpYnV0ZSA8IDAgfHwgZGVwdGhBdHRyaWJ1dGUgPCAwIHx8ICFtYXRXb3JsZFVuaWZvcm0gfHwgIW1hdFZpZXdQcm9qVW5pZm9ybSB8fCAhc2FtcGxlclVuaWZvcm0pIHtcbiAgICAgICAgZm5jLnNob3dFcnJvcihgRmFpbGVkIHRvIGdldCBhdHRyaWJzL3VuaWZvcm1zIChNYXg6ICR7Z2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfQVRUUklCUyl9KTogYCArXG4gICAgICAgICAgICBgcG9zPSR7cG9zaXRpb25BdHRyaWJ1dGV9YCArXG4gICAgICAgICAgICBgdGV4PSR7dGV4QXR0cmlidXRlfWAgK1xuICAgICAgICAgICAgYGRlcHRoPSR7ZGVwdGhBdHRyaWJ1dGV9YCArXG4gICAgICAgICAgICBgbWF0V29ybGQ9JHshIW1hdFdvcmxkVW5pZm9ybX1gICtcbiAgICAgICAgICAgIGBtYXRWaWV3UHJvaj0keyEhbWF0Vmlld1Byb2pVbmlmb3JtfWAgK1xuICAgICAgICAgICAgYHNhbXBsZXI9JHshIXNhbXBsZXJVbmlmb3JtfWBcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENvbnRyb2wgdGhlIGRlcHRoIG9mIHRoZSB0ZXh0dXJlIGFycmF5LiBQaWNraW5nIG91ciBkaXNwbGF5ZWQgdGV4dHVyZS5cbiAgICBnbC52ZXJ0ZXhBdHRyaWIxZihkZXB0aEF0dHJpYnV0ZSwgMCk7XG5cbiAgICAvLyBDcmVhdGUgb3VyIHZlcnRleCBhcnJheSBvYmplY3QgKFZBT3MpIGJ1ZmZlcnMuXG4gICAgY29uc3QgY3ViZVZBTyA9IGZuYy5jcmVhdGVWQU9CdWZmZXIoZ2wsIGN1YmVWZXJ0aWNlcywgY3ViZUluZGljZXMsIHRleENvb3Jkc0J1ZmZlciwgcG9zaXRpb25BdHRyaWJ1dGUsIHRleEF0dHJpYnV0ZSk7XG4gICAgaWYoIWN1YmVWQU8pIHJldHVybiBmbmMuc2hvd0Vycm9yKGBGYWlsZXMgdG8gY3JlYXRlIFZBT3M6IGN1YmU9JHshIWN1YmVWQU99YCk7XG5cbiAgICAvLyBTdG9yZSBvdXIgY3ViZXMsIGRyYXcgdGhlbSBlYWNoIHRpbWUuIChhIGxvdCBvZiBkcmF3IGNhbGxzKVxuICAgIGNvbnN0IGN1YmVzID0gW1xuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygwLCAwLjQsIDApLCAwLjQsIFVQX1ZFQywgMCwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLCAvLyBDZW50ZXJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoMSwgMC4wNSwgMSksIDAuMywgVVBfVkVDLCBmbmMudG9SYWRpYW4oMjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDEsIDAuMSwgLTEpLCAwLjEsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDQwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygtMSwgMC4xNSwgMSksIDAuMTUsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDYwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygtMSwgMC4yLCAtMSksIDAuMiwgVVBfVkVDLCBmbmMudG9SYWRpYW4oODApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXG4gICAgXTtcblxuICAgIGxldCBtYXRWaWV3ID0gbmV3IGNscy5tYXQ0KCk7XG4gICAgbGV0IG1hdFByb2ogPSBuZXcgY2xzLm1hdDQoKTtcbiAgICBsZXQgbWF0Vmlld1Byb2ogPSBuZXcgY2xzLm1hdDQoKTtcblxuICAgIGxldCBjYW1lcmFBbmdsZSA9IDA7XG4gICAgLyoqXG4gICAgICogQWRkIGEgZnVuY3Rpb24gdG8gY2FsbCBpdCBlYWNoIGZyYW1lLlxuICAgICAqIC0gT3V0cHV0IE1lcmdlcjogTWVyZ2UgdGhlIHNoYWRlZCBwaXhlbCBmcmFnbWVudCB3aXRoIHRoZSBleGlzdGluZyByZXN1bHQgaW1hZ2UuXG4gICAgICogLSBSYXN0ZXJpemVyOiBXaWNoIHBpeGVsIGFyZSBwYXJ0IG9mIHRoZSBWZXJ0aWNlcyArIFdpY2ggcGFydCBpcyBtb2RpZmllZCBieSBXZWJHTC5cbiAgICAgKiAtIEdQVSBQcm9ncmFtOiBQYWlyIFZlcnRleCAmIEZyYWdtZW50IHNoYWRlcnMuXG4gICAgICogLSBTZXQgVW5pZm9ybXMgKGNhbiBiZSBzZXQgYW55d2hlcmUpXG4gICAgICogLSBEcmF3IENhbGxzICh3LyBQcmltaXRpdmUgYXNzZW1ibHkgKyBmb3IgbG9vcClcbiAgICAgKi9cbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGZyYW1lID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBDYWxjdWxhdGUgZHQgKGRlbHRhIHRpbWUpIHdpdGggdGltZSBpbiBzZWNvbmRzIGJldHdlZW4gZWFjaCBmcmFtZS5cbiAgICAgICAgY29uc3QgdGhpc0ZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBjb25zdCBkdCA9ICh0aGlzRnJhbWVUaW1lIC0gbGFzdEZyYW1lVGltZSkgLyAxMDAwO1xuICAgICAgICBsYXN0RnJhbWVUaW1lID0gdGhpc0ZyYW1lVGltZTtcblxuICAgICAgICAvLyBFYWNoIGZyYW1lIGFkZCAxMMKwIHRvIHRoZSBjYW1lcmEgYW5nbGUuXG4gICAgICAgIGNhbWVyYUFuZ2xlICs9IGR0ICogZm5jLnRvUmFkaWFuKDEwKTtcblxuICAgICAgICAvLyBGaXhlZCBjYW1lcmEgY29vcmRpbmF0ZXMuXG4gICAgICAgIGNvbnN0IGNhbWVyYVggPSAzICogTWF0aC5zaW4oY2FtZXJhQW5nbGUpO1xuICAgICAgICBjb25zdCBjYW1lcmFaID0gMyAqIE1hdGguY29zKGNhbWVyYUFuZ2xlKTtcblxuICAgICAgICAvLyBNYWtlIHRoZSAnY2FtZXJhJyBsb29rIGF0IHRoZSBjZW50ZXIuXG4gICAgICAgIG1hdFZpZXcuc2V0TG9va0F0KFxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKGNhbWVyYVgsIDEsIGNhbWVyYVopLFxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDAsIDApLFxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDEsIDApXG4gICAgICAgICk7XG4gICAgICAgIC8vIFNldCB0aGUgY2FtZXJhIEZPViwgc2NyZWVuIHNpemUgYW5kIHZpZXcgZGlzdGFuY2UuXG4gICAgICAgIG1hdFByb2ouc2V0UGVyc3BlY3RpdmUoXG4gICAgICAgICAgICBmbmMudG9SYWRpYW4oU0VUVElOR1MuRk9WKSwgLy8gRk9WXG4gICAgICAgICAgICBjYW52YXMud2lkdGggLyBjYW52YXMuaGVpZ2h0LCAvLyBBU1BFQ1QgUkFUSU9cbiAgICAgICAgICAgIDAuMSwgMTAwLjAgLy8gWi1ORUFSIC8gWi1GQVJcbiAgICAgICAgKTtcblxuICAgICAgICAvLyBHTE06IG1hdFZpZXdQcm9qID0gbWF0UHJvaiAqIG1hdFZpZXdcbiAgICAgICAgbWF0Vmlld1Byb2ogPSBtYXRQcm9qLm11bHRpcGx5KG1hdFZpZXcpO1xuXG4gICAgICAgIC8vIFJlbmRlclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodCAqIGRldmljZVBpeGVsUmF0aW87XG5cbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAyLCAwLjAyLCAwLjAyLCAxKTtcbiAgICAgICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xuICAgICAgICBnbC5jdWxsRmFjZShnbC5CQUNLKTtcbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNDVyk7XG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRWaWV3UHJvalVuaWZvcm0sIGZhbHNlLCBtYXRWaWV3UHJvai5tKTtcblxuICAgICAgICBjdWJlcy5mb3JFYWNoKChjdWJlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgLy8gVGhlIGNlbnRlciBjdWJlIGRvIG5vdCByb3RhdGUgb24gaXRzZWxmLlxuICAgICAgICAgICAgaWYgKGluZGV4ID09IDApIHsgY3ViZS5kcmF3KGdsLCBtYXRXb3JsZFVuaWZvcm0pOyByZXR1cm4gfSBcbiAgICAgICAgICAgIGN1YmUucm90YXRlKGR0ICogZm5jLnRvUmFkaWFuKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4MCkpKTtcbiAgICAgICAgICAgIGN1YmUuZHJhdyhnbCwgbWF0V29ybGRVbmlmb3JtKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIExvb3AgY2FsbHMsIGVhY2ggdGltZSB0aGUgZHJhd2luZyBpcyByZWFkeS5cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgICB9O1xuICAgIC8vIEZpcnN0IGNhbGwsIGFzIHNvb24sIGFzIHRoZSBwYWdlIGlzIGxvYWRlZC5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgIGZuYy5zZXREaXNwbGF5ZWRMb2FkaW5nVGltZShgJHsgRGF0ZS5ub3coKSAtIFNUQVJUIH1tc2ApO1xufVxuXG5mbmMuc2hvd0Vycm9yKFwiTm8gRXJyb3JzISDwn4yeXCIpO1xuXG50cnkgeyBtYWluKCk7IH0gY2F0Y2goZSkgeyBmbmMuc2hvd0Vycm9yKGBVbmNhdWdodCBleGNlcHRpb246ICR7ZX1gKTsgfSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9tYWluLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9