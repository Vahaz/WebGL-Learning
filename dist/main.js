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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUNyRixHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxTQUFTO1FBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyRixDQUFDO0lBQ0QsS0FBSyxDQUFDLENBQU87UUFDVCxPQUFPLElBQUksSUFBSSxDQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzlCLENBQUM7SUFDTixDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQU8sSUFBWSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENB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QUNULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVYLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFTLEVBQUUsTUFBWSxFQUFFLEVBQVE7UUFDdkMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVqQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELCtCQUErQixDQUFDLENBQU8sRUFBRSxDQUFPLEVBQUUsQ0FBTztRQUNyRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFD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QUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7WUFDeEcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztZQUN4RyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO1lBQzFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztTQUM1RyxDQUFDO1FBRUYsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxXQUFXLEdBQUcsSUFBSSxHQUFHLENBQUMs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QUFFLGVBQWUsQ0FBQyxDQUFDO29CQUFDLE9BQU07Z0JBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1lBQ0gsOENBQThDO1lBQzlDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsRUFBQztRQUNGLDhDQUE4QztRQUM5QyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixHQUFHLENBQUMsdUJBQXVCLENBQUMsR0FBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBTSxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDO0NBQUE7QUFFRCxHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBRS9CLElBQUksQ0FBQztJQUFDLElBQUksRUFBRSxDQUFDO0FBQUMsQ0FBQztBQUFDLE9BQU0sQ0FBQyxFQUFFLENBQUM7SUFBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsQ0FBQzs7Ozs7OztVQ3RMdkU7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYmdsLy4vc3JjL2NsYXNzLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL2Z1bmN0aW9uLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL2dlb21ldHJ5LnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vXHJcbi8vIENMQVNTXHJcbi8vXHJcblxyXG5leHBvcnQgY2xhc3MgU2hhcGUge1xyXG4gICAgcHJpdmF0ZSBtYXRXb3JsZCA9IG5ldyBtYXQ0KCk7XHJcbiAgICBwcml2YXRlIHNjYWxlVmVjID0gbmV3IHZlYzMoKTtcclxuICAgIHByaXZhdGUgcm90YXRpb24gPSBuZXcgcXVhdCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgcG9zOiB2ZWMzLFxyXG4gICAgICAgIHByaXZhdGUgc2NhbGU6IG51bWJlcixcclxuICAgICAgICBwcml2YXRlIHJvdGF0aW9uQXhpczogdmVjMyxcclxuICAgICAgICBwcml2YXRlIHJvdGF0aW9uQW5nbGU6IG51bWJlcixcclxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0LFxyXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBudW1JbmRpY2VzOiBudW1iZXJcclxuICAgICkgeyB9XHJcblxyXG4gICAgcm90YXRlKGFuZ2xlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnJvdGF0aW9uQW5nbGUgPSB0aGlzLnJvdGF0aW9uQW5nbGUgKyBhbmdsZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBtYXRXb3JsZFVuaWZvcm06IFdlYkdMVW5pZm9ybUxvY2F0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5zZXRBeGlzQW5nbGUodGhpcy5yb3RhdGlvbkF4aXMsIHRoaXMucm90YXRpb25BbmdsZSk7XHJcbiAgICAgICAgdGhpcy5zY2FsZVZlYy5zZXQodGhpcy5zY2FsZSwgdGhpcy5zY2FsZSwgdGhpcy5zY2FsZSk7XHJcblxyXG4gICAgICAgIHRoaXMubWF0V29ybGQuc2V0RnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSh0aGlzLnJvdGF0aW9uLCB0aGlzLnBvcywgdGhpcy5zY2FsZVZlYyk7XHJcblxyXG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYobWF0V29ybGRVbmlmb3JtLCBmYWxzZSwgdGhpcy5tYXRXb3JsZC5tKTtcclxuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52YW8pO1xyXG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIHRoaXMubnVtSW5kaWNlcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xyXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgIH1cclxuICAgIFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgdmVjMyB7XHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgeDogbnVtYmVyID0gMC4wLCBwdWJsaWMgeTogbnVtYmVyID0gMC4wLCBwdWJsaWMgejogbnVtYmVyID0gMC4wKSB7fVxyXG5cclxuICAgIGFkZCh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSwgdGhpcy56ICsgdi56KSB9XHJcbiAgICBzdWJ0cmFjdCh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSwgdGhpcy56IC0gdi56KSB9XHJcbiAgICBtdWx0aXBseSh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56KSB9XHJcbiAgICBzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnogPSB6O1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgbm9ybWFsaXplKCk6IHZlYzMge1xyXG4gICAgICAgIGNvbnN0IGxlbiA9IE1hdGguaHlwb3QodGhpcy54LCB0aGlzLnksIHRoaXMueik7XHJcbiAgICAgICAgcmV0dXJuIGxlbiA+IDAgPyBuZXcgdmVjMyh0aGlzLnggLyBsZW4sIHRoaXMueSAvIGxlbiwgdGhpcy56IC8gbGVuKSA6IG5ldyB2ZWMzKCk7XHJcbiAgICB9XHJcbiAgICBjcm9zcyh2OiB2ZWMzKTogdmVjMyB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKFxyXG4gICAgICAgICAgICB0aGlzLnkgKiB2LnogLSB0aGlzLnogKiB2LnksXHJcbiAgICAgICAgICAgIHRoaXMueiAqIHYueCAtIHRoaXMueCAqIHYueixcclxuICAgICAgICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuICAgIGRvdCh2OiB2ZWMzKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYueiB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBxdWF0IHtcclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHB1YmxpYyB4OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB5OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB6OiBudW1iZXIgPSAwLFxyXG4gICAgICAgIHB1YmxpYyB3OiBudW1iZXIgPSAxXHJcbiAgICApIHt9XHJcblxyXG4gICAgc2V0QXhpc0FuZ2xlKGF4aXM6IHZlYzMsIGFuZ2xlOiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBub3JtID0gYXhpcy5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCBoYWxmID0gYW5nbGUgLyAyO1xyXG4gICAgICAgIGNvbnN0IHMgPSBNYXRoLnNpbihoYWxmKTtcclxuXHJcbiAgICAgICAgdGhpcy54ID0gbm9ybS54ICogcztcclxuICAgICAgICB0aGlzLnkgPSBub3JtLnkgKiBzO1xyXG4gICAgICAgIHRoaXMueiA9IG5vcm0ueiAqIHM7XHJcbiAgICAgICAgdGhpcy53ID0gTWF0aC5jb3MoaGFsZik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgbWF0NCB7XHJcbiAgICBwdWJsaWMgbTogRmxvYXQzMkFycmF5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubSA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xyXG4gICAgICAgIHRoaXMuaWRlbnRpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZGVudGl0eSgpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tO1xyXG4gICAgICAgIG0uc2V0KFtcclxuICAgICAgICAgICAgMSwgMCwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMSwgMCwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMSwgMCxcclxuICAgICAgICAgICAgMCwgMCwgMCwgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvcHlGcm9tKG1hdDogbWF0NCk6IHRoaXMge1xyXG4gICAgICAgIHRoaXMubS5zZXQobWF0Lm0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiAgeCwgIDAsICAwLCAwXHJcbiAgICAgKiAgMCwgIHksICAwLCAwXHJcbiAgICAgKiAgMCwgIDAsICB6LCAwXHJcbiAgICAgKiB0eCwgdHksIHR6LCAxXHJcbiAgICAgKi9cclxuICAgIG11bHRpcGx5KG90aGVyOiBtYXQ0KTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgYSA9IHRoaXMubSwgYiA9IG90aGVyLm07XHJcbiAgICAgICAgY29uc3Qgb3V0ID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRbaiAqIDQgKyBpXSA9XHJcbiAgICAgICAgICAgICAgICBhWzAgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMF0gK1xyXG4gICAgICAgICAgICAgICAgYVsxICogNCArIGldICogYltqICogNCArIDFdICtcclxuICAgICAgICAgICAgICAgIGFbMiAqIDQgKyBpXSAqIGJbaiAqIDQgKyAyXSArXHJcbiAgICAgICAgICAgICAgICBhWzMgKiA0ICsgaV0gKiBiW2ogKiA0ICsgM107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubS5zZXQob3V0KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFBlcnNwZWN0aXZlIG1hdHJpY2UsIHRoZSBmYWN0b3IgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSB0YW4gb2YgdGhlIEZPViBkaXZpZGVkIGJ5IDI6XHJcbiAgICAgKiBXZSBoYXZlIHRoZSBuZWFyIHBsYW5lIGFuZCBmYXIgcGxhbmUuIChvYmplY3RzIGFyZSBkcmF3biBpbi1iZXR3ZWVuKVxyXG4gICAgICogYXNwZWN0IGlzIHRoZSBhc3BlY3QtcmF0aW8gbGlrZSAxNjo5IG9uIG1vc3Qgc2NyZWVucy5cclxuICAgICAqIFdlIGNoYW5nZSBlYWNoIHZlcnRpY2VzIHgsIHkgYW5kIHogYnkgdGhlIGZvbGxvd2luZzpcclxuICAgICAqIDAsIDAsICAwLCAgMFxyXG4gICAgICogMCwgNSwgIDAsICAwXHJcbiAgICAgKiAwLCAwLCAxMCwgMTFcclxuICAgICAqIDAsIDAsIDE0LCAxNVxyXG4gICAgICovXHJcbiAgICBzZXRQZXJzcGVjdGl2ZShmb3ZSYWQ6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBmID0gMS4wIC8gTWF0aC50YW4oZm92UmFkIC8gMik7XHJcbiAgICAgICAgY29uc3QgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcblxyXG4gICAgICAgIG1bMF0gPSBmIC8gYXNwZWN0O1xyXG4gICAgICAgIG1bMV0gPSAwO1xyXG4gICAgICAgIG1bMl0gPSAwO1xyXG4gICAgICAgIG1bM10gPSAwO1xyXG5cclxuICAgICAgICBtWzRdID0gMDtcclxuICAgICAgICBtWzVdID0gZjtcclxuICAgICAgICBtWzZdID0gMDtcclxuICAgICAgICBtWzddID0gMDtcclxuXHJcbiAgICAgICAgbVs4XSA9IDA7XHJcbiAgICAgICAgbVs5XSA9IDA7XHJcbiAgICAgICAgbVsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcclxuICAgICAgICBtWzExXSA9IC0xO1xyXG5cclxuICAgICAgICBtWzEyXSA9IDA7XHJcbiAgICAgICAgbVsxM10gPSAwO1xyXG4gICAgICAgIG1bMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZjtcclxuICAgICAgICBtWzE1XSA9IDA7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExvb2tBdChleWU6IHZlYzMsIGNlbnRlcjogdmVjMywgdXA6IHZlYzMpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCB6ID0gZXllLnN1YnRyYWN0KGNlbnRlcikubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgeCA9IHVwLmNyb3NzKHopLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IHkgPSB6LmNyb3NzKHgpO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcblxyXG4gICAgICAgIG1bMF0gPSB4Lng7XHJcbiAgICAgICAgbVsxXSA9IHkueDtcclxuICAgICAgICBtWzJdID0gei54O1xyXG4gICAgICAgIG1bM10gPSAwO1xyXG5cclxuICAgICAgICBtWzRdID0geC55O1xyXG4gICAgICAgIG1bNV0gPSB5Lnk7XHJcbiAgICAgICAgbVs2XSA9IHoueTtcclxuICAgICAgICBtWzddID0gMDtcclxuXHJcbiAgICAgICAgbVs4XSA9IHguejtcclxuICAgICAgICBtWzldID0geS56O1xyXG4gICAgICAgIG1bMTBdID0gei56O1xyXG4gICAgICAgIG1bMTFdID0gMDtcclxuXHJcbiAgICAgICAgbVsxMl0gPSAteC5kb3QoZXllKTtcclxuICAgICAgICBtWzEzXSA9IC15LmRvdChleWUpO1xyXG4gICAgICAgIG1bMTRdID0gLXouZG90KGV5ZSk7XHJcbiAgICAgICAgbVsxNV0gPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHE6IHF1YXQsIHY6IHZlYzMsIHM6IHZlYzMpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCB4ID0gcS54LCB5ID0gcS55LCB6ID0gcS56LCB3ID0gcS53O1xyXG4gICAgICAgIGNvbnN0IHN4ID0gcy54LCBzeSA9IHMueSwgc3ogPSBzLno7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geCArIHgsIHkyID0geSArIHksIHoyID0geiArIHo7XHJcbiAgICAgICAgY29uc3QgeHggPSB4ICogeDIsIHh5ID0geCAqIHkyLCB4eiA9IHggKiB6MjtcclxuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MiwgeXogPSB5ICogejIsIHp6ID0geiAqIHoyO1xyXG4gICAgICAgIGNvbnN0IHd4ID0gdyAqIHgyLCB3eSA9IHcgKiB5Miwgd3ogPSB3ICogejI7XHJcblxyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XHJcblxyXG4gICAgICAgIG1bMF0gPSAoMSAtICh5eSArIHp6KSkgKiBzeDtcclxuICAgICAgICBtWzFdID0gKHh5ICsgd3opICogc3g7XHJcbiAgICAgICAgbVsyXSA9ICh4eiAtIHd5KSAqIHN4O1xyXG4gICAgICAgIG1bM10gPSAwO1xyXG5cclxuICAgICAgICBtWzRdID0gKHh5IC0gd3opICogc3k7XHJcbiAgICAgICAgbVs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xyXG4gICAgICAgIG1bNl0gPSAoeXogKyB3eCkgKiBzeTtcclxuICAgICAgICBtWzddID0gMDtcclxuXHJcbiAgICAgICAgbVs4XSA9ICh4eiArIHd5KSAqIHN6O1xyXG4gICAgICAgIG1bOV0gPSAoeXogLSB3eCkgKiBzejtcclxuICAgICAgICBtWzEwXSA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xyXG4gICAgICAgIG1bMTFdID0gMDtcclxuXHJcbiAgICAgICAgbVsxMl0gPSB2Lng7XHJcbiAgICAgICAgbVsxM10gPSB2Lnk7XHJcbiAgICAgICAgbVsxNF0gPSB2Lno7XHJcbiAgICAgICAgbVsxNV0gPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSIsIi8vXHJcbi8vIEZVTkNUSU9OXHJcbi8vXHJcblxyXG4vLyBEaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UgdG8gdGhlIEhUTUwgRWxlbWVudCB3aXRoIGlkIFwiZXJyb3ItY29udGFpbmVyXCIuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3IobXNnOiBzdHJpbmcgPSBcIk5vIERhdGFcIik6IHZvaWQge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlcnJvci1jb250YWluZXJcIik7XHJcbiAgICBpZihjb250YWluZXIgPT09IG51bGwpIHJldHVybiBjb25zb2xlLmxvZyhcIk5vIEVsZW1lbnQgd2l0aCBJRDogZXJyb3ItY29udGFpbmVyXCIpO1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gbXNnO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgY29uc29sZS5sb2cobXNnKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHNldERpc3BsYXllZExvYWRpbmdUaW1lKG1zZzogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRpbmctdGltZVwiKTtcclxuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gRWxlbWVudCB3aXRoIElEOiBsb2FkaW5nLXRpbWVcIilcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICBlbGVtZW50LmlubmVyVGV4dCA9IG1zZztcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbn1cclxuXHJcbi8vIEdldCBzaGFkZXJzIHNvdXJjZSBjb2RlLlxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2hhZGVyU291cmNlKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGxvYWRpbmcgc2hhZGVyIGNvZGUgYXQgXCIke3VybH1cIjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEltYWdlKHVybDogc3RyaW5nKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIGltYWdlLnNyYyA9IHVybDtcclxuICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltYWdlKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vIFJldHVybiB0aGUgV2ViR0wgQ29udGV4dCBmcm9tIHRoZSBDYW52YXMgRWxlbWVudC5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHQoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xyXG4gICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IDtcclxufVxyXG5cclxuLy8gQ29udmVydCBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFudC5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGFuZ2xlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGFuZ2xlICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIFdlYkdMIEJ1ZmZlciB0eXBlLiAoT3BhcXVlIEhhbmRsZSlcclxuICogLSBTVEFUSUNfRFJBVyA6IHdvbnQgdXBkYXRlIG9mdGVuLCBidXQgb2Z0ZW4gdXNlZC5cclxuICogLSBBUlJBWV9CVUZGRVIgOiBpbmRpY2F0ZSB0aGUgcGxhY2UgdG8gc3RvcmUgdGhlIEFycmF5LlxyXG4gKiAtIEVMRU1FTlRfQVJSQVlfQlVGRkVSIDogVXNlZCBmb3IgaW5kaWNlcyB3aXRoIGN1YmUgc2hhcGVzIGRyYXdpbmcuXHJcbiAqIEJpbmQgdGhlIEJ1ZmZlciB0byB0aGUgQ1BVLCBhZGQgdGhlIEFycmF5IHRvIHRoZSBCdWZmZXIgYW5kIENsZWFyIGFmdGVyIHVzZS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGF0aWNCdWZmZXIoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGRhdGE6IEFycmF5QnVmZmVyLCBpc0luZGljZTogYm9vbGVhbik6IFdlYkdMQnVmZmVyIHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgY29uc3QgdHlwZSA9IChpc0luZGljZSA9PSB0cnVlKSA/IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSIDogZ2wuQVJSQVlfQlVGRkVSXHJcbiAgICBpZighYnVmZmVyKSB7IFxyXG4gICAgICAgIHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBidWZmZXIgc3BhY2VcIik7IFxyXG4gICAgICAgIHJldHVybiAwOyBcclxuICAgIH1cclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIGJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgbnVsbCk7XHJcbiAgICByZXR1cm4gYnVmZmVyXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgdmVydGV4IGFycmF5IG9iamVjdCBidWZmZXJzLCBpdCByZWFkIHRoZSB2ZXJ0aWNlcyBmcm9tIEdQVSBCdWZmZXIuXHJcbiAqIFRoZSB2ZXJ0ZXggYnVmZmVyIGNvbnRhaW5zIHRoZSB2ZXJ0aWNlcyBjb29yZGluYXRlcyAoY2FuIGFsc28gY29udGFpbnMgY29sb3IgYW5kIHNpemUpLlxyXG4gKiBUaGUgaW5kZXggYnVmZmVyIGNvbnRhaW5zIHdpY2ggdmVydGV4IG5lZWQgdG8gYmUgZHJhd24gb24gc2NlbmUgdG8gYXZvaWQgZHVwbGljYXRlcyB2ZXJ0aWNlcy5cclxuICogSW4gY2FzZSBvZiBjb2xvcnMsIGFuIG9mZnNldCBvZiAzIGZsb2F0cyBpcyB1c2VkIGVhY2ggdGltZSB0byBhdm9pZCAoeCwgeSwgeikgY29vcmRpbmF0ZXMuXHJcbiAqIFRoZSB2ZXJ0ZXggc2hhZGVyIHBsYWNlIHRoZSB2ZXJ0aWNlcyBpbiBjbGlwIHNwYWNlIGFuZCB0aGUgZnJhZ21lbnQgc2hhZGVyIGNvbG9yIHRoZSBwaXhlbHMuIChEZWZhdWx0OiAwKVxyXG4gKiBWZXJ0ZXhBdHRyaWJQb2ludGVyIFtJbmRleCwgU2l6ZSwgVHlwZSwgSXNOb3JtYWxpemVkLCBTdHJpZGUsIE9mZnNldF1cclxuICogLSBJbmRleCAobG9jYXRpb24pXHJcbiAqIC0gU2l6ZSAoQ29tcG9uZW50IHBlciB2ZWN0b3IpXHJcbiAqIC0gVHlwZVxyXG4gKiAtIElzTm9ybWFsaXplZCAoaW50IHRvIGZsb2F0cywgZm9yIGNvbG9ycyB0cmFuc2Zvcm0gWzAsIDI1NV0gdG8gZmxvYXQgWzAsIDFdKVxyXG4gKiAtIFN0cmlkZSAoRGlzdGFuY2UgYmV0d2VlbiBlYWNoIHZlcnRleCBpbiB0aGUgYnVmZmVyKVxyXG4gKiAtIE9mZnNldCAoTnVtYmVyIG9mIHNraXBlZCBieXRlcyBiZWZvcmUgcmVhZGluZyBhdHRyaWJ1dGVzKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZBT0J1ZmZlcihcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgaW5kZXhCdWZmZXI6IFdlYkdMQnVmZmVyLCB0ZXhCdWZmZXI6IFdlYkdMQnVmZmVyLFxyXG4gICAgcG9zQXR0cmliOiBudW1iZXIsIHRleEF0dHJpYjogbnVtYmVyXHJcbik6IFdlYkdMVmVydGV4QXJyYXlPYmplY3Qge1xyXG4gICAgY29uc3QgdmFvID0gZ2wuY3JlYXRlVmVydGV4QXJyYXkoKTtcclxuICAgIGlmKCF2YW8pIHsgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGFsbG9jYXRlIFZBTyBidWZmZXIuXCIpOyByZXR1cm4gMDsgfVxyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KHZhbyk7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheShwb3NBdHRyaWIpO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkodGV4QXR0cmliKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NBdHRyaWIsIDMsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7IC8vIGZvcm1hdDogKHgsIHksIHopIChhbGwgZjMyKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRleEF0dHJpYiwgMiwgZ2wuRkxPQVQsIGZhbHNlLCAwLCAwKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGluZGV4QnVmZmVyKTtcclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgcmV0dXJuIHZhbztcclxufVxyXG5cclxuLy8gQ3JlYXRlIGEgcHJvZ3JhbSBhbmQgbGluayB0aGUgdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlIGNvZGUgdG8gaXQuXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQcm9ncmFtKFxyXG4gICAgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsXHJcbiAgICB2ZXJ0ZXhTaGFkZXJTcmM6IHN0cmluZyxcclxuICAgIGZyYWdtZW50U2hhZGVyU3JjOiBzdHJpbmdcclxuKTogV2ViR0xQcm9ncmFtIHtcclxuICAgIGNvbnN0IHZlcnRleFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5WRVJURVhfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcclxuICAgIGNvbnN0IGZyYWdtZW50U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLkZSQUdNRU5UX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XHJcbiAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xyXG5cclxuICAgIGdsLnNoYWRlclNvdXJjZSh2ZXJ0ZXhTaGFkZXIsIHZlcnRleFNoYWRlclNyYyk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRleFNoYWRlcik7XHJcbiAgICBpZighZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHZlcnRleFNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKHZlcnRleFNoYWRlcik7XHJcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gc2hhZGVyIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2wuc2hhZGVyU291cmNlKGZyYWdtZW50U2hhZGVyLCBmcmFnbWVudFNoYWRlclNyYyk7XHJcbiAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdtZW50U2hhZGVyKTtcclxuICAgIGlmKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoZnJhZ21lbnRTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyhmcmFnbWVudFNoYWRlcik7XHJcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gc2hhZGVyIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUHJvZ3JhbSBzZXQgdXAgZm9yIFVuaWZvcm1zLlxyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleFNoYWRlcik7XHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICBpZighZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFByb2dyYW1JbmZvTG9nKHByb2dyYW0pO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHByb2dyYW0gZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIHJldHVybiBwcm9ncmFtO1xyXG59IiwiLy8gVmVydGV4IGJ1ZmZlciBmb3JtYXQ6IFhZWlxyXG5cclxuLy9cclxuLy8gQ3ViZSBnZW9tZXRyeVxyXG4vLyB0YWtlbiBmcm9tOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvV2ViR0xfQVBJL1R1dG9yaWFsL0NyZWF0aW5nXzNEX29iamVjdHNfdXNpbmdfV2ViR0xcclxuZXhwb3J0IGNvbnN0IENVQkVfVkVSVElDRVMgPSBuZXcgRmxvYXQzMkFycmF5KFtcclxuICAvLyBGcm9udCBmYWNlXHJcbiAgLTEuMCwgLTEuMCwgMS4wLCAgLy8gMCBBXHJcbiAgMS4wLCAtMS4wLCAxLjAsICAgLy8gMSBCXHJcbiAgMS4wLCAxLjAsIDEuMCwgICAgLy8gMiBDXHJcbiAgLTEuMCwgMS4wLCAxLjAsICAgLy8gMyBEXHJcblxyXG4gIC8vIEJhY2sgZmFjZVxyXG4gIC0xLjAsIC0xLjAsIC0xLjAsIC8vIDRcclxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyA1XHJcbiAgMS4wLCAxLjAsIC0xLjAsICAgLy8gNlxyXG4gIDEuMCwgLTEuMCwgLTEuMCwgIC8vIDdcclxuXHJcbiAgLy8gVG9wIGZhY2VcclxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyA4XHJcbiAgLTEuMCwgMS4wLCAxLjAsICAgLy8gOVxyXG4gIDEuMCwgMS4wLCAxLjAsICAgIC8vIDEwXHJcbiAgMS4wLCAxLjAsIC0xLjAsICAgLy8gMTFcclxuXHJcbiAgLy8gQm90dG9tIGZhY2VcclxuICAtMS4wLCAtMS4wLCAtMS4wLCAvLyAxMlxyXG4gIDEuMCwgLTEuMCwgLTEuMCwgIC8vIDEzXHJcbiAgMS4wLCAtMS4wLCAxLjAsICAgLy8gMTRcclxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAxNVxyXG5cclxuICAvLyBSaWdodCBmYWNlXHJcbiAgMS4wLCAtMS4wLCAtMS4wLCAgLy8gMTZcclxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAxN1xyXG4gIDEuMCwgMS4wLCAxLjAsICAgIC8vIDE4XHJcbiAgMS4wLCAtMS4wLCAxLjAsICAgLy8gMTlcclxuXHJcbiAgLy8gTGVmdCBmYWNlXHJcbiAgLTEuMCwgLTEuMCwgLTEuMCwgLy8gMjBcclxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAyMVxyXG4gIC0xLjAsIDEuMCwgMS4wLCAgIC8vIDIyXHJcbiAgLTEuMCwgMS4wLCAtMS4wLCAgLy8gMjNcclxuXSk7XHJcblxyXG5leHBvcnQgY29uc3QgQ1VCRV9JTkRJQ0VTID0gbmV3IFVpbnQxNkFycmF5KFtcclxuICAwLCAxLCAyLFxyXG4gIDAsIDIsIDMsIC8vIGZyb250XHJcbiAgNCwgNSwgNixcclxuICA0LCA2LCA3LCAvLyBiYWNrXHJcbiAgOCwgOSwgMTAsXHJcbiAgOCwgMTAsIDExLCAvLyB0b3BcclxuICAxMiwgMTMsIDE0LFxyXG4gIDEyLCAxNCwgMTUsIC8vIGJvdHRvbVxyXG4gIDE2LCAxNywgMTgsXHJcbiAgMTYsIDE4LCAxOSwgLy8gcmlnaHRcclxuICAyMCwgMjEsIDIyLFxyXG4gIDIwLCAyMiwgMjMsIC8vIGxlZnRcclxuXSk7XHJcblxyXG4vLyBGb3IgbXkgdGlsZW1hcDogXHJcbi8vIDEsMCwgICAxLDAsICAgIDEsMSwgICAgMCwxLCBbPSBDYXRfT01HXVxyXG5leHBvcnQgY29uc3QgVVZfQ09PUkRTID0gbmV3IEZsb2F0MzJBcnJheShbXHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsIC8vIGZyb250XHJcbiAgMCwwLCAgIDEsMCwgICAgMSwxLCAgICAwLDEsIC8vIGJhY2tcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyB0b3BcclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyBib3R0b21cclxuICAwLDAsICAgMSwwLCAgICAxLDEsICAgIDAsMSwgICAvLyByaWdodFxyXG4gIDAsMCwgICAxLDAsICAgIDEsMSwgICAgMCwxLCAgIC8vIGxlZnRcclxuXSkiLCJpbXBvcnQgKiBhcyBmbmMgZnJvbSBcIi4vZnVuY3Rpb25cIjtcclxuaW1wb3J0ICogYXMgY2xzIGZyb20gXCIuL2NsYXNzXCI7XHJcbmltcG9ydCAqIGFzIGdlbyBmcm9tIFwiLi9nZW9tZXRyeVwiO1xyXG5cclxuLy9cclxuLy8gTUFJTlxyXG4vL1xyXG5cclxuY29uc3QgVVBfVkVDID0gbmV3IGNscy52ZWMzKDAsIDEsIDApO1xyXG5jb25zdCBTVEFSVCA9IERhdGUubm93KCk7XHJcbmNvbnN0IFRFWFRVUkVTID0gW1xyXG4gICAgJy4vaW1nL2NhdF9vbWcucG5nJyxcclxuICAgICcuL2ltZy9jYXRfc3RhcmUucG5nJ1xyXG5dXHJcbmNvbnN0IFNFVFRJTkdTID0ge1xyXG4gICAgRk9WIDogNjAuMCwgLy8gRGVmYXVsdDogNjAuMFxyXG4gICAgUk9UQVRJT05fQU5HTEUgOiAxMC4wLCAvLyBEZWZhdWx0OiAxMC4wXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgLy8gQ2FudmFzIEVsZW1lbnQgYW5kIFJlbmRlcmluZyBDb250ZXh0LlxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbC1jYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjb25zdCBnbCA9IGZuYy5nZXRDb250ZXh0KGNhbnZhcyk7XHJcblxyXG4gICAgLy8gQ3ViZSB2ZXJ0aWNlcy9pbmRpY2VzIGJ1ZmZlcnMuXHJcbiAgICBjb25zdCBjdWJlVmVydGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9WRVJUSUNFUywgZmFsc2UpO1xyXG4gICAgY29uc3QgY3ViZUluZGljZXMgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uQ1VCRV9JTkRJQ0VTLCB0cnVlKTtcclxuXHJcbiAgICBpZiAoIWN1YmVWZXJ0aWNlcyB8fCAhY3ViZUluZGljZXMpIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gY3JlYXRlIGdlbzogY3ViZTogKHY9JHshIWN1YmVWZXJ0aWNlc30gaT0ke2N1YmVJbmRpY2VzfSlgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRmV0Y2ggc2hhZGVycyBjb2RlIGFuZCBsaW5rIHRoZW0gdG8gYSBwcm9ncmFtLlxyXG4gICAgY29uc3QgdmVydGV4U3JjID0gYXdhaXQgZm5jLmdldFNoYWRlclNvdXJjZSgnLi9zaGFkZXJzL3ZlcnRleF9zaGFkZXIudmVydCcpO1xyXG4gICAgY29uc3QgZnJhZ21lbnRTcmMgPSBhd2FpdCBmbmMuZ2V0U2hhZGVyU291cmNlKCcuL3NoYWRlcnMvZnJhZ21lbnRfc2hhZGVyLmZyYWcnKTtcclxuICAgIGNvbnN0IHByb2dyYW0gPSBmbmMuY3JlYXRlUHJvZ3JhbShnbCwgdmVydGV4U3JjLCBmcmFnbWVudFNyYyk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgdGV4dHVyZSBhbmQgYmluZCBvdXIgaW1hZ2UuXHJcbiAgICBjb25zdCB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgdGV4dHVyZSk7XHJcblxyXG4gICAgLy8gVGFyZ2V0LCBNaXBtYXBfTGV2ZWwsIEludGVybmFsX0Zvcm1hdCwgV2lkdGgsIEhlaWdodCwgSW1hZ2VzX0NvdW50XHJcbiAgICBnbC50ZXhTdG9yYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMSwgZ2wuUkdCQTgsIDEyOCwgMTI4LCBURVhUVVJFUy5sZW5ndGgpO1xyXG5cclxuICAgIC8vIEZsaXAgdGhlIG9yaWdpbiBwb2ludCBvZiBXZWJHTC4gKFBORyBmb3JtYXQgc3RhcnQgYXQgdGhlIHRvcCBhbmQgV2ViR0wgYXQgdGhlIGJvdHRvbSlcclxuICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xyXG5cclxuICAgIC8vIEZvciBlYWNoIHRleHR1cmVzL2ltYWdlcyB3ZSBsb2FkIHRoZW0sIGFuZCBzZXQgdGhlaXIgZGVwdGgvaW5kZXguXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IFRFWFRVUkVTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgaW1hZ2UgPSBhd2FpdCBmbmMuZ2V0SW1hZ2UoVEVYVFVSRVNbaV0pO1xyXG4gICAgICAgIC8vIFRhcmdldCwgTWlwbWFwX0xldmVsLCB4T2Zmc2V0LCB5T2Zmc2V0LCB6T2Zmc2V0IChEZXB0aCksIFdpZHRoLCBIZWlnaHQsIEludGVybmFsX0Zvcm1hdCwgSW1hZ2VcclxuICAgICAgICBnbC50ZXhTdWJJbWFnZTNEKGdsLlRFWFRVUkVfMkRfQVJSQVksIDAsIDAsIDAsIGksIDEyOCwgMTI4LCAxLCBnbC5SR0JBLCBnbC5VTlNJR05FRF9CWVRFLCBpbWFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2hhbmdlIHRoZSBtaW5pbXVtIGFuZCBtYWduaXR1ZGUgZmlsdGVycyB3aGVuIHNjYWxpbmcgdXAgYW5kIGRvd24gdGV4dHVyZXMuXHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcblxyXG4gICAgLy8gU3RhdGljIGJ1ZmZlciBmb3IgVVYgY29vcmRpbmF0ZXMuIE1pZ2h0IGJlIGNvbnN0YW50IHdpdGggdGV4dHVyZSBhcnJheXMuXHJcbiAgICBjb25zdCB0ZXhDb29yZHNCdWZmZXIgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBnZW8uVVZfQ09PUkRTLCBmYWxzZSk7XHJcblxyXG4gICAgLypcclxuICAgICogR2V0dGluZyB0aGUgYXR0cmlidXRlcyBmcm9tIHRoZSB2ZXJ0ZXggc2hhZGVyIGZpbGUuXHJcbiAgICAqIEF0dHJpYnV0ZXMgbG9jYXRpb25zIGNhbiBiZSBmb3JjZWQgaW4gdGhlIHZlcnRleCBzaGFkZXIgZmlsZSB3aXRoIChsb2NhdGlvbj1udW1iZXIpLlxyXG4gICAgKiBJZiBub3QgZm9yY2VkLCBXZWJHTCBnaXZlcyB0aGVtIGEgbnVtYmVyLCB5b3UgY2FuIGdldCB0aGlzIG51bWJlciB3aXRoIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkuXHJcbiAgICAqIEhlcmUsIGJlY2F1c2Ugd2Ugc2V0IG1hbnVhbGx5IHRoZSBhdHRyaWJ1dGUgbG9jYXRpb24gaW4gdGhlIHZlcnRleCBzaGFkZXIsXHJcbiAgICAqIHdlIGNhbiByZXBsYWNlIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkgd2l0aCB0aGUgKGxvY2F0aW9uPW51bWJlcikgbnVtYmVyLlxyXG4gICAgKi9cclxuICAgIGNvbnN0IHBvc2l0aW9uQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleFBvc2l0aW9uJyk7IC8vIGxvY2F0aW9uID0gMFxyXG4gICAgY29uc3QgdGV4QXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ2FUZXhDb29yZCcpOyAvLyBsb2NhdGlvbiA9IDFcclxuICAgIGNvbnN0IGRlcHRoQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ2FEZXB0aCcpOyAvLyBsb2NhdGlvbiA9IDJcclxuXHJcbiAgICAvLyBXZSBjYW4gbm90IHNwZWNpZnkgVW5pZm9ybXMgbG9jYXRpb25zIG1hbnVhbGx5LiBXZSBuZWVkIHRvIGdldCB0aGVtIHVzaW5nICdnZXRVbmlmb3JtTG9jYXRpb24nLlxyXG4gICAgY29uc3QgbWF0V29ybGRVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRXb3JsZCcpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG4gICAgY29uc3QgbWF0Vmlld1Byb2pVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRWaWV3UHJvaicpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG4gICAgY29uc3Qgc2FtcGxlclVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ3VTYW1wbGVyJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcblxyXG4gICAgLy8gVHlwZXNjcmlwdCB3YW50IHRvIHZlcmlmeSBpZiB0aGUgdmFyaWFibGVzIGFyZSBzZXQsIG5vdCB0aGUgYmVzdCB3YXkgdG8gZG8gaXQuXHJcbiAgICBpZihwb3NpdGlvbkF0dHJpYnV0ZSA8IDAgfHwgdGV4QXR0cmlidXRlIDwgMCB8fCBkZXB0aEF0dHJpYnV0ZSA8IDAgfHwgIW1hdFdvcmxkVW5pZm9ybSB8fCAhbWF0Vmlld1Byb2pVbmlmb3JtIHx8ICFzYW1wbGVyVW5pZm9ybSkge1xyXG4gICAgICAgIGZuYy5zaG93RXJyb3IoYEZhaWxlZCB0byBnZXQgYXR0cmlicy91bmlmb3JtcyAoTWF4OiAke2dsLmdldFBhcmFtZXRlcihnbC5NQVhfVkVSVEVYX0FUVFJJQlMpfSk6IGAgK1xyXG4gICAgICAgICAgICBgcG9zPSR7cG9zaXRpb25BdHRyaWJ1dGV9YCArXHJcbiAgICAgICAgICAgIGB0ZXg9JHt0ZXhBdHRyaWJ1dGV9YCArXHJcbiAgICAgICAgICAgIGBkZXB0aD0ke2RlcHRoQXR0cmlidXRlfWAgK1xyXG4gICAgICAgICAgICBgbWF0V29ybGQ9JHshIW1hdFdvcmxkVW5pZm9ybX1gICtcclxuICAgICAgICAgICAgYG1hdFZpZXdQcm9qPSR7ISFtYXRWaWV3UHJvalVuaWZvcm19YCArXHJcbiAgICAgICAgICAgIGBzYW1wbGVyPSR7ISFzYW1wbGVyVW5pZm9ybX1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29udHJvbCB0aGUgZGVwdGggb2YgdGhlIHRleHR1cmUgYXJyYXkuIFBpY2tpbmcgb3VyIGRpc3BsYXllZCB0ZXh0dXJlLlxyXG4gICAgZ2wudmVydGV4QXR0cmliMWYoZGVwdGhBdHRyaWJ1dGUsIDApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBvdXIgdmVydGV4IGFycmF5IG9iamVjdCAoVkFPcykgYnVmZmVycy5cclxuICAgIGNvbnN0IGN1YmVWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKGdsLCBjdWJlVmVydGljZXMsIGN1YmVJbmRpY2VzLCB0ZXhDb29yZHNCdWZmZXIsIHBvc2l0aW9uQXR0cmlidXRlLCB0ZXhBdHRyaWJ1dGUpO1xyXG4gICAgaWYoIWN1YmVWQU8pIHJldHVybiBmbmMuc2hvd0Vycm9yKGBGYWlsZXMgdG8gY3JlYXRlIFZBT3M6IGN1YmU9JHshIWN1YmVWQU99YCk7XHJcblxyXG4gICAgLy8gU3RvcmUgb3VyIGN1YmVzLCBkcmF3IHRoZW0gZWFjaCB0aW1lLiAoYSBsb3Qgb2YgZHJhdyBjYWxscylcclxuICAgIGNvbnN0IGN1YmVzID0gW1xyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDAsIDAuNCwgMCksIDAuNCwgVVBfVkVDLCAwLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksIC8vIENlbnRlclxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDEsIDAuMDUsIDEpLCAwLjMsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDIwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDEsIDAuMSwgLTEpLCAwLjEsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDQwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKC0xLCAwLjE1LCAxKSwgMC4xNSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXHJcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoLTEsIDAuMiwgLTEpLCAwLjIsIFVQX1ZFQywgZm5jLnRvUmFkaWFuKDgwKSwgY3ViZVZBTywgZ2VvLkNVQkVfSU5ESUNFUy5sZW5ndGgpLFxyXG4gICAgXTtcclxuXHJcbiAgICBsZXQgbWF0VmlldyA9IG5ldyBjbHMubWF0NCgpO1xyXG4gICAgbGV0IG1hdFByb2ogPSBuZXcgY2xzLm1hdDQoKTtcclxuICAgIGxldCBtYXRWaWV3UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xyXG5cclxuICAgIGxldCBjYW1lcmFBbmdsZSA9IDA7XHJcbiAgICAvKipcclxuICAgICAqIEFkZCBhIGZ1bmN0aW9uIHRvIGNhbGwgaXQgZWFjaCBmcmFtZS5cclxuICAgICAqIC0gT3V0cHV0IE1lcmdlcjogTWVyZ2UgdGhlIHNoYWRlZCBwaXhlbCBmcmFnbWVudCB3aXRoIHRoZSBleGlzdGluZyByZXN1bHQgaW1hZ2UuXHJcbiAgICAgKiAtIFJhc3Rlcml6ZXI6IFdpY2ggcGl4ZWwgYXJlIHBhcnQgb2YgdGhlIFZlcnRpY2VzICsgV2ljaCBwYXJ0IGlzIG1vZGlmaWVkIGJ5IFdlYkdMLlxyXG4gICAgICogLSBHUFUgUHJvZ3JhbTogUGFpciBWZXJ0ZXggJiBGcmFnbWVudCBzaGFkZXJzLlxyXG4gICAgICogLSBTZXQgVW5pZm9ybXMgKGNhbiBiZSBzZXQgYW55d2hlcmUpXHJcbiAgICAgKiAtIERyYXcgQ2FsbHMgKHcvIFByaW1pdGl2ZSBhc3NlbWJseSArIGZvciBsb29wKVxyXG4gICAgICovXHJcbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgY29uc3QgZnJhbWUgPSBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGR0IChkZWx0YSB0aW1lKSB3aXRoIHRpbWUgaW4gc2Vjb25kcyBiZXR3ZWVuIGVhY2ggZnJhbWUuXHJcbiAgICAgICAgY29uc3QgdGhpc0ZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgICAgIGNvbnN0IGR0ID0gKHRoaXNGcmFtZVRpbWUgLSBsYXN0RnJhbWVUaW1lKSAvIDEwMDA7XHJcbiAgICAgICAgbGFzdEZyYW1lVGltZSA9IHRoaXNGcmFtZVRpbWU7XHJcblxyXG4gICAgICAgIC8vIEVhY2ggZnJhbWUgYWRkIDEwwrAgdG8gdGhlIGNhbWVyYSBhbmdsZS5cclxuICAgICAgICBjYW1lcmFBbmdsZSArPSBkdCAqIGZuYy50b1JhZGlhbigxMCk7XHJcblxyXG4gICAgICAgIC8vIEZpeGVkIGNhbWVyYSBjb29yZGluYXRlcy5cclxuICAgICAgICBjb25zdCBjYW1lcmFYID0gMyAqIE1hdGguc2luKGNhbWVyYUFuZ2xlKTtcclxuICAgICAgICBjb25zdCBjYW1lcmFaID0gMyAqIE1hdGguY29zKGNhbWVyYUFuZ2xlKTtcclxuXHJcbiAgICAgICAgLy8gTWFrZSB0aGUgJ2NhbWVyYScgbG9vayBhdCB0aGUgY2VudGVyLlxyXG4gICAgICAgIG1hdFZpZXcuc2V0TG9va0F0KFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoY2FtZXJhWCwgMSwgY2FtZXJhWiksXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAwLCAwKSxcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDEsIDApXHJcbiAgICAgICAgKTtcclxuICAgICAgICAvLyBTZXQgdGhlIGNhbWVyYSBGT1YsIHNjcmVlbiBzaXplIGFuZCB2aWV3IGRpc3RhbmNlLlxyXG4gICAgICAgIG1hdFByb2ouc2V0UGVyc3BlY3RpdmUoXHJcbiAgICAgICAgICAgIGZuYy50b1JhZGlhbihTRVRUSU5HUy5GT1YpLCAvLyBGT1ZcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCwgLy8gQVNQRUNUIFJBVElPXHJcbiAgICAgICAgICAgIDAuMSwgMTAwLjAgLy8gWi1ORUFSIC8gWi1GQVJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICAvLyBHTE06IG1hdFZpZXdQcm9qID0gbWF0UHJvaiAqIG1hdFZpZXdcclxuICAgICAgICBtYXRWaWV3UHJvaiA9IG1hdFByb2oubXVsdGlwbHkobWF0Vmlldyk7XHJcblxyXG4gICAgICAgIC8vIFJlbmRlclxyXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCAqIGRldmljZVBpeGVsUmF0aW87XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG5cclxuICAgICAgICBnbC5jbGVhckNvbG9yKDAuMDIsIDAuMDIsIDAuMDIsIDEpO1xyXG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcclxuICAgICAgICBnbC5lbmFibGUoZ2wuREVQVEhfVEVTVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XHJcbiAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XHJcbiAgICAgICAgZ2wuZnJvbnRGYWNlKGdsLkNDVyk7XHJcbiAgICAgICAgZ2wudmlld3BvcnQoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFZpZXdQcm9qVW5pZm9ybSwgZmFsc2UsIG1hdFZpZXdQcm9qLm0pO1xyXG5cclxuICAgICAgICBjdWJlcy5mb3JFYWNoKChjdWJlLCBpbmRleCkgPT4ge1xyXG4gICAgICAgICAgICAvLyBUaGUgY2VudGVyIGN1YmUgZG8gbm90IHJvdGF0ZSBvbiBpdHNlbGYuXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA9PSAwKSB7IGN1YmUuZHJhdyhnbCwgbWF0V29ybGRVbmlmb3JtKTsgcmV0dXJuIH0gXHJcbiAgICAgICAgICAgIGN1YmUucm90YXRlKGR0ICogZm5jLnRvUmFkaWFuKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4MCkpKTtcclxuICAgICAgICAgICAgY3ViZS5kcmF3KGdsLCBtYXRXb3JsZFVuaWZvcm0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIExvb3AgY2FsbHMsIGVhY2ggdGltZSB0aGUgZHJhd2luZyBpcyByZWFkeS5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gICAgfTtcclxuICAgIC8vIEZpcnN0IGNhbGwsIGFzIHNvb24sIGFzIHRoZSBwYWdlIGlzIGxvYWRlZC5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XHJcbiAgICBmbmMuc2V0RGlzcGxheWVkTG9hZGluZ1RpbWUoYCR7IERhdGUubm93KCkgLSBTVEFSVCB9bXNgKTtcclxufVxyXG5cclxuZm5jLnNob3dFcnJvcihcIk5vIEVycm9ycyEg8J+MnlwiKTtcclxuXHJcbnRyeSB7IG1haW4oKTsgfSBjYXRjaChlKSB7IGZuYy5zaG93RXJyb3IoYFVuY2F1Z2h0IGV4Y2VwdGlvbjogJHtlfWApOyB9IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL21haW4udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=