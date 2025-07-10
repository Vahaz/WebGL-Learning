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
exports.getShaderSource = getShaderSource;
exports.loadImage = loadImage;
exports.getContext = getContext;
exports.toRadian = toRadian;
exports.createStaticBuffer = createStaticBuffer;
exports.createVAOBuffer = createVAOBuffer;
exports.createProgram = createProgram;
// Display an error message to the HTML Element with id "error-container".
function showError(msg) {
    const container = document.getElementById("error-container");
    if (container === null)
        return console.log("No Element with ID: error-container");
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
function loadImage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const image = new Image();
        image.src = url;
        return image;
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
 * The vertex buffer contains the coordinates and color per vertex. (x, y, z, r, g, b)
 * The index buffer contains wich vertex need to be drawn on scene to avoid surplus.
 * The color attrib pointer is offset by 3 each time to avoid (x, y, z).
 * The vertex shader place the vertices in clip space and the fragment shader color the pixels. (Default: 0)
 * VertexAttribPointer [Index, Size, Type, IsNormalized, Stride, Offset]
 * - Index (location)
 * - Size (Component per vector)
 * - Type
 * - IsNormalized (int to floats, for color transform [0, 255] to float [0, 1])
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
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
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
exports.UV_COORDS = exports.GROUND_INDICES = exports.GROUND_VERTICES = exports.CUBE_INDICES = exports.CUBE_VERTICES = void 0;
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
exports.GROUND_VERTICES = new Float32Array([
    // The plane ground
    -1.0, 1.0, -1.0, // 0
    -1.0, 1.0, 1.0, // 1
    1.0, 1.0, 1.0, // 2
    1.0, 1.0, -1.0, // 3
]);
exports.GROUND_INDICES = new Uint16Array([
    0, 1, 2,
    0, 2, 3, // top
]);
// For my tilemap: 
// 0,0, .5,0, .5,1, 0,1, [= Cat Stare]
// .5,0, 1,0, 1,1, .5,1, [= Cat OMG]
exports.UV_COORDS = new Float32Array([
    .5, 0, 1, 0, 1, 1, .5, 1, // front
    .5, 0, 1, 0, 1, 1, .5, 1, // back
    0, 0, .5, 0, .5, 1, 0, 1, // top
    0, 0, .5, 0, .5, 1, 0, 1, // bottom
    .5, 0, 1, 0, 1, 1, .5, 1, // right
    .5, 0, 1, 0, 1, 1, .5, 1, // left
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
const SETTINGS = {
    FOV: 60.0, // Default: 60.0
    ROTATION_ANGLE: 10.0, // Default: 10.0
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Canvas Element and Rendering Context.
        const canvas = document.getElementById("webgl-canvas");
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
        const vertexSrc = yield fnc.getShaderSource('./shaders/vertex_shader.vert');
        const fragmentSrc = yield fnc.getShaderSource('./shaders/fragment_shader.frag');
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
            gl.texImage2D(gl.TEXTURE_2D, // Target
            0, // Mipmap level
            gl.RGB, // Internal Format
            256, // Width
            128, // Height
            0, // Border
            gl.RGB, // Format
            gl.UNSIGNED_BYTE, // Type
            image // Source
            );
        };
        image.src = './img/tilemap.png';
        // Create a static buffer for our U,V coordinates.
        const texCoordsBuffer = fnc.createStaticBuffer(gl, geo.UV_COORDS, false);
        // Get the built-in variables, and our uniforms from shaders.
        const positionAttribute = gl.getAttribLocation(program, 'vertexPosition');
        const texAttribute = gl.getAttribLocation(program, 'aTexCoord');
        const matWorldUniform = gl.getUniformLocation(program, 'matWorld');
        const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj');
        if (positionAttribute < 0 || !matWorldUniform || !matViewProjUniform) {
            fnc.showError(`Failed to get attribs/uniforms (Max: ${gl.getParameter(gl.MAX_VERTEX_ATTRIBS)}): ` +
                `pos=${positionAttribute} ` +
                `matWorld=${!!matWorldUniform} matViewProj=${!!matViewProjUniform}`);
            return;
        }
        // Create our vertex array object buffers.
        const cubeVAO = fnc.createVAOBuffer(gl, cubeVertices, cubeIndices, texCoordsBuffer, positionAttribute, texAttribute);
        const groundVAO = fnc.createVAOBuffer(gl, groundVertices, groundIndices, texCoordsBuffer, positionAttribute, texAttribute);
        if (!cubeVAO || !groundVAO) {
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
        const frame = () => __awaiter(this, void 0, void 0, function* () {
            // Calculate dt with time in seconds between each frame.
            const thisFrameTime = performance.now();
            const dt = (thisFrameTime - lastFrameTime) / 1000;
            lastFrameTime = thisFrameTime;
            // Update
            cameraAngle += dt * fnc.toRadian(10);
            const cameraX = 3 * Math.sin(cameraAngle);
            const cameraZ = 3 * Math.cos(cameraAngle);
            matView.setLookAt(new cls.vec3(cameraX, 1, cameraZ), new cls.vec3(0, 0, 0), new cls.vec3(0, 1, 0));
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
            cubes.forEach((cube) => {
                cube.rotate(dt * fnc.toRadian(Math.floor(Math.random() * 180)));
                cube.draw(gl, matWorldUniform);
            });
            // Loop calls, each time the drawing is ready.
            requestAnimationFrame(frame);
        });
        // First call, as soon, as the browser is ready.
        requestAnimationFrame(frame);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUNyRixHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO1FBQy9CLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDRCxTQUFTO1FBQ0wsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztJQUNyRixDQUFDO0lBQ0QsS0FBSyxDQUFDLENBQU87UUFDVCxPQUFPLElBQUksSUFBSSxDQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQzNCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQzlCLENBQUM7SUFDTixDQUFDO0lBQ0QsR0FBRyxDQUFDLENBQU8sSUFBWSxPQUFPLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENB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QUNULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUVYLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFTLEVBQUUsTUFBWSxFQUFFLEVBQVE7UUFDdkMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUVqQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNaLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFVixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELCtCQUErQixDQUFDLENBQU8sRUFBRSxDQUFPLEVBQUUsQ0FBTztRQUNyRCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU1QyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRWpCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVULENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFD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QUNILDhDQUE4QztZQUM5QyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxDQUFDLEVBQUM7UUFDRixnREFBZ0Q7UUFDaEQscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUFBO0FBRUQsR0FBRyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUUvQixJQUFJLENBQUM7SUFBQyxJQUFJLEVBQUUsQ0FBQztBQUFDLENBQUM7QUFBQyxPQUFNLENBQUMsRUFBRSxDQUFDO0lBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUFDLENBQUM7Ozs7Ozs7VUMxS3ZFO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9jbGFzcy50cyIsIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9mdW5jdGlvbi50cyIsIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9nZW9tZXRyeS50cyIsIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9tYWluLnRzIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvL1xuLy8gQ0xBU1Ncbi8vXG5cbmV4cG9ydCBjbGFzcyBTaGFwZSB7XG4gICAgcHJpdmF0ZSBtYXRXb3JsZCA9IG5ldyBtYXQ0KCk7XG4gICAgcHJpdmF0ZSBzY2FsZVZlYyA9IG5ldyB2ZWMzKCk7XG4gICAgcHJpdmF0ZSByb3RhdGlvbiA9IG5ldyBxdWF0KCk7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBwb3M6IHZlYzMsXG4gICAgICAgIHByaXZhdGUgc2NhbGU6IG51bWJlcixcbiAgICAgICAgcHJpdmF0ZSByb3RhdGlvbkF4aXM6IHZlYzMsXG4gICAgICAgIHByaXZhdGUgcm90YXRpb25BbmdsZTogbnVtYmVyLFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0LFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgbnVtSW5kaWNlczogbnVtYmVyXG4gICAgKSB7IH1cblxuICAgIHJvdGF0ZShhbmdsZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMucm90YXRpb25BbmdsZSA9IHRoaXMucm90YXRpb25BbmdsZSArIGFuZ2xlO1xuICAgIH1cblxuICAgIGRyYXcoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIG1hdFdvcmxkVW5pZm9ybTogV2ViR0xVbmlmb3JtTG9jYXRpb24pIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5zZXRBeGlzQW5nbGUodGhpcy5yb3RhdGlvbkF4aXMsIHRoaXMucm90YXRpb25BbmdsZSk7XG4gICAgICAgIHRoaXMuc2NhbGVWZWMuc2V0KHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUpO1xuXG4gICAgICAgIHRoaXMubWF0V29ybGQuc2V0RnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSh0aGlzLnJvdGF0aW9uLCB0aGlzLnBvcywgdGhpcy5zY2FsZVZlYyk7XG5cbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRXb3JsZFVuaWZvcm0sIGZhbHNlLCB0aGlzLm1hdFdvcmxkLm0pO1xuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52YW8pO1xuICAgICAgICBnbC5kcmF3RWxlbWVudHMoZ2wuVFJJQU5HTEVTLCB0aGlzLm51bUluZGljZXMsIGdsLlVOU0lHTkVEX1NIT1JULCAwKTtcbiAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xuICAgIH1cbiAgICBcbn1cblxuZXhwb3J0IGNsYXNzIHZlYzMge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIgPSAwLjAsIHB1YmxpYyB5OiBudW1iZXIgPSAwLjAsIHB1YmxpYyB6OiBudW1iZXIgPSAwLjApIHt9XG5cbiAgICBhZGQodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueikgfVxuICAgIHN1YnRyYWN0KHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnopIH1cbiAgICBtdWx0aXBseSh2OiB2ZWMzKTogdmVjMyB7IHJldHVybiBuZXcgdmVjMyh0aGlzLnggKiB2LngsIHRoaXMueSAqIHYueSwgdGhpcy56ICogdi56KSB9XG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiB0aGlzIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy56ID0gejtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIG5vcm1hbGl6ZSgpOiB2ZWMzIHtcbiAgICAgICAgY29uc3QgbGVuID0gTWF0aC5oeXBvdCh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcbiAgICAgICAgcmV0dXJuIGxlbiA+IDAgPyBuZXcgdmVjMyh0aGlzLnggLyBsZW4sIHRoaXMueSAvIGxlbiwgdGhpcy56IC8gbGVuKSA6IG5ldyB2ZWMzKCk7XG4gICAgfVxuICAgIGNyb3NzKHY6IHZlYzMpOiB2ZWMzIHtcbiAgICAgICAgcmV0dXJuIG5ldyB2ZWMzKFxuICAgICAgICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxuICAgICAgICAgICAgdGhpcy56ICogdi54IC0gdGhpcy54ICogdi56LFxuICAgICAgICAgICAgdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54XG4gICAgICAgICk7XG4gICAgfVxuICAgIGRvdCh2OiB2ZWMzKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueSArIHRoaXMueiAqIHYueiB9XG59XG5cbmV4cG9ydCBjbGFzcyBxdWF0IHtcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHg6IG51bWJlciA9IDAsXG4gICAgICAgIHB1YmxpYyB5OiBudW1iZXIgPSAwLFxuICAgICAgICBwdWJsaWMgejogbnVtYmVyID0gMCxcbiAgICAgICAgcHVibGljIHc6IG51bWJlciA9IDFcbiAgICApIHt9XG5cbiAgICBzZXRBeGlzQW5nbGUoYXhpczogdmVjMywgYW5nbGU6IG51bWJlcik6IHRoaXMge1xuICAgICAgICBjb25zdCBub3JtID0gYXhpcy5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgaGFsZiA9IGFuZ2xlIC8gMjtcbiAgICAgICAgY29uc3QgcyA9IE1hdGguc2luKGhhbGYpO1xuXG4gICAgICAgIHRoaXMueCA9IG5vcm0ueCAqIHM7XG4gICAgICAgIHRoaXMueSA9IG5vcm0ueSAqIHM7XG4gICAgICAgIHRoaXMueiA9IG5vcm0ueiAqIHM7XG4gICAgICAgIHRoaXMudyA9IE1hdGguY29zKGhhbGYpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIG1hdDQge1xuICAgIHB1YmxpYyBtOiBGbG9hdDMyQXJyYXk7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5tID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XG4gICAgICAgIHRoaXMuaWRlbnRpdHkoKTtcbiAgICB9XG5cbiAgICBpZGVudGl0eSgpOiB0aGlzIHtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcbiAgICAgICAgbS5zZXQoW1xuICAgICAgICAgICAgMSwgMCwgMCwgMCxcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxuICAgICAgICAgICAgMCwgMCwgMCwgMVxuICAgICAgICBdKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29weUZyb20obWF0OiBtYXQ0KTogdGhpcyB7XG4gICAgICAgIHRoaXMubS5zZXQobWF0Lm0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBcbiAgICAvKipcbiAgICAgKiAgeCwgIDAsICAwLCAwXG4gICAgICogIDAsICB5LCAgMCwgMFxuICAgICAqICAwLCAgMCwgIHosIDBcbiAgICAgKiB0eCwgdHksIHR6LCAxXG4gICAgICovXG4gICAgbXVsdGlwbHkob3RoZXI6IG1hdDQpOiB0aGlzIHtcbiAgICAgICAgY29uc3QgYSA9IHRoaXMubSwgYiA9IG90aGVyLm07XG4gICAgICAgIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgKytpKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7ICsraikge1xuICAgICAgICAgICAgICAgIG91dFtqICogNCArIGldID1cbiAgICAgICAgICAgICAgICBhWzAgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMF0gK1xuICAgICAgICAgICAgICAgIGFbMSAqIDQgKyBpXSAqIGJbaiAqIDQgKyAxXSArXG4gICAgICAgICAgICAgICAgYVsyICogNCArIGldICogYltqICogNCArIDJdICtcbiAgICAgICAgICAgICAgICBhWzMgKiA0ICsgaV0gKiBiW2ogKiA0ICsgM107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm0uc2V0KG91dCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcnNwZWN0aXZlIG1hdHJpY2UsIHRoZSBmYWN0b3IgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSB0YW4gb2YgdGhlIEZPViBkaXZpZGVkIGJ5IDI6XG4gICAgICogV2UgaGF2ZSB0aGUgbmVhciBwbGFuZSBhbmQgZmFyIHBsYW5lLiAob2JqZWN0cyBhcmUgZHJhd24gaW4tYmV0d2VlbilcbiAgICAgKiBhc3BlY3QgaXMgdGhlIGFzcGVjdC1yYXRpbyBsaWtlIDE2Ojkgb24gbW9zdCBzY3JlZW5zLlxuICAgICAqIFdlIGNoYW5nZSBlYWNoIHZlcnRpY2VzIHgsIHkgYW5kIHogYnkgdGhlIGZvbGxvd2luZzpcbiAgICAgKiAwLCAwLCAgMCwgIDBcbiAgICAgKiAwLCA1LCAgMCwgIDBcbiAgICAgKiAwLCAwLCAxMCwgMTFcbiAgICAgKiAwLCAwLCAxNCwgMTVcbiAgICAgKi9cbiAgICBzZXRQZXJzcGVjdGl2ZShmb3ZSYWQ6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpOiB0aGlzIHtcbiAgICAgICAgY29uc3QgZiA9IDEuMCAvIE1hdGgudGFuKGZvdlJhZCAvIDIpO1xuICAgICAgICBjb25zdCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgbVswXSA9IGYgLyBhc3BlY3Q7XG4gICAgICAgIG1bMV0gPSAwO1xuICAgICAgICBtWzJdID0gMDtcbiAgICAgICAgbVszXSA9IDA7XG5cbiAgICAgICAgbVs0XSA9IDA7XG4gICAgICAgIG1bNV0gPSBmO1xuICAgICAgICBtWzZdID0gMDtcbiAgICAgICAgbVs3XSA9IDA7XG5cbiAgICAgICAgbVs4XSA9IDA7XG4gICAgICAgIG1bOV0gPSAwO1xuICAgICAgICBtWzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgICAgICBtWzExXSA9IC0xO1xuXG4gICAgICAgIG1bMTJdID0gMDtcbiAgICAgICAgbVsxM10gPSAwO1xuICAgICAgICBtWzE0XSA9IDIgKiBmYXIgKiBuZWFyICogbmY7XG4gICAgICAgIG1bMTVdID0gMDtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRMb29rQXQoZXllOiB2ZWMzLCBjZW50ZXI6IHZlYzMsIHVwOiB2ZWMzKTogdGhpcyB7XG4gICAgICAgIGNvbnN0IHogPSBleWUuc3VidHJhY3QoY2VudGVyKS5ub3JtYWxpemUoKTtcbiAgICAgICAgY29uc3QgeCA9IHVwLmNyb3NzKHopLm5vcm1hbGl6ZSgpO1xuICAgICAgICBjb25zdCB5ID0gei5jcm9zcyh4KTtcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubTtcblxuICAgICAgICBtWzBdID0geC54O1xuICAgICAgICBtWzFdID0geS54O1xuICAgICAgICBtWzJdID0gei54O1xuICAgICAgICBtWzNdID0gMDtcblxuICAgICAgICBtWzRdID0geC55O1xuICAgICAgICBtWzVdID0geS55O1xuICAgICAgICBtWzZdID0gei55O1xuICAgICAgICBtWzddID0gMDtcblxuICAgICAgICBtWzhdID0geC56O1xuICAgICAgICBtWzldID0geS56O1xuICAgICAgICBtWzEwXSA9IHouejtcbiAgICAgICAgbVsxMV0gPSAwO1xuXG4gICAgICAgIG1bMTJdID0gLXguZG90KGV5ZSk7XG4gICAgICAgIG1bMTNdID0gLXkuZG90KGV5ZSk7XG4gICAgICAgIG1bMTRdID0gLXouZG90KGV5ZSk7XG4gICAgICAgIG1bMTVdID0gMTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBzZXRGcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHE6IHF1YXQsIHY6IHZlYzMsIHM6IHZlYzMpOiB0aGlzIHtcbiAgICAgICAgY29uc3QgeCA9IHEueCwgeSA9IHEueSwgeiA9IHEueiwgdyA9IHEudztcbiAgICAgICAgY29uc3Qgc3ggPSBzLngsIHN5ID0gcy55LCBzeiA9IHMuejtcblxuICAgICAgICBjb25zdCB4MiA9IHggKyB4LCB5MiA9IHkgKyB5LCB6MiA9IHogKyB6O1xuICAgICAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MiwgeXogPSB5ICogejIsIHp6ID0geiAqIHoyO1xuICAgICAgICBjb25zdCB3eCA9IHcgKiB4Miwgd3kgPSB3ICogeTIsIHd6ID0gdyAqIHoyO1xuXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm07XG5cbiAgICAgICAgbVswXSA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICAgICAgICBtWzFdID0gKHh5ICsgd3opICogc3g7XG4gICAgICAgIG1bMl0gPSAoeHogLSB3eSkgKiBzeDtcbiAgICAgICAgbVszXSA9IDA7XG5cbiAgICAgICAgbVs0XSA9ICh4eSAtIHd6KSAqIHN5O1xuICAgICAgICBtWzVdID0gKDEgLSAoeHggKyB6eikpICogc3k7XG4gICAgICAgIG1bNl0gPSAoeXogKyB3eCkgKiBzeTtcbiAgICAgICAgbVs3XSA9IDA7XG5cbiAgICAgICAgbVs4XSA9ICh4eiArIHd5KSAqIHN6O1xuICAgICAgICBtWzldID0gKHl6IC0gd3gpICogc3o7XG4gICAgICAgIG1bMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gICAgICAgIG1bMTFdID0gMDtcblxuICAgICAgICBtWzEyXSA9IHYueDtcbiAgICAgICAgbVsxM10gPSB2Lnk7XG4gICAgICAgIG1bMTRdID0gdi56O1xuICAgICAgICBtWzE1XSA9IDE7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufSIsIi8vXG4vLyBGVU5DVElPTlxuLy9cblxuLy8gRGlzcGxheSBhbiBlcnJvciBtZXNzYWdlIHRvIHRoZSBIVE1MIEVsZW1lbnQgd2l0aCBpZCBcImVycm9yLWNvbnRhaW5lclwiLlxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvcihtc2c6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZXJyb3ItY29udGFpbmVyXCIpO1xuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gRWxlbWVudCB3aXRoIElEOiBlcnJvci1jb250YWluZXJcIik7XG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBlbGVtZW50LmlubmVyVGV4dCA9IG1zZztcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZWxlbWVudCk7XG4gICAgY29uc29sZS5sb2cobXNnKTtcbn1cblxuLy8gR2V0IHNoYWRlcnMgc291cmNlIGNvZGUuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2hhZGVyU291cmNlKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGxvYWRpbmcgc2hhZGVyIGNvZGUgYXQgXCIke3VybH1cIjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEltYWdlKHVybDogc3RyaW5nKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XG4gICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWFnZS5zcmMgPSB1cmw7XG4gICAgcmV0dXJuIGltYWdlO1xufVxuXG4vLyBSZXR1cm4gdGhlIFdlYkdMIENvbnRleHQgZnJvbSB0aGUgQ2FudmFzIEVsZW1lbnQuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCB7XG4gICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IDtcbn1cblxuLy8gQ29udmVydCBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFudC5cbmV4cG9ydCBmdW5jdGlvbiB0b1JhZGlhbihhbmdsZTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICByZXR1cm4gYW5nbGUgKiBNYXRoLlBJIC8gMTgwO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIFdlYkdMIEJ1ZmZlciB0eXBlLiAoT3BhcXVlIEhhbmRsZSlcbiAqIC0gU1RBVElDX0RSQVcgOiB3b250IHVwZGF0ZSBvZnRlbiwgYnV0IG9mdGVuIHVzZWQuXG4gKiAtIEFSUkFZX0JVRkZFUiA6IGluZGljYXRlIHRoZSBwbGFjZSB0byBzdG9yZSB0aGUgQXJyYXkuXG4gKiAtIEVMRU1FTlRfQVJSQVlfQlVGRkVSIDogVXNlZCBmb3IgaW5kaWNlcyB3aXRoIGN1YmUgc2hhcGVzIGRyYXdpbmcuXG4gKiBCaW5kIHRoZSBCdWZmZXIgdG8gdGhlIENQVSwgYWRkIHRoZSBBcnJheSB0byB0aGUgQnVmZmVyIGFuZCBDbGVhciBhZnRlciB1c2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdGF0aWNCdWZmZXIoZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsIGRhdGE6IEFycmF5QnVmZmVyLCBpc0luZGljZTogYm9vbGVhbik6IFdlYkdMQnVmZmVyIHtcbiAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICBjb25zdCB0eXBlID0gKGlzSW5kaWNlID09IHRydWUpID8gZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiBnbC5BUlJBWV9CVUZGRVJcbiAgICBpZighYnVmZmVyKSB7IFxuICAgICAgICBzaG93RXJyb3IoXCJGYWlsZWQgdG8gYWxsb2NhdGUgYnVmZmVyIHNwYWNlXCIpOyBcbiAgICAgICAgcmV0dXJuIDA7IFxuICAgIH1cblxuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgYnVmZmVyKTtcbiAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIG51bGwpO1xuICAgIHJldHVybiBidWZmZXJcbn1cblxuLyoqXG4gKiBDcmVhdGUgdmVydGV4IGFycmF5IG9iamVjdCBidWZmZXJzLCBpdCByZWFkIHRoZSB2ZXJ0aWNlcyBmcm9tIEdQVSBCdWZmZXIuXG4gKiBUaGUgdmVydGV4IGJ1ZmZlciBjb250YWlucyB0aGUgY29vcmRpbmF0ZXMgYW5kIGNvbG9yIHBlciB2ZXJ0ZXguICh4LCB5LCB6LCByLCBnLCBiKVxuICogVGhlIGluZGV4IGJ1ZmZlciBjb250YWlucyB3aWNoIHZlcnRleCBuZWVkIHRvIGJlIGRyYXduIG9uIHNjZW5lIHRvIGF2b2lkIHN1cnBsdXMuXG4gKiBUaGUgY29sb3IgYXR0cmliIHBvaW50ZXIgaXMgb2Zmc2V0IGJ5IDMgZWFjaCB0aW1lIHRvIGF2b2lkICh4LCB5LCB6KS5cbiAqIFRoZSB2ZXJ0ZXggc2hhZGVyIHBsYWNlIHRoZSB2ZXJ0aWNlcyBpbiBjbGlwIHNwYWNlIGFuZCB0aGUgZnJhZ21lbnQgc2hhZGVyIGNvbG9yIHRoZSBwaXhlbHMuIChEZWZhdWx0OiAwKVxuICogVmVydGV4QXR0cmliUG9pbnRlciBbSW5kZXgsIFNpemUsIFR5cGUsIElzTm9ybWFsaXplZCwgU3RyaWRlLCBPZmZzZXRdXG4gKiAtIEluZGV4IChsb2NhdGlvbilcbiAqIC0gU2l6ZSAoQ29tcG9uZW50IHBlciB2ZWN0b3IpXG4gKiAtIFR5cGVcbiAqIC0gSXNOb3JtYWxpemVkIChpbnQgdG8gZmxvYXRzLCBmb3IgY29sb3IgdHJhbnNmb3JtIFswLCAyNTVdIHRvIGZsb2F0IFswLCAxXSlcbiAqIC0gU3RyaWRlIChEaXN0YW5jZSBiZXR3ZWVuIGVhY2ggdmVydGV4IGluIHRoZSBidWZmZXIpXG4gKiAtIE9mZnNldCAoTnVtYmVyIG9mIHNraXBlZCBieXRlcyBiZWZvcmUgcmVhZGluZyBhdHRyaWJ1dGVzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVkFPQnVmZmVyKFxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxuICAgIHZlcnRleEJ1ZmZlcjogV2ViR0xCdWZmZXIsIGluZGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgdGV4QnVmZmVyOiBXZWJHTEJ1ZmZlcixcbiAgICBwb3NBdHRyaWI6IG51bWJlciwgdGV4QXR0cmliOiBudW1iZXJcbik6IFdlYkdMVmVydGV4QXJyYXlPYmplY3Qge1xuICAgIGNvbnN0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XG4gICAgaWYoIXZhbykgeyBzaG93RXJyb3IoXCJGYWlsZWQgdG8gYWxsb2NhdGUgVkFPIGJ1ZmZlci5cIik7IHJldHVybiAwOyB9XG4gICAgZ2wuYmluZFZlcnRleEFycmF5KHZhbyk7XG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zQXR0cmliKTtcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh0ZXhBdHRyaWIpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zQXR0cmliLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApOyAvLyBmb3JtYXQ6ICh4LCB5LCB6KSAoYWxsIGYzMilcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHRleEJ1ZmZlcik7XG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcigxLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xuICAgIGdsLmJpbmRCdWZmZXIoZ2wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIG51bGwpO1xuICAgIHJldHVybiB2YW87XG59XG5cbi8vIENyZWF0ZSBhIHByb2dyYW0gYW5kIGxpbmsgdGhlIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlIHRvIGl0LlxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oXG4gICAgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsXG4gICAgdmVydGV4U2hhZGVyU3JjOiBzdHJpbmcsXG4gICAgZnJhZ21lbnRTaGFkZXJTcmM6IHN0cmluZ1xuKTogV2ViR0xQcm9ncmFtIHtcbiAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XG4gICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcbiAgICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydGV4U2hhZGVyU3JjKTtcbiAgICBnbC5jb21waWxlU2hhZGVyKHZlcnRleFNoYWRlcik7XG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0ZXhTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKTtcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gc2hhZGVyIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTaGFkZXJTcmMpO1xuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xuICAgIGlmKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoZnJhZ21lbnRTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpO1xuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgLy8gUHJvZ3JhbSBzZXQgdXAgZm9yIFVuaWZvcm1zLlxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XG4gICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG4gICAgaWYoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSk7XG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHByb2dyYW0gZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBwcm9ncmFtO1xufSIsIi8vIFZlcnRleCBidWZmZXIgZm9ybWF0OiBYWVpcblxuLy9cbi8vIEN1YmUgZ2VvbWV0cnlcbi8vIHRha2VuIGZyb206IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJHTF9BUEkvVHV0b3JpYWwvQ3JlYXRpbmdfM0Rfb2JqZWN0c191c2luZ19XZWJHTFxuZXhwb3J0IGNvbnN0IENVQkVfVkVSVElDRVMgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgLy8gRnJvbnQgZmFjZVxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAwIEFcbiAgMS4wLCAtMS4wLCAxLjAsICAgLy8gMSBCXG4gIDEuMCwgMS4wLCAxLjAsICAgIC8vIDIgQ1xuICAtMS4wLCAxLjAsIDEuMCwgICAvLyAzIERcblxuICAvLyBCYWNrIGZhY2VcbiAgLTEuMCwgLTEuMCwgLTEuMCwgLy8gNFxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyA1XG4gIDEuMCwgMS4wLCAtMS4wLCAgIC8vIDZcbiAgMS4wLCAtMS4wLCAtMS4wLCAgLy8gN1xuXG4gIC8vIFRvcCBmYWNlXG4gIC0xLjAsIDEuMCwgLTEuMCwgIC8vIDhcbiAgLTEuMCwgMS4wLCAxLjAsICAgLy8gOVxuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAxMFxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAxMVxuXG4gIC8vIEJvdHRvbSBmYWNlXG4gIC0xLjAsIC0xLjAsIC0xLjAsIC8vIDEyXG4gIDEuMCwgLTEuMCwgLTEuMCwgIC8vIDEzXG4gIDEuMCwgLTEuMCwgMS4wLCAgIC8vIDE0XG4gIC0xLjAsIC0xLjAsIDEuMCwgIC8vIDE1XG5cbiAgLy8gUmlnaHQgZmFjZVxuICAxLjAsIC0xLjAsIC0xLjAsICAvLyAxNlxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAxN1xuICAxLjAsIDEuMCwgMS4wLCAgICAvLyAxOFxuICAxLjAsIC0xLjAsIDEuMCwgICAvLyAxOVxuXG4gIC8vIExlZnQgZmFjZVxuICAtMS4wLCAtMS4wLCAtMS4wLCAvLyAyMFxuICAtMS4wLCAtMS4wLCAxLjAsICAvLyAyMVxuICAtMS4wLCAxLjAsIDEuMCwgICAvLyAyMlxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyAyM1xuXSk7XG5cbmV4cG9ydCBjb25zdCBDVUJFX0lORElDRVMgPSBuZXcgVWludDE2QXJyYXkoW1xuICAwLCAxLCAyLFxuICAwLCAyLCAzLCAvLyBmcm9udFxuICA0LCA1LCA2LFxuICA0LCA2LCA3LCAvLyBiYWNrXG4gIDgsIDksIDEwLFxuICA4LCAxMCwgMTEsIC8vIHRvcFxuICAxMiwgMTMsIDE0LFxuICAxMiwgMTQsIDE1LCAvLyBib3R0b21cbiAgMTYsIDE3LCAxOCxcbiAgMTYsIDE4LCAxOSwgLy8gcmlnaHRcbiAgMjAsIDIxLCAyMixcbiAgMjAsIDIyLCAyMywgLy8gbGVmdFxuXSk7XG5cbmV4cG9ydCBjb25zdCBHUk9VTkRfVkVSVElDRVMgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgLy8gVGhlIHBsYW5lIGdyb3VuZFxuICAtMS4wLCAxLjAsIC0xLjAsICAvLyAwXG4gIC0xLjAsIDEuMCwgMS4wLCAgIC8vIDFcbiAgMS4wLCAxLjAsIDEuMCwgICAgLy8gMlxuICAxLjAsIDEuMCwgLTEuMCwgICAvLyAzXG5dKTtcblxuZXhwb3J0IGNvbnN0IEdST1VORF9JTkRJQ0VTID0gbmV3IFVpbnQxNkFycmF5KFtcbiAgMCwgMSwgMixcbiAgMCwgMiwgMywgLy8gdG9wXG5dKTtcblxuXG4vLyBGb3IgbXkgdGlsZW1hcDogXG4vLyAwLDAsIC41LDAsIC41LDEsIDAsMSwgWz0gQ2F0IFN0YXJlXVxuLy8gLjUsMCwgMSwwLCAxLDEsIC41LDEsIFs9IENhdCBPTUddXG5leHBvcnQgY29uc3QgVVZfQ09PUkRTID0gbmV3IEZsb2F0MzJBcnJheShbXG4gIC41LDAsIDEsMCwgMSwxLCAuNSwxLCAvLyBmcm9udFxuICAuNSwwLCAxLDAsIDEsMSwgLjUsMSwgLy8gYmFja1xuICAwLDAsIC41LDAsIC41LDEsIDAsMSwgICAvLyB0b3BcbiAgMCwwLCAuNSwwLCAuNSwxLCAwLDEsICAgLy8gYm90dG9tXG4gIC41LDAsIDEsMCwgMSwxLCAuNSwxLCAgIC8vIHJpZ2h0XG4gIC41LDAsIDEsMCwgMSwxLCAuNSwxLCAgIC8vIGxlZnRcbl0pIiwiaW1wb3J0ICogYXMgZm5jIGZyb20gXCIuL2Z1bmN0aW9uXCI7XG5pbXBvcnQgKiBhcyBjbHMgZnJvbSBcIi4vY2xhc3NcIjtcbmltcG9ydCAqIGFzIGdlbyBmcm9tIFwiLi9nZW9tZXRyeVwiO1xuXG4vL1xuLy8gTUFJTlxuLy9cblxuY29uc3QgU0VUVElOR1MgPSB7XG4gICAgRk9WIDogNjAuMCwgLy8gRGVmYXVsdDogNjAuMFxuICAgIFJPVEFUSU9OX0FOR0xFIDogMTAuMCwgLy8gRGVmYXVsdDogMTAuMFxufVxuXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xuXG4gICAgLy8gQ2FudmFzIEVsZW1lbnQgYW5kIFJlbmRlcmluZyBDb250ZXh0LlxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ2wtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgIGNvbnN0IGdsID0gZm5jLmdldENvbnRleHQoY2FudmFzKTtcblxuICAgIC8vIEN1YmUgYW5kIEdyb3VuZCB2ZXJ0aWNlcy9pbmRpY2VzIGJ1ZmZlcnMuXG4gICAgY29uc3QgY3ViZVZlcnRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkNVQkVfVkVSVElDRVMsIGZhbHNlKTtcbiAgICBjb25zdCBjdWJlSW5kaWNlcyA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIGdlby5DVUJFX0lORElDRVMsIHRydWUpO1xuICAgIGNvbnN0IGdyb3VuZFZlcnRpY2VzID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgZ2VvLkdST1VORF9JTkRJQ0VTLCBmYWxzZSk7XG4gICAgY29uc3QgZ3JvdW5kSW5kaWNlcyA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIGdlby5HUk9VTkRfSU5ESUNFUywgdHJ1ZSk7XG5cbiAgICBpZiAoIWN1YmVWZXJ0aWNlcyB8fCAhY3ViZUluZGljZXMgfHwgIWdyb3VuZFZlcnRpY2VzIHx8ICFncm91bmRJbmRpY2VzKSB7XG4gICAgICAgIGZuYy5zaG93RXJyb3IoYEZhaWxlZCB0byBjcmVhdGUgZ2VvOiBjdWJlOiAodj0keyEhY3ViZVZlcnRpY2VzfSBpPSR7Y3ViZUluZGljZXN9KSwgZ3JvdW5kPSh2PSR7ISFncm91bmRWZXJ0aWNlc30gaT0keyEhZ3JvdW5kSW5kaWNlc30pYCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGZXRjaCBzaGFkZXJzIGNvZGUgYW5kIGxpbmsgaXQgdG8gYSBwcm9ncmFtLlxuICAgIGNvbnN0IHZlcnRleFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy92ZXJ0ZXhfc2hhZGVyLnZlcnQnKTtcbiAgICBjb25zdCBmcmFnbWVudFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy9mcmFnbWVudF9zaGFkZXIuZnJhZycpO1xuICAgIGNvbnN0IHByb2dyYW0gPSBmbmMuY3JlYXRlUHJvZ3JhbShnbCwgdmVydGV4U3JjLCBmcmFnbWVudFNyYyk7XG5cbiAgICAvLyBDcmVhdGUgYSBuZXcgSW1hZ2UuXG4gICAgY29uc3QgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAvLyBPbiBpbWFnZSBsb2FkLCB3ZSBiaW5kIGl0IHRvIGEgVEVYVFVSRV8yRCBhbmQgc2V0IGl0IGF0dHJpYnV0ZXMuXG4gICAgaW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAvLyBGbGlwIHRoZSBvcmlnaW4gcG9pbnQgb2YgV2ViR0wuIChQTkcgZm9ybWF0IHN0YXJ0IGF0IHRoZSB0b3AgYW5kIFdlYkdMIGF0IHRoZSBib3R0b20pXG4gICAgICAgIGdsLnBpeGVsU3RvcmVpKGdsLlVOUEFDS19GTElQX1lfV0VCR0wsIHRydWUpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIHRleHR1cmUgYW5kIGJpbmQgb3VyIGltYWdlLlxuICAgICAgICBjb25zdCB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xuICAgICAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJELCB0ZXh0dXJlKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEhvdyBXZWJHTCBzaG91bGQgbWFuYWdlIG1pcG1hcCwgZG9lcyBpdCBnZW5lcmF0ZSBpdHNlbGYgb3IgXCJkaXNhYmxlXCIgaXQgP1xuICAgICAgICAvLyBnbC5nZW5lcmF0ZU1pcG1hcChnbC5URVhUVVJFXzJEKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfUywgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9XUkFQX1QsIGdsLkNMQU1QX1RPX0VER0UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5MSU5FQVIpO1xuXG4gICAgICAgIGdsLnRleEltYWdlMkQoXG4gICAgICAgICAgICBnbC5URVhUVVJFXzJELCAgICAgIC8vIFRhcmdldFxuICAgICAgICAgICAgMCwgICAgICAgICAgICAgICAgICAvLyBNaXBtYXAgbGV2ZWxcbiAgICAgICAgICAgIGdsLlJHQiwgICAgICAgICAgICAgLy8gSW50ZXJuYWwgRm9ybWF0XG4gICAgICAgICAgICAyNTYsICAgICAgICAgICAgICAgIC8vIFdpZHRoXG4gICAgICAgICAgICAxMjgsICAgICAgICAgICAgICAgIC8vIEhlaWdodFxuICAgICAgICAgICAgMCwgICAgICAgICAgICAgICAgICAvLyBCb3JkZXJcbiAgICAgICAgICAgIGdsLlJHQiwgICAgICAgICAgICAgLy8gRm9ybWF0XG4gICAgICAgICAgICBnbC5VTlNJR05FRF9CWVRFLCAgIC8vIFR5cGVcbiAgICAgICAgICAgIGltYWdlICAgICAgICAgICAgICAgLy8gU291cmNlXG4gICAgICAgICk7XG4gICAgfVxuICAgIGltYWdlLnNyYyA9ICcuL2ltZy90aWxlbWFwLnBuZyc7XG5cbiAgICAvLyBDcmVhdGUgYSBzdGF0aWMgYnVmZmVyIGZvciBvdXIgVSxWIGNvb3JkaW5hdGVzLlxuICAgIGNvbnN0IHRleENvb3Jkc0J1ZmZlciA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIGdlby5VVl9DT09SRFMsIGZhbHNlKTtcblxuICAgIC8vIEdldCB0aGUgYnVpbHQtaW4gdmFyaWFibGVzLCBhbmQgb3VyIHVuaWZvcm1zIGZyb20gc2hhZGVycy5cbiAgICBjb25zdCBwb3NpdGlvbkF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICd2ZXJ0ZXhQb3NpdGlvbicpO1xuICAgIGNvbnN0IHRleEF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICdhVGV4Q29vcmQnKTtcbiAgICBjb25zdCBtYXRXb3JsZFVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFdvcmxkJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XG4gICAgY29uc3QgbWF0Vmlld1Byb2pVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICdtYXRWaWV3UHJvaicpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xuXG4gICAgaWYocG9zaXRpb25BdHRyaWJ1dGUgPCAwIHx8ICFtYXRXb3JsZFVuaWZvcm0gfHwgIW1hdFZpZXdQcm9qVW5pZm9ybSkge1xuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gZ2V0IGF0dHJpYnMvdW5pZm9ybXMgKE1heDogJHtnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9BVFRSSUJTKX0pOiBgICtcbiAgICAgICAgICAgICBgcG9zPSR7cG9zaXRpb25BdHRyaWJ1dGV9IGAgK1xuICAgICAgICAgICAgYG1hdFdvcmxkPSR7ISFtYXRXb3JsZFVuaWZvcm19IG1hdFZpZXdQcm9qPSR7ISFtYXRWaWV3UHJvalVuaWZvcm19YFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIG91ciB2ZXJ0ZXggYXJyYXkgb2JqZWN0IGJ1ZmZlcnMuXG4gICAgY29uc3QgY3ViZVZBTyA9IGZuYy5jcmVhdGVWQU9CdWZmZXIoZ2wsIGN1YmVWZXJ0aWNlcywgY3ViZUluZGljZXMsIHRleENvb3Jkc0J1ZmZlciwgcG9zaXRpb25BdHRyaWJ1dGUsIHRleEF0dHJpYnV0ZSk7XG4gICAgY29uc3QgZ3JvdW5kVkFPID0gZm5jLmNyZWF0ZVZBT0J1ZmZlcihnbCwgZ3JvdW5kVmVydGljZXMsIGdyb3VuZEluZGljZXMsIHRleENvb3Jkc0J1ZmZlciwgcG9zaXRpb25BdHRyaWJ1dGUsIHRleEF0dHJpYnV0ZSk7XG4gICAgaWYoIWN1YmVWQU8gfHwgIWdyb3VuZFZBTykge1xuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZXMgdG8gY3JlYXRlIFZBT3M6IGN1YmU9JHshIWN1YmVWQU99LCBncm91bmQ9JHshIWdyb3VuZFZBT31gKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFN0b3JlIG91ciBjdWJlcy5cbiAgICBjb25zdCBVUF9WRUMgPSBuZXcgY2xzLnZlYzMoMCwgMSwgMCk7XG4gICAgY29uc3QgY3ViZXMgPSBbXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKDAsIDAuNCwgMCksIDAuNCwgVVBfVkVDLCAwLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksIC8vIENlbnRlclxuICAgICAgICBuZXcgY2xzLlNoYXBlKG5ldyBjbHMudmVjMygxLCAwLjA1LCAxKSwgMC4zLCBVUF9WRUMsIGZuYy50b1JhZGlhbigyMCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcbiAgICAgICAgbmV3IGNscy5TaGFwZShuZXcgY2xzLnZlYzMoMSwgMC4xLCAtMSksIDAuMSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNDApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKC0xLCAwLjE1LCAxKSwgMC4xNSwgVVBfVkVDLCBmbmMudG9SYWRpYW4oNjApLCBjdWJlVkFPLCBnZW8uQ1VCRV9JTkRJQ0VTLmxlbmd0aCksXG4gICAgICAgIG5ldyBjbHMuU2hhcGUobmV3IGNscy52ZWMzKC0xLCAwLjIsIC0xKSwgMC4yLCBVUF9WRUMsIGZuYy50b1JhZGlhbig4MCksIGN1YmVWQU8sIGdlby5DVUJFX0lORElDRVMubGVuZ3RoKSxcbiAgICBdO1xuXG4gICAgbGV0IG1hdFZpZXcgPSBuZXcgY2xzLm1hdDQoKTtcbiAgICBsZXQgbWF0UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xuICAgIGxldCBtYXRWaWV3UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xuXG4gICAgbGV0IGNhbWVyYUFuZ2xlID0gMDtcbiAgICAvKipcbiAgICAgKiBBZGQgYSBmdW5jdGlvbiB0byBjYWxsIGl0IGVhY2ggZnJhbWUuXG4gICAgICogLSBPdXRwdXQgTWVyZ2VyOiBNZXJnZSB0aGUgc2hhZGVkIHBpeGVsIGZyYWdtZW50IHdpdGggdGhlIGV4aXN0aW5nIG91dCBpbWFnZS5cbiAgICAgKiAtIFJhc3Rlcml6ZXI6IFdpY2ggcGl4ZWwgYXJlIHBhcnQgb2YgdGhlIFZlcnRpY2VzICsgV2ljaCBwYXJ0IGlzIG1vZGlmaWVkIGJ5IE9wZW5HTC5cbiAgICAgKiAtIEdQVSBQcm9ncmFtOiBQYWlyIFZlcnRleCAmIEZyYWdtZW50IHNoYWRlcnMuXG4gICAgICogLSBVbmlmb3JtczogU2V0dGluZyB0aGVtIChjYW4gYmUgc2V0IGFueXdoZXJlKSAoc2l6ZS9sb2MgaW4gcGl4ZWxzIChweCkpXG4gICAgICogLSBEcmF3IENhbGxzOiAody8gUHJpbWl0aXZlIGFzc2VtYmx5ICsgZm9yIGxvb3ApXG4gICAgICovXG4gICAgbGV0IGxhc3RGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCBmcmFtZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgLy8gQ2FsY3VsYXRlIGR0IHdpdGggdGltZSBpbiBzZWNvbmRzIGJldHdlZW4gZWFjaCBmcmFtZS5cbiAgICAgICAgY29uc3QgdGhpc0ZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICBjb25zdCBkdCA9ICh0aGlzRnJhbWVUaW1lIC0gbGFzdEZyYW1lVGltZSkgLyAxMDAwO1xuICAgICAgICBsYXN0RnJhbWVUaW1lID0gdGhpc0ZyYW1lVGltZTtcblxuICAgICAgICAvLyBVcGRhdGVcbiAgICAgICAgY2FtZXJhQW5nbGUgKz0gZHQgKiBmbmMudG9SYWRpYW4oMTApO1xuXG4gICAgICAgIGNvbnN0IGNhbWVyYVggPSAzICogTWF0aC5zaW4oY2FtZXJhQW5nbGUpO1xuICAgICAgICBjb25zdCBjYW1lcmFaID0gMyAqIE1hdGguY29zKGNhbWVyYUFuZ2xlKTtcblxuICAgICAgICBtYXRWaWV3LnNldExvb2tBdChcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMyhjYW1lcmFYLCAxLCBjYW1lcmFaKSxcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAwLCAwKSxcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMygwLCAxLCAwKVxuICAgICAgICApO1xuICAgICAgICBtYXRQcm9qLnNldFBlcnNwZWN0aXZlKFxuICAgICAgICAgICAgZm5jLnRvUmFkaWFuKFNFVFRJTkdTLkZPViksIC8vIEZPVlxuICAgICAgICAgICAgY2FudmFzLndpZHRoIC8gY2FudmFzLmhlaWdodCwgLy8gQVNQRUNUIFJBVElPXG4gICAgICAgICAgICAwLjEsIDEwMC4wIC8vIFotTkVBUiAvIFotRkFSXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gR0xNOiBtYXRWaWV3UHJvaiA9IG1hdFByb2ogKiBtYXRWaWV3XG4gICAgICAgIG1hdFZpZXdQcm9qID0gbWF0UHJvai5tdWx0aXBseShtYXRWaWV3KTtcblxuICAgICAgICAvLyBSZW5kZXJcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLmNsaWVudFdpZHRoICogZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5jbGllbnRIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvO1xuXG4gICAgICAgIGdsLmNsZWFyQ29sb3IoMC4wMiwgMC4wMiwgMC4wMiwgMSk7XG4gICAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG4gICAgICAgIGdsLmZyb250RmFjZShnbC5DQ1cpO1xuICAgICAgICBnbC52aWV3cG9ydCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYobWF0Vmlld1Byb2pVbmlmb3JtLCBmYWxzZSwgbWF0Vmlld1Byb2oubSk7XG5cbiAgICAgICAgY3ViZXMuZm9yRWFjaCgoY3ViZSkgPT4ge1xuICAgICAgICAgICAgY3ViZS5yb3RhdGUoZHQgKiBmbmMudG9SYWRpYW4oTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTgwKSkpO1xuICAgICAgICAgICAgY3ViZS5kcmF3KGdsLCBtYXRXb3JsZFVuaWZvcm0pO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gTG9vcCBjYWxscywgZWFjaCB0aW1lIHRoZSBkcmF3aW5nIGlzIHJlYWR5LlxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICAgIH07XG4gICAgLy8gRmlyc3QgY2FsbCwgYXMgc29vbiwgYXMgdGhlIGJyb3dzZXIgaXMgcmVhZHkuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbn1cblxuZm5jLnNob3dFcnJvcihcIk5vIEVycm9ycyEg8J+MnlwiKTtcblxudHJ5IHsgbWFpbigpOyB9IGNhdGNoKGUpIHsgZm5jLnNob3dFcnJvcihgVW5jYXVnaHQgZXhjZXB0aW9uOiAke2V9YCk7IH0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvbWFpbi50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==