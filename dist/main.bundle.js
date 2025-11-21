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
     * We have the near plane and far plane. (objects are drawn in between)
     * Aspect is the aspect ratio, like 16:9 on most screens.
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
            v.x, v.y, v.z, 1
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
 * - STATIC_DRAW : won't update often, but often used.
 * - ARRAY_BUFFER : indicate the place to store the Array.
 * - ELEMENT_ARRAY_BUFFER : Used for indices with cube shape drawing.
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
/* Create vertex array object buffers, it reads the vertices from GPU Buffer.
 * The vertex buffer contains the vertices' coordinates (can also contain color and size).
 * The index buffer contains which vertex needs to be drawn on scene to avoid duplicate vertices.
 * In case of colors, an offset of 3 floats is used each time to avoid (x, y, z) coordinates.
 * The vertex shader places the vertices in clip space and the fragment shader colors the pixels. (Default: 0)
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
 * Flip the origin point of WebGL. (PNG format starts at the top and WebGL at the bottom)
 * Because texSubImage3D is async, waiting for each image to load is slow. So, we preload all images using a Promise.
 * Set the parameters on how to store each texture. (Target, Mipmap_Level, Internal_Format, Width, Height, Depth, Border, Format, Type, Offset)
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
const objLoader_1 = __webpack_require__(/*! ./objLoader */ "./src/objLoader.ts");
const tweakpane = __webpack_require__(/*! ./tweakpane */ "./src/tweakpane.ts");
//
// MAIN
//
const UP_VEC = new cls.vec3(0, 1, 0);
const T0 = Date.now();
const TEXTURES = ['./img/diamond.png'];
const SETTINGS = tweakpane.SETTINGS;
tweakpane.init();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Canvas Element and Rendering Context.
        const canvas = document.getElementById("webgl-canvas");
        const gl = fnc.getContext(canvas);
        // Fetch shaders code and link them to a program.
        const vertexSrc = yield fnc.getShaderSource('./shaders/vertex_shader.vert');
        const fragmentSrc = yield fnc.getShaderSource('./shaders/fragment_shader.frag');
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
        const matWorldUniform = gl.getUniformLocation(program, 'matWorld');
        const matViewProjUniform = gl.getUniformLocation(program, 'matViewProj');
        const samplerUniform = gl.getUniformLocation(program, 'uSampler');
        // Typescript wants to verify if the variables are set, not the best way to do it.
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
        const model = yield (0, objLoader_1.loadOBJ)('./models/diamond.obj');
        const modelVertexBuffer = fnc.createStaticBuffer(gl, model.vertices, false);
        const modelIndexBuffer = fnc.createStaticBuffer(gl, model.indices, true);
        const modelUVBuffer = fnc.createStaticBuffer(gl, model.uvs, false);
        const modelVAO = fnc.createVAOBuffer(gl, modelVertexBuffer, modelIndexBuffer, modelUVBuffer, positionAttribute, uvAttribute);
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
        const frame = () => __awaiter(this, void 0, void 0, function* () {
            // Calculate dt (delta time) with time spent in seconds between each frame.
            const thisFrameTime = performance.now();
            const dt = (thisFrameTime - lastFrameTime) / 1000;
            lastFrameTime = thisFrameTime;
            // Store our cubes, draw them each time. (a lot of draw calls)
            const cubes = [];
            cubes.push(new cls.Shape(new cls.vec3(0, 0, 0), SETTINGS.object_size, UP_VEC, fnc.toRadian(0), modelVAO, model.indices.length));
            // Each frame adds 10° to the camera angle.
            // cameraAngle += dt * fnc.toRadian(10);
            // Fixed camera coordinates.
            const cameraX = 3 * Math.sin(cameraAngle);
            const cameraZ = 3 * Math.cos(cameraAngle);
            // Make the 'camera' look at the center.
            matView.setLookAt(new cls.vec3(cameraX, -.25, cameraZ), new cls.vec3(0, 0, 0), new cls.vec3(0, 1, 0));
            // Set the camera FOV, screen size, and view distance.
            matProj.setPerspective(fnc.toRadian(SETTINGS.camera_fov), // FOV
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
                cube.draw(gl, matWorldUniform);
            });
            // dt is the time spent between each image.
            // fps is a frequency, it's the invert of dt.
            SETTINGS.benchmark_fps = Math.ceil(1 / dt);
            // Loop calls, each time the drawing is ready.
            requestAnimationFrame(frame);
        });
        // First call, as soon as the page is loaded.
        requestAnimationFrame(frame);
        SETTINGS.benchmark_loading_time = Date.now() - T0;
    });
}
try {
    main().then(() => {
        fnc.showError("No Errors! 🌞");
    })
        .catch((e) => {
        fnc.showError(`Uncaught async exception: ${e}`);
    });
}
catch (e) {
    fnc.showError(`Uncaught synchronous exception: ${e}`);
}


/***/ }),

/***/ "./src/objLoader.ts":
/*!**************************!*\
  !*** ./src/objLoader.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, exports) {


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
exports.loadOBJ = loadOBJ;
function loadOBJ(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url);
        const text = yield response.text();
        const lines = text.split("\n");
        const positions = [];
        const uvs = [];
        const indices = [];
        const finalVertices = [];
        const finalUVs = [];
        const uniqueVertices = new Map();
        let index = 0;
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts[0] === 'v') {
                positions.push(...parts.slice(1).map(Number));
            }
            else if (parts[0] === 'vt') {
                uvs.push(...parts.slice(1).map(Number));
            }
            else if (parts[0] === 'f') {
                for (let i = 1; i <= 3; i++) {
                    const key = parts[i];
                    if (!uniqueVertices.has(key)) {
                        const [vIndex, vtIndex] = key.split('/').map(idx => parseInt(idx) - 1);
                        finalVertices.push(positions[vIndex * 3], positions[vIndex * 3 + 1], positions[vIndex * 3 + 2]);
                        finalUVs.push(uvs[vtIndex * 2], uvs[vtIndex * 2 + 1]);
                        uniqueVertices.set(key, index++);
                    }
                    indices.push(uniqueVertices.get(key));
                }
            }
        }
        return {
            vertices: new Float32Array(finalVertices),
            uvs: new Float32Array(finalUVs),
            indices: new Uint16Array(indices),
        };
    });
}


/***/ }),

/***/ "./src/tweakpane.ts":
/*!**************************!*\
  !*** ./src/tweakpane.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SETTINGS = exports.pane = void 0;
exports.init = init;
const tweakpane_1 = __webpack_require__(/*! tweakpane */ "./node_modules/tweakpane/dist/tweakpane.js");
exports.pane = new tweakpane_1.Pane({ title: 'Settings', expanded: true });
exports.SETTINGS = {
    camera_fov: 30.0,
    object_rotation_speed: 10.0,
    object_size: 0.4,
    benchmark_fps: 0.0,
    benchmark_loading_time: 0.0,
    source_github: 'https://github.com/Vahaz/WebGL-Learning'
};
function init() {
    // CAMERA
    const fCamera = exports.pane.addFolder({ title: 'Camera', expanded: false });
    fCamera.addBinding(exports.SETTINGS, 'camera_fov', {
        label: 'FOV',
        min: 30.0,
        max: 120.0,
        step: 5.0
    });
    // OBJECT
    const fObject = exports.pane.addFolder({ title: 'Object', expanded: false });
    fObject.addBinding(exports.SETTINGS, 'object_rotation_speed', {
        label: 'R. Speed',
        min: 0.0,
        max: 180.0,
        step: 1.0
    });
    fObject.addBinding(exports.SETTINGS, 'object_size', {
        label: 'Size',
        min: 0.1,
        max: 1.0,
        step: 0.1
    });
    // BENCHMARK
    const fBenchmark = exports.pane.addFolder({ title: 'Timers', expanded: true });
    fBenchmark.addBinding(exports.SETTINGS, 'benchmark_fps', {
        label: 'FPS',
        readonly: true,
        view: 'text',
        interval: 500
    });
    fBenchmark.addBinding(exports.SETTINGS, 'benchmark_loading_time', {
        label: 'Loading Time',
        readonly: true,
        format: (value) => {
            return value.toFixed(1) + 'ms';
        }
    });
    // SOURCE
    const fSource = exports.pane.addFolder({ title: 'Sources', expanded: false });
    fSource.addButton({ title: 'See Repo', label: 'Github' }).on('click', () => {
        window.open(exports.SETTINGS.source_github, '_blank');
    });
}
;


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
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkwebgl"] = self["webpackChunkwebgl"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["lib"], () => (__webpack_require__("./src/main.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7SUFDckYsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUMvQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsU0FBUztRQUNMLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckYsQ0FBQztJQUNELEtBQUssQ0FBQyxDQUFPO1FBQ1QsT0FBTyxJQUFJLElBQUksQ0FDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUM5QixDQUFDO0lBQ04sQ0FBQztJQUNELEdBQUcsQ0FBQyxDQUFPLElBQVksT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcs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LENBQUMsQ0FBQyxDQUFDO1FBRW5DLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQixDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBTSxDQUFDO1lBQ3pFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQU0sQ0FBQztZQUNuRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxH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V0FDQSw0Rzs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYmdsLy4vc3JjL2NsYXNzLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL2Z1bmN0aW9uLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL21haW4udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvb2JqTG9hZGVyLnRzIiwid2VicGFjazovL3dlYmdsLy4vc3JjL3R3ZWFrcGFuZS50cyIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIi8vXHJcbi8vIENMQVNTXHJcbi8vXHJcblxyXG5leHBvcnQgY2xhc3MgU2hhcGUge1xyXG4gICAgcHJpdmF0ZSBtYXRXb3JsZCA9IG5ldyBtYXQ0KCk7XHJcbiAgICBwcml2YXRlIHNjYWxlVmVjID0gbmV3IHZlYzMoKTtcclxuICAgIHByaXZhdGUgcm90YXRpb24gPSBuZXcgcXVhdCgpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICAgIHByaXZhdGUgcG9zOiB2ZWMzLFxyXG4gICAgICAgIHByaXZhdGUgc2NhbGU6IG51bWJlcixcclxuICAgICAgICBwcml2YXRlIHJvdGF0aW9uQXhpczogdmVjMyxcclxuICAgICAgICBwcml2YXRlIHJvdGF0aW9uQW5nbGU6IG51bWJlcixcclxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgdmFvOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0LFxyXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBudW1JbmRpY2VzOiBudW1iZXJcclxuICAgICkgeyB9XHJcblxyXG4gICAgcm90YXRlKGFuZ2xlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnJvdGF0aW9uQW5nbGUgPSB0aGlzLnJvdGF0aW9uQW5nbGUgKyBhbmdsZTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCBtYXRXb3JsZFVuaWZvcm06IFdlYkdMVW5pZm9ybUxvY2F0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbi5zZXRBeGlzQW5nbGUodGhpcy5yb3RhdGlvbkF4aXMsIHRoaXMucm90YXRpb25BbmdsZSk7XHJcbiAgICAgICAgdGhpcy5zY2FsZVZlYy5zZXQodGhpcy5zY2FsZSwgdGhpcy5zY2FsZSwgdGhpcy5zY2FsZSk7XHJcblxyXG4gICAgICAgIHRoaXMubWF0V29ybGQuc2V0RnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZSh0aGlzLnJvdGF0aW9uLCB0aGlzLnBvcywgdGhpcy5zY2FsZVZlYyk7XHJcblxyXG4gICAgICAgIGdsLnVuaWZvcm1NYXRyaXg0ZnYobWF0V29ybGRVbmlmb3JtLCBmYWxzZSwgdGhpcy5tYXRXb3JsZC5tYXQpO1xyXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh0aGlzLnZhbyk7XHJcbiAgICAgICAgZ2wuZHJhd0VsZW1lbnRzKGdsLlRSSUFOR0xFUywgdGhpcy5udW1JbmRpY2VzLCBnbC5VTlNJR05FRF9TSE9SVCwgMCk7XHJcbiAgICAgICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIHZlYzMge1xyXG4gICAgY29uc3RydWN0b3IocHVibGljIHg6IG51bWJlciA9IDAuMCwgcHVibGljIHk6IG51bWJlciA9IDAuMCwgcHVibGljIHo6IG51bWJlciA9IDAuMCkge31cclxuXHJcbiAgICBhZGQodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnksIHRoaXMueiArIHYueikgfVxyXG4gICAgc3VidHJhY3QodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnksIHRoaXMueiAtIHYueikgfVxyXG4gICAgbXVsdGlwbHkodjogdmVjMyk6IHZlYzMgeyByZXR1cm4gbmV3IHZlYzModGhpcy54ICogdi54LCB0aGlzLnkgKiB2LnksIHRoaXMueiAqIHYueikgfVxyXG4gICAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy56ID0gejtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIG5vcm1hbGl6ZSgpOiB2ZWMzIHtcclxuICAgICAgICBjb25zdCBsZW4gPSBNYXRoLmh5cG90KHRoaXMueCwgdGhpcy55LCB0aGlzLnopO1xyXG4gICAgICAgIHJldHVybiBsZW4gPiAwID8gbmV3IHZlYzModGhpcy54IC8gbGVuLCB0aGlzLnkgLyBsZW4sIHRoaXMueiAvIGxlbikgOiBuZXcgdmVjMygpO1xyXG4gICAgfVxyXG4gICAgY3Jvc3ModjogdmVjMyk6IHZlYzMge1xyXG4gICAgICAgIHJldHVybiBuZXcgdmVjMyhcclxuICAgICAgICAgICAgdGhpcy55ICogdi56IC0gdGhpcy56ICogdi55LFxyXG4gICAgICAgICAgICB0aGlzLnogKiB2LnggLSB0aGlzLnggKiB2LnosXHJcbiAgICAgICAgICAgIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueFxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbiAgICBkb3QodjogdmVjMyk6IG51bWJlciB7IHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2LnkgKyB0aGlzLnogKiB2LnogfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgcXVhdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihcclxuICAgICAgICBwdWJsaWMgeDogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgeTogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgejogbnVtYmVyID0gMCxcclxuICAgICAgICBwdWJsaWMgdzogbnVtYmVyID0gMVxyXG4gICAgKSB7fVxyXG5cclxuICAgIHNldEF4aXNBbmdsZShheGlzOiB2ZWMzLCBhbmdsZTogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3Qgbm9ybSA9IGF4aXMubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgaGFsZiA9IGFuZ2xlIC8gMjtcclxuICAgICAgICBjb25zdCBzID0gTWF0aC5zaW4oaGFsZik7XHJcblxyXG4gICAgICAgIHRoaXMueCA9IG5vcm0ueCAqIHM7XHJcbiAgICAgICAgdGhpcy55ID0gbm9ybS55ICogcztcclxuICAgICAgICB0aGlzLnogPSBub3JtLnogKiBzO1xyXG4gICAgICAgIHRoaXMudyA9IE1hdGguY29zKGhhbGYpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIG1hdDQge1xyXG4gICAgcHVibGljIG1hdDogRmxvYXQzMkFycmF5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubWF0ID0gbmV3IEZsb2F0MzJBcnJheSgxNik7XHJcbiAgICAgICAgdGhpcy5pZGVudGl0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGlkZW50aXR5KCk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hdDtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgIDEsIDAsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDEsIDAsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDEsIDAsXHJcbiAgICAgICAgICAgIDAsIDAsIDAsIDFcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBjb3B5RnJvbShtYXQ6IG1hdDQpOiB0aGlzIHtcclxuICAgICAgICB0aGlzLm1hdC5zZXQobWF0Lm1hdCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgeCwgIDAsICAwLCAwXHJcbiAgICAgKiAgMCwgIHksICAwLCAwXHJcbiAgICAgKiAgMCwgIDAsICB6LCAwXHJcbiAgICAgKiB0eCwgdHksIHR6LCAxXHJcbiAgICAgKi9cclxuICAgIG11bHRpcGx5KG90aGVyOiBtYXQ0KTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgYSA9IHRoaXMubWF0LCBiID0gb3RoZXIubWF0O1xyXG4gICAgICAgIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7ICsraSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDQ7ICsraikge1xyXG4gICAgICAgICAgICAgICAgb3V0W2ogKiA0ICsgaV0gPVxyXG4gICAgICAgICAgICAgICAgYVswICogNCArIGldICogYltqICogNCArIDBdICtcclxuICAgICAgICAgICAgICAgIGFbMSAqIDQgKyBpXSAqIGJbaiAqIDQgKyAxXSArXHJcbiAgICAgICAgICAgICAgICBhWzIgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMl0gK1xyXG4gICAgICAgICAgICAgICAgYVszICogNCArIGldICogYltqICogNCArIDNdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1hdC5zZXQob3V0KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGVyc3BlY3RpdmUgbWF0cmljZSwgdGhlIGZhY3RvciBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIHRhbiBvZiB0aGUgRk9WIGRpdmlkZWQgYnkgMjpcclxuICAgICAqIFdlIGhhdmUgdGhlIG5lYXIgcGxhbmUgYW5kIGZhciBwbGFuZS4gKG9iamVjdHMgYXJlIGRyYXduIGluIGJldHdlZW4pXHJcbiAgICAgKiBBc3BlY3QgaXMgdGhlIGFzcGVjdCByYXRpbywgbGlrZSAxNjo5IG9uIG1vc3Qgc2NyZWVucy5cclxuICAgICAqIFdlIGNoYW5nZSBlYWNoIHZlcnRpY2VzIHgsIHkgYW5kIHogYnkgdGhlIGZvbGxvd2luZzpcclxuICAgICAqIDAsIDAsICAwLCAgMFxyXG4gICAgICogMCwgNSwgIDAsICAwXHJcbiAgICAgKiAwLCAwLCAxMCwgMTFcclxuICAgICAqIDAsIDAsIDE0LCAxNVxyXG4gICAgICovXHJcbiAgICBzZXRQZXJzcGVjdGl2ZShmb3ZSYWQ6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBmID0gMS4wIC8gTWF0aC50YW4oZm92UmFkIC8gMik7XHJcbiAgICAgICAgY29uc3QgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hdDtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgIGYgLyBhc3BlY3QsICAgICAwLCAgICAgIDAsICAgICAgICAgICAgICAgICAgICAgICAwLFxyXG4gICAgICAgICAgICAwLCAgICAgICAgICAgICAgZiwgICAgICAwLCAgICAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgMCwgICAgICAgICAgICAgIDAsICAgICAgKGZhciArIG5lYXIpICogbmYsICAgICAgLTEsXHJcbiAgICAgICAgICAgIDAsICAgICAgICAgICAgICAwLCAgICAgIDIqZmFyKm5lYXIqbmYsICAgICAgICAgICAwXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TG9va0F0KGV5ZTogdmVjMywgY2VudGVyOiB2ZWMzLCB1cDogdmVjMyk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IHogPSBleWUuc3VidHJhY3QoY2VudGVyKS5ub3JtYWxpemUoKTtcclxuICAgICAgICBjb25zdCB4ID0gdXAuY3Jvc3Moeikubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgeSA9IHouY3Jvc3MoeCk7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubWF0O1xyXG4gICAgICAgIG0uc2V0KFtcclxuICAgICAgICAgICAgeC54LCAgICAgICAgICAgIHkueCwgICAgICAgICAgICB6LngsICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgeC55LCAgICAgICAgICAgIHkueSwgICAgICAgICAgICB6LnksICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgeC56LCAgICAgICAgICAgIHkueiwgICAgICAgICAgICB6LnosICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgLXguZG90KGV5ZSksICAgIC15LmRvdChleWUpLCAgICAtei5kb3QoZXllKSwgICAgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUocTogcXVhdCwgdjogdmVjMywgczogdmVjMyk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IHggPSBxLngsIHkgPSBxLnksIHogPSBxLnosIHcgPSBxLnc7XHJcbiAgICAgICAgY29uc3Qgc3ggPSBzLngsIHN5ID0gcy55LCBzeiA9IHMuejtcclxuXHJcbiAgICAgICAgY29uc3QgeDIgPSB4ICsgeCwgeTIgPSB5ICsgeSwgejIgPSB6ICsgejtcclxuICAgICAgICBjb25zdCB4eCA9IHggKiB4MiwgeHkgPSB4ICogeTIsIHh6ID0geCAqIHoyO1xyXG4gICAgICAgIGNvbnN0IHl5ID0geSAqIHkyLCB5eiA9IHkgKiB6MiwgenogPSB6ICogejI7XHJcbiAgICAgICAgY29uc3Qgd3ggPSB3ICogeDIsIHd5ID0gdyAqIHkyLCB3eiA9IHcgKiB6MjtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tYXQ7XHJcbiAgICAgICAgbS5zZXQoW1xyXG4gICAgICAgICAgICAoMSAtICh5eSArIHp6KSkgKiBzeCwgICAgICAgICAoeHkgKyB3eikgKiBzeCwgICAgICAgKHh6IC0gd3kpICogc3gsICAgICAwLFxyXG4gICAgICAgICAgICAoeHkgLSB3eikgKiBzeSwgICAoMSAtICh4eCArIHp6KSkgKiBzeSwgICAgICAgKHl6ICsgd3gpICogc3ksICAgICAwLFxyXG4gICAgICAgICAgICAoeHogKyB3eSkgKiBzeiwgICAgICAgICAoeXogLSB3eCkgKiBzeiwgKDEgLSAoeHggKyB5eSkpICogc3osICAgICAwLFxyXG4gICAgICAgICAgICB2LngsICAgICAgICAgICAgICAgICAgICB2LnksICAgICAgICAgICAgICAgICAgdi56LCAgICAgMVxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vXHJcbi8vIEZVTkNUSU9OXHJcbi8vXHJcblxyXG4vLyBEaXNwbGF5IGFuIGVycm9yIG1lc3NhZ2UgdG8gdGhlIEhUTUwgRWxlbWVudCB3aXRoIGlkIFwiZXJyb3JcIi5cclxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFcnJvcihtc2c6IHN0cmluZyA9IFwiTm8gRGF0YVwiKTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVycm9yXCIpO1xyXG4gICAgaWYoY29udGFpbmVyID09PSBudWxsKSByZXR1cm4gY29uc29sZS5sb2coXCJObyBFbGVtZW50IHdpdGggSUQ6IGVycm9yXCIpO1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcclxuICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gbXNnO1xyXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgY29uc29sZS5sb2cobXNnKTtcclxufVxyXG5cclxuLy8gR2V0IHNoYWRlcnMgc291cmNlIGNvZGUuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTaGFkZXJTb3VyY2UodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xyXG4gICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgbG9hZGluZyBzaGFkZXIgY29kZSBhdCBcIiR7dXJsfVwiOiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzcG9uc2UudGV4dCgpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SW1hZ2UodXJsOiBzdHJpbmcpOiBQcm9taXNlPEhUTUxJbWFnZUVsZW1lbnQ+IHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgaW1hZ2Uuc3JjID0gdXJsO1xyXG4gICAgICAgIGltYWdlLm9ubG9hZCA9ICgpID0+IHJlc29sdmUoaW1hZ2UpO1xyXG4gICAgfSlcclxufVxyXG5cclxuLy8gUmV0dXJuIHRoZSBXZWJHTCBDb250ZXh0IGZyb20gdGhlIENhbnZhcyBFbGVtZW50LlxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udGV4dChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KTogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCB7XHJcbiAgICByZXR1cm4gY2FudmFzLmdldENvbnRleHQoJ3dlYmdsMicpIGFzIFdlYkdMMlJlbmRlcmluZ0NvbnRleHQgO1xyXG59XHJcblxyXG4vLyBDb252ZXJ0IGZyb20gZGVncmVlcyB0byByYWRpYW50LlxyXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYW5nbGU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICByZXR1cm4gYW5nbGUgKiBNYXRoLlBJIC8gMTgwO1xyXG59XHJcblxyXG4vKiBDcmVhdGUgYSBXZWJHTCBCdWZmZXIgdHlwZS4gKE9wYXF1ZSBIYW5kbGUpXHJcbiAqIC0gU1RBVElDX0RSQVcgOiB3b24ndCB1cGRhdGUgb2Z0ZW4sIGJ1dCBvZnRlbiB1c2VkLlxyXG4gKiAtIEFSUkFZX0JVRkZFUiA6IGluZGljYXRlIHRoZSBwbGFjZSB0byBzdG9yZSB0aGUgQXJyYXkuXHJcbiAqIC0gRUxFTUVOVF9BUlJBWV9CVUZGRVIgOiBVc2VkIGZvciBpbmRpY2VzIHdpdGggY3ViZSBzaGFwZSBkcmF3aW5nLlxyXG4gKiBCaW5kIHRoZSBCdWZmZXIgdG8gdGhlIENQVSwgYWRkIHRoZSBBcnJheSB0byB0aGUgQnVmZmVyIGFuZCBDbGVhciBhZnRlciB1c2UuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3RhdGljQnVmZmVyKFxyXG4gICAgZ2w6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQsXHJcbiAgICBkYXRhOiBBcnJheUJ1ZmZlciB8IFVpbnQxNkFycmF5PEFycmF5QnVmZmVyTGlrZT4gfCBGbG9hdDMyQXJyYXk8QXJyYXlCdWZmZXJMaWtlPixcclxuICAgIGlzSW5kaWNlOiBib29sZWFuXHJcbik6IFdlYkdMQnVmZmVyIHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xyXG4gICAgY29uc3QgdHlwZSA9IChpc0luZGljZSA9PSB0cnVlKSA/IGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSIDogZ2wuQVJSQVlfQlVGRkVSXHJcbiAgICBpZighYnVmZmVyKSB7XHJcbiAgICAgICAgc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGFsbG9jYXRlIGJ1ZmZlciBzcGFjZVwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIGJ1ZmZlcik7XHJcbiAgICBnbC5idWZmZXJEYXRhKHR5cGUsIGRhdGEsIGdsLlNUQVRJQ19EUkFXKTtcclxuICAgIGdsLmJpbmRCdWZmZXIodHlwZSwgbnVsbCk7XHJcbiAgICByZXR1cm4gYnVmZmVyXHJcbn1cclxuXHJcbi8qIENyZWF0ZSB2ZXJ0ZXggYXJyYXkgb2JqZWN0IGJ1ZmZlcnMsIGl0IHJlYWRzIHRoZSB2ZXJ0aWNlcyBmcm9tIEdQVSBCdWZmZXIuXHJcbiAqIFRoZSB2ZXJ0ZXggYnVmZmVyIGNvbnRhaW5zIHRoZSB2ZXJ0aWNlcycgY29vcmRpbmF0ZXMgKGNhbiBhbHNvIGNvbnRhaW4gY29sb3IgYW5kIHNpemUpLlxyXG4gKiBUaGUgaW5kZXggYnVmZmVyIGNvbnRhaW5zIHdoaWNoIHZlcnRleCBuZWVkcyB0byBiZSBkcmF3biBvbiBzY2VuZSB0byBhdm9pZCBkdXBsaWNhdGUgdmVydGljZXMuXHJcbiAqIEluIGNhc2Ugb2YgY29sb3JzLCBhbiBvZmZzZXQgb2YgMyBmbG9hdHMgaXMgdXNlZCBlYWNoIHRpbWUgdG8gYXZvaWQgKHgsIHksIHopIGNvb3JkaW5hdGVzLlxyXG4gKiBUaGUgdmVydGV4IHNoYWRlciBwbGFjZXMgdGhlIHZlcnRpY2VzIGluIGNsaXAgc3BhY2UgYW5kIHRoZSBmcmFnbWVudCBzaGFkZXIgY29sb3JzIHRoZSBwaXhlbHMuIChEZWZhdWx0OiAwKVxyXG4gKiBWZXJ0ZXhBdHRyaWJQb2ludGVyIFtJbmRleCwgU2l6ZSwgVHlwZSwgSXNOb3JtYWxpemVkLCBTdHJpZGUsIE9mZnNldF1cclxuICogLSBJbmRleCAobG9jYXRpb24pXHJcbiAqIC0gU2l6ZSAoQ29tcG9uZW50IHBlciB2ZWN0b3IpXHJcbiAqIC0gVHlwZVxyXG4gKiAtIElzTm9ybWFsaXplZCAoaW50IHRvIGZsb2F0cywgZm9yIGNvbG9ycyB0cmFuc2Zvcm0gWzAsIDI1NV0gdG8gZmxvYXQgWzAsIDFdKVxyXG4gKiAtIFN0cmlkZSAoRGlzdGFuY2UgYmV0d2VlbiBlYWNoIHZlcnRleCBpbiB0aGUgYnVmZmVyKVxyXG4gKiAtIE9mZnNldCAoTnVtYmVyIG9mIHNraXBlZCBieXRlcyBiZWZvcmUgcmVhZGluZyBhdHRyaWJ1dGVzKVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVZBT0J1ZmZlcihcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgaW5kZXhCdWZmZXI6IFdlYkdMQnVmZmVyLCB1dkJ1ZmZlcjogV2ViR0xCdWZmZXIsXHJcbiAgICBwb3NBdHRyaWI6IG51bWJlciwgdXZBdHRyaWI6IG51bWJlclxyXG4pOiBXZWJHTFZlcnRleEFycmF5T2JqZWN0IHtcclxuICAgIGNvbnN0IHZhbyA9IGdsLmNyZWF0ZVZlcnRleEFycmF5KCk7XHJcbiAgICBpZighdmFvKSB7IHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBWQU8gYnVmZmVyLlwiKTsgcmV0dXJuIDA7IH1cclxuICAgIGdsLmJpbmRWZXJ0ZXhBcnJheSh2YW8pO1xyXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkocG9zQXR0cmliKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHV2QXR0cmliKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB2ZXJ0ZXhCdWZmZXIpO1xyXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwb3NBdHRyaWIsIDMsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7IC8vIGZvcm1hdDogKHgsIHksIHopIChhbGwgZjMyKVxyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHV2QnVmZmVyKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIodXZBdHRyaWIsIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBpbmRleEJ1ZmZlcik7XHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkobnVsbCk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIHJldHVybiB2YW87XHJcbn1cclxuXHJcbi8vIENyZWF0ZSBhIHByb2dyYW0gYW5kIGxpbmsgdGhlIHZlcnRleCBhbmQgZnJhZ21lbnQgc2hhZGVyIHNvdXJjZSBjb2RlIHRvIGl0LlxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJvZ3JhbShcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgdmVydGV4U2hhZGVyU3JjOiBzdHJpbmcsXHJcbiAgICBmcmFnbWVudFNoYWRlclNyYzogc3RyaW5nXHJcbik6IFdlYkdMUHJvZ3JhbSB7XHJcbiAgICBjb25zdCB2ZXJ0ZXhTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuVkVSVEVYX1NIQURFUikgYXMgV2ViR0xTaGFkZXI7XHJcbiAgICBjb25zdCBmcmFnbWVudFNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihnbC5GUkFHTUVOVF9TSEFERVIpIGFzIFdlYkdMU2hhZGVyO1xyXG4gICAgY29uc3QgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2UodmVydGV4U2hhZGVyLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcih2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcih2ZXJ0ZXhTaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0U2hhZGVySW5mb0xvZyh2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdsLnNoYWRlclNvdXJjZShmcmFnbWVudFNoYWRlciwgZnJhZ21lbnRTaGFkZXJTcmMpO1xyXG4gICAgZ2wuY29tcGlsZVNoYWRlcihmcmFnbWVudFNoYWRlcik7XHJcbiAgICBpZighZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZyYWdtZW50U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2coZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgICAgIHNob3dFcnJvcihlcnJvciB8fCBcIk5vIHNoYWRlciBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFByb2dyYW0gc2V0IHVwIGZvciBVbmlmb3Jtcy5cclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXhTaGFkZXIpO1xyXG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50U2hhZGVyKTtcclxuICAgIGdsLmxpbmtQcm9ncmFtKHByb2dyYW0pO1xyXG4gICAgaWYoIWdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBwcm9ncmFtIGRlYnVnIGxvZyBwcm92aWRlZC5cIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcHJvZ3JhbTtcclxufVxyXG5cclxuXHJcbi8qIENyZWF0ZSBhIFdlYkdMIHRleHR1cmUgYW5kIGJpbmQgaXQgdG8gYSBURVhUVVJFXzJEX0FSUkFZLlxyXG4gKiBTZXQgdGhlIHBhcmFtZXRlcnMgZm9yIHRoZSB0ZXh0dXJlcyBzdG9yYWdlLiAoVGFyZ2V0LCBNaXBtYXBfTGV2ZWxzLCBJbnRlcm5hbF9Gb3JtYXQsIFdpZHRoLCBIZWlnaHQsIEltYWdlc19Db3VudClcclxuICogRmxpcCB0aGUgb3JpZ2luIHBvaW50IG9mIFdlYkdMLiAoUE5HIGZvcm1hdCBzdGFydHMgYXQgdGhlIHRvcCBhbmQgV2ViR0wgYXQgdGhlIGJvdHRvbSlcclxuICogQmVjYXVzZSB0ZXhTdWJJbWFnZTNEIGlzIGFzeW5jLCB3YWl0aW5nIGZvciBlYWNoIGltYWdlIHRvIGxvYWQgaXMgc2xvdy4gU28sIHdlIHByZWxvYWQgYWxsIGltYWdlcyB1c2luZyBhIFByb21pc2UuXHJcbiAqIFNldCB0aGUgcGFyYW1ldGVycyBvbiBob3cgdG8gc3RvcmUgZWFjaCB0ZXh0dXJlLiAoVGFyZ2V0LCBNaXBtYXBfTGV2ZWwsIEludGVybmFsX0Zvcm1hdCwgV2lkdGgsIEhlaWdodCwgRGVwdGgsIEJvcmRlciwgRm9ybWF0LCBUeXBlLCBPZmZzZXQpXHJcbiAqIENoYW5nZSB0aGUgbWluaW11bSBhbmQgbWFnbml0dWRlIGZpbHRlcnMgd2hlbiBzY2FsaW5nIHVwIGFuZCBkb3duIHRleHR1cmVzLlxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRUZXh0dXJlKGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LCB0ZXh0dXJlczogc3RyaW5nW10pIHtcclxuICAgIGNvbnN0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XHJcbiAgICBnbC5iaW5kVGV4dHVyZShnbC5URVhUVVJFXzJEX0FSUkFZLCB0ZXh0dXJlKTtcclxuICAgIGdsLnRleFN0b3JhZ2UzRChnbC5URVhUVVJFXzJEX0FSUkFZLCAxLCBnbC5SR0JBOCwgMTI4LCAxMjgsIHRleHR1cmVzLmxlbmd0aCk7XHJcbiAgICBnbC5waXhlbFN0b3JlaShnbC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0cnVlKTtcclxuXHJcbiAgICBjb25zdCBpbWFnZXMgPSBhd2FpdCBQcm9taXNlLmFsbCh0ZXh0dXJlcy5tYXAoc3JjID0+IGdldEltYWdlKHNyYykpKTtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW1hZ2VzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgZ2wudGV4U3ViSW1hZ2UzRChnbC5URVhUVVJFXzJEX0FSUkFZLCAwLCAwLCAwLCBpLCAxMjgsIDEyOCwgMSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2VzW2ldKTtcclxuICAgIH1cclxuXHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUlOX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbiAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkRfQVJSQVksIGdsLlRFWFRVUkVfTUFHX0ZJTFRFUiwgZ2wuTkVBUkVTVCk7XHJcbn1cclxuIiwiaW1wb3J0ICogYXMgZm5jIGZyb20gXCIuL2Z1bmN0aW9uXCI7XHJcbmltcG9ydCAqIGFzIGNscyBmcm9tIFwiLi9jbGFzc1wiO1xyXG5pbXBvcnQgeyBsb2FkT0JKIH0gZnJvbSBcIi4vb2JqTG9hZGVyXCI7XHJcbmltcG9ydCAqIGFzIHR3ZWFrcGFuZSBmcm9tIFwiLi90d2Vha3BhbmVcIjtcclxuXHJcbi8vXHJcbi8vIE1BSU5cclxuLy9cclxuXHJcbmNvbnN0IFVQX1ZFQyA9IG5ldyBjbHMudmVjMygwLCAxLCAwKTtcclxuY29uc3QgVDAgPSBEYXRlLm5vdygpO1xyXG5jb25zdCBURVhUVVJFUyA9IFsgJy4vaW1nL2RpYW1vbmQucG5nJyBdO1xyXG5jb25zdCBTRVRUSU5HUyA9IHR3ZWFrcGFuZS5TRVRUSU5HUztcclxudHdlYWtwYW5lLmluaXQoKTtcclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG1haW4oKTogUHJvbWlzZTx2b2lkPiB7XHJcblxyXG4gICAgLy8gQ2FudmFzIEVsZW1lbnQgYW5kIFJlbmRlcmluZyBDb250ZXh0LlxyXG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ3ZWJnbC1jYW52YXNcIikgYXMgSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBjb25zdCBnbCA9IGZuYy5nZXRDb250ZXh0KGNhbnZhcyk7XHJcblxyXG4gICAgLy8gRmV0Y2ggc2hhZGVycyBjb2RlIGFuZCBsaW5rIHRoZW0gdG8gYSBwcm9ncmFtLlxyXG4gICAgY29uc3QgdmVydGV4U3JjID0gYXdhaXQgZm5jLmdldFNoYWRlclNvdXJjZSgnLi9zaGFkZXJzL3ZlcnRleF9zaGFkZXIudmVydCcpO1xyXG4gICAgY29uc3QgZnJhZ21lbnRTcmMgPSBhd2FpdCBmbmMuZ2V0U2hhZGVyU291cmNlKCcuL3NoYWRlcnMvZnJhZ21lbnRfc2hhZGVyLmZyYWcnKTtcclxuICAgIGNvbnN0IHByb2dyYW0gPSBmbmMuY3JlYXRlUHJvZ3JhbShnbCwgdmVydGV4U3JjLCBmcmFnbWVudFNyYyk7XHJcblxyXG4gICAgLy8gTG9hZCBhbGwgaW1hZ2VzLCBjcmVhdGUgYSBzdG9yYWdlLCBhbmQgc3RvcmUgZWFjaCBpbWFnZSBpbiBhIFRleHR1cmUgQXJyYXkuXHJcbiAgICBmbmMubG9hZFRleHR1cmUoZ2wsIFRFWFRVUkVTKTtcclxuXHJcbiAgICAvKiBHZXR0aW5nIHRoZSBhdHRyaWJ1dGVzIGZyb20gdGhlIHZlcnRleCBzaGFkZXIgZmlsZS5cclxuICAgICAqIEF0dHJpYnV0ZSBsb2NhdGlvbnMgY2FuIGJlIGZvcmNlZCBpbiB0aGUgdmVydGV4IHNoYWRlciBmaWxlIHdpdGggKGxvY2F0aW9uPW51bWJlcikuXHJcbiAgICAgKiBJZiBub3QgZm9yY2VkLCBXZWJHTCBnaXZlcyB0aGVtIGEgbnVtYmVyLCB5b3UgY2FuIGdldCB0aGlzIG51bWJlciB3aXRoIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkuXHJcbiAgICAgKiBIZXJlLCBiZWNhdXNlIHdlIHNldCBtYW51YWxseSB0aGUgYXR0cmlidXRlIGxvY2F0aW9uIGluIHRoZSB2ZXJ0ZXggc2hhZGVyLFxyXG4gICAgICogV2UgY2FuIHJlcGxhY2UgZ2wuZ2V0QXR0cmliTG9jYXRpb24oKSB3aXRoIHRoZSAobG9jYXRpb249bnVtYmVyKSBudW1iZXIuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0IHBvc2l0aW9uQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ3ZlcnRleFBvc2l0aW9uJyk7IC8vIGxvY2F0aW9uID0gMFxyXG4gICAgY29uc3QgdXZBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYVVWJyk7IC8vIGxvY2F0aW9uID0gMVxyXG4gICAgY29uc3QgZGVwdGhBdHRyaWJ1dGUgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCAnYURlcHRoJyk7IC8vIGxvY2F0aW9uID0gMlxyXG5cclxuICAgIC8vIFdlIGNhbm5vdCBzcGVjaWZ5IFVuaWZvcm1zIGxvY2F0aW9ucyBtYW51YWxseS4gV2UgbmVlZCB0byBnZXQgdGhlbSB1c2luZyAnZ2V0VW5pZm9ybUxvY2F0aW9uJy5cclxuICAgIGNvbnN0IG1hdFdvcmxkVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAnbWF0V29ybGQnKSBhcyBXZWJHTFVuaWZvcm1Mb2NhdGlvbjtcclxuICAgIGNvbnN0IG1hdFZpZXdQcm9qVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAnbWF0Vmlld1Byb2onKSBhcyBXZWJHTFVuaWZvcm1Mb2NhdGlvbjtcclxuICAgIGNvbnN0IHNhbXBsZXJVbmlmb3JtID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sICd1U2FtcGxlcicpIGFzIFdlYkdMVW5pZm9ybUxvY2F0aW9uO1xyXG5cclxuICAgIC8vIFR5cGVzY3JpcHQgd2FudHMgdG8gdmVyaWZ5IGlmIHRoZSB2YXJpYWJsZXMgYXJlIHNldCwgbm90IHRoZSBiZXN0IHdheSB0byBkbyBpdC5cclxuICAgIGlmKHBvc2l0aW9uQXR0cmlidXRlIDwgMCB8fCB1dkF0dHJpYnV0ZSA8IDAgfHwgZGVwdGhBdHRyaWJ1dGUgPCAwIHx8ICFtYXRXb3JsZFVuaWZvcm0gfHwgIW1hdFZpZXdQcm9qVW5pZm9ybSB8fCAhc2FtcGxlclVuaWZvcm0pIHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBGYWlsZWQgdG8gZ2V0IGF0dHJpYnMvdW5pZm9ybXMgKE1heDogJHtnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1ZFUlRFWF9BVFRSSUJTKX0pOiBgICtcclxuICAgICAgICAgICAgYCBwb3M9JHtwb3NpdGlvbkF0dHJpYnV0ZX1gICtcclxuICAgICAgICAgICAgYCB1dj0ke3V2QXR0cmlidXRlfWAgK1xyXG4gICAgICAgICAgICBgIGRlcHRoPSR7ZGVwdGhBdHRyaWJ1dGV9YCArXHJcbiAgICAgICAgICAgIGAgbWF0V29ybGQ9JHshIW1hdFdvcmxkVW5pZm9ybX1gICtcclxuICAgICAgICAgICAgYCBtYXRWaWV3UHJvaj0keyEhbWF0Vmlld1Byb2pVbmlmb3JtfWAgK1xyXG4gICAgICAgICAgICBgIHNhbXBsZXI9JHshIXNhbXBsZXJVbmlmb3JtfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDb250cm9sIHRoZSBkZXB0aCBvZiB0aGUgdGV4dHVyZSBhcnJheS4gUGlja2luZyBvdXIgZGlzcGxheWVkIHRleHR1cmUuXHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWIxZihkZXB0aEF0dHJpYnV0ZSwgMSk7XHJcblxyXG4gICAgY29uc3QgbW9kZWwgPSBhd2FpdCBsb2FkT0JKKCcuL21vZGVscy9kaWFtb25kLm9iaicpO1xyXG5cclxuICAgIGNvbnN0IG1vZGVsVmVydGV4QnVmZmVyID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgbW9kZWwudmVydGljZXMsIGZhbHNlKTtcclxuICAgIGNvbnN0IG1vZGVsSW5kZXhCdWZmZXIgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBtb2RlbC5pbmRpY2VzLCB0cnVlKTtcclxuICAgIGNvbnN0IG1vZGVsVVZCdWZmZXIgPSBmbmMuY3JlYXRlU3RhdGljQnVmZmVyKGdsLCBtb2RlbC51dnMsIGZhbHNlKTtcclxuXHJcbiAgICBjb25zdCBtb2RlbFZBTyA9IGZuYy5jcmVhdGVWQU9CdWZmZXIoXHJcbiAgICAgICAgZ2wsXHJcbiAgICAgICAgbW9kZWxWZXJ0ZXhCdWZmZXIsXHJcbiAgICAgICAgbW9kZWxJbmRleEJ1ZmZlcixcclxuICAgICAgICBtb2RlbFVWQnVmZmVyLFxyXG4gICAgICAgIHBvc2l0aW9uQXR0cmlidXRlLFxyXG4gICAgICAgIHV2QXR0cmlidXRlXHJcbiAgICApO1xyXG5cclxuICAgIGxldCBtYXRWaWV3ID0gbmV3IGNscy5tYXQ0KCk7XHJcbiAgICBsZXQgbWF0UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xyXG4gICAgbGV0IG1hdFZpZXdQcm9qID0gbmV3IGNscy5tYXQ0KCk7XHJcblxyXG4gICAgbGV0IGNhbWVyYUFuZ2xlID0gMDtcclxuICAgIC8qIEFkZCBhIGZ1bmN0aW9uIHRvIGNhbGwgaXQgZWFjaCBmcmFtZS5cclxuICAgICAqIC0gT3V0cHV0IE1lcmdlcjogTWVyZ2UgdGhlIHNoYWRlZCBwaXhlbCBmcmFnbWVudCB3aXRoIHRoZSBleGlzdGluZyByZXN1bHQgaW1hZ2UuXHJcbiAgICAgKiAtIFJhc3Rlcml6ZXI6IFdpY2ggcGl4ZWxzIGFyZSBwYXJ0IG9mIHRoZSBWZXJ0aWNlcyArIFdpY2ggcGFydCB0aGF0IG1vZGlmaWVkIGJ5IFdlYkdMLlxyXG4gICAgICogLSBHUFUgUHJvZ3JhbTogUGFpciBWZXJ0ZXggJiBGcmFnbWVudCBzaGFkZXJzLlxyXG4gICAgICogLSBTZXQgVW5pZm9ybXMgKGNhbiBiZSBzZXQgYW55d2hlcmUpXHJcbiAgICAgKiAtIERyYXcgQ2FsbHMgKHcvIFByaW1pdGl2ZSBhc3NlbWJseSArIGZvciBsb29wKVxyXG4gICAgICovXHJcbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgIGNvbnN0IGZyYW1lID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBkdCAoZGVsdGEgdGltZSkgd2l0aCB0aW1lIHNwZW50IGluIHNlY29uZHMgYmV0d2VlbiBlYWNoIGZyYW1lLlxyXG4gICAgICAgIGNvbnN0IHRoaXNGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBjb25zdCBkdCA9ICh0aGlzRnJhbWVUaW1lIC0gbGFzdEZyYW1lVGltZSkgLyAxMDAwO1xyXG4gICAgICAgIGxhc3RGcmFtZVRpbWUgPSB0aGlzRnJhbWVUaW1lO1xyXG5cclxuICAgICAgICAvLyBTdG9yZSBvdXIgY3ViZXMsIGRyYXcgdGhlbSBlYWNoIHRpbWUuIChhIGxvdCBvZiBkcmF3IGNhbGxzKVxyXG4gICAgICAgIGNvbnN0IGN1YmVzOiBjbHMuU2hhcGVbXSA9IFtdO1xyXG4gICAgICAgIGN1YmVzLnB1c2gobmV3IGNscy5TaGFwZShcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDAsIDApLFxyXG4gICAgICAgICAgICBTRVRUSU5HUy5vYmplY3Rfc2l6ZSxcclxuICAgICAgICAgICAgVVBfVkVDLFxyXG4gICAgICAgICAgICBmbmMudG9SYWRpYW4oMCksXHJcbiAgICAgICAgICAgIG1vZGVsVkFPLFxyXG4gICAgICAgICAgICBtb2RlbC5pbmRpY2VzLmxlbmd0aFxyXG4gICAgICAgICkpO1xyXG5cclxuICAgICAgICAvLyBFYWNoIGZyYW1lIGFkZHMgMTDCsCB0byB0aGUgY2FtZXJhIGFuZ2xlLlxyXG4gICAgICAgIC8vIGNhbWVyYUFuZ2xlICs9IGR0ICogZm5jLnRvUmFkaWFuKDEwKTtcclxuXHJcbiAgICAgICAgLy8gRml4ZWQgY2FtZXJhIGNvb3JkaW5hdGVzLlxyXG4gICAgICAgIGNvbnN0IGNhbWVyYVggPSAzICogTWF0aC5zaW4oY2FtZXJhQW5nbGUpO1xyXG4gICAgICAgIGNvbnN0IGNhbWVyYVogPSAzICogTWF0aC5jb3MoY2FtZXJhQW5nbGUpO1xyXG5cclxuICAgICAgICAvLyBNYWtlIHRoZSAnY2FtZXJhJyBsb29rIGF0IHRoZSBjZW50ZXIuXHJcbiAgICAgICAgbWF0Vmlldy5zZXRMb29rQXQoXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMyhjYW1lcmFYLCAtLjI1LCBjYW1lcmFaKSxcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDAsIDApLFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoMCwgMSwgMClcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIFNldCB0aGUgY2FtZXJhIEZPViwgc2NyZWVuIHNpemUsIGFuZCB2aWV3IGRpc3RhbmNlLlxyXG4gICAgICAgIG1hdFByb2ouc2V0UGVyc3BlY3RpdmUoXHJcbiAgICAgICAgICAgIGZuYy50b1JhZGlhbihTRVRUSU5HUy5jYW1lcmFfZm92KSwgLy8gRk9WXHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCAvIGNhbnZhcy5oZWlnaHQsIC8vIEFTUEVDVCBSQVRJT1xyXG4gICAgICAgICAgICAwLjEsIDEwMC4wIC8vIFotTkVBUiAvIFotRkFSXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gR0xNOiBtYXRWaWV3UHJvaiA9IG1hdFByb2ogKiBtYXRWaWV3XHJcbiAgICAgICAgbWF0Vmlld1Byb2ogPSBtYXRQcm9qLm11bHRpcGx5KG1hdFZpZXcpO1xyXG5cclxuICAgICAgICAvLyBSZW5kZXJcclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpbztcclxuXHJcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAyLCAwLjAyLCAwLjAyLCAxKTtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xyXG4gICAgICAgIGdsLmZyb250RmFjZShnbC5DQ1cpO1xyXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRWaWV3UHJvalVuaWZvcm0sIGZhbHNlLCBtYXRWaWV3UHJvai5tYXQpO1xyXG5cclxuXHJcbiAgICAgICAgY3ViZXMuZm9yRWFjaCgoY3ViZSkgPT4ge1xyXG4gICAgICAgICAgICBjdWJlLnJvdGF0ZShkdCAqIGZuYy50b1JhZGlhbihTRVRUSU5HUy5vYmplY3Rfcm90YXRpb25fc3BlZWQpKTtcclxuICAgICAgICAgICAgY3ViZS5kcmF3KGdsLCBtYXRXb3JsZFVuaWZvcm0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBkdCBpcyB0aGUgdGltZSBzcGVudCBiZXR3ZWVuIGVhY2ggaW1hZ2UuXHJcbiAgICAgICAgLy8gZnBzIGlzIGEgZnJlcXVlbmN5LCBpdCdzIHRoZSBpbnZlcnQgb2YgZHQuXHJcbiAgICAgICAgU0VUVElOR1MuYmVuY2htYXJrX2ZwcyA9IE1hdGguY2VpbCgxIC8gZHQpO1xyXG5cclxuICAgICAgICAvLyBMb29wIGNhbGxzLCBlYWNoIHRpbWUgdGhlIGRyYXdpbmcgaXMgcmVhZHkuXHJcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxuICAgIH07XHJcbiAgICAvLyBGaXJzdCBjYWxsLCBhcyBzb29uIGFzIHRoZSBwYWdlIGlzIGxvYWRlZC5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XHJcbiAgICBTRVRUSU5HUy5iZW5jaG1hcmtfbG9hZGluZ190aW1lID0gRGF0ZS5ub3coKSAtIFQwO1xyXG59XHJcblxyXG5cclxuXHJcbnRyeSB7XHJcbiAgICBtYWluKCkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgZm5jLnNob3dFcnJvcihcIk5vIEVycm9ycyEg8J+MnlwiKTtcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goKGUpID0+IHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKGBVbmNhdWdodCBhc3luYyBleGNlcHRpb246ICR7ZX1gKTtcclxuICAgIH0pXHJcbn0gY2F0Y2goZSkge1xyXG4gICAgZm5jLnNob3dFcnJvcihgVW5jYXVnaHQgc3luY2hyb25vdXMgZXhjZXB0aW9uOiAke2V9YCk7XHJcbn1cclxuIiwiZXhwb3J0IGludGVyZmFjZSBPYmpNZXNoIHtcclxuICAgIHZlcnRpY2VzOiBGbG9hdDMyQXJyYXk7XHJcbiAgICBpbmRpY2VzOiBVaW50MTZBcnJheTtcclxuICAgIHV2czogRmxvYXQzMkFycmF5O1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZE9CSih1cmw6IHN0cmluZyk6IFByb21pc2U8T2JqTWVzaD4ge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xyXG4gICAgY29uc3QgdGV4dCA9IGF3YWl0IHJlc3BvbnNlLnRleHQoKTtcclxuICAgIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdChcIlxcblwiKTtcclxuXHJcbiAgICBjb25zdCBwb3NpdGlvbnM6IG51bWJlcltdID0gW107XHJcbiAgICBjb25zdCB1dnM6IG51bWJlcltdID0gW107XHJcbiAgICBjb25zdCBpbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgY29uc3QgZmluYWxWZXJ0aWNlczogbnVtYmVyW10gPSBbXTtcclxuICAgIGNvbnN0IGZpbmFsVVZzOiBudW1iZXJbXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0IHVuaXF1ZVZlcnRpY2VzID0gbmV3IE1hcDxzdHJpbmcsIG51bWJlcj4oKTtcclxuICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XHJcbiAgICAgICAgY29uc3QgcGFydHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgIGlmIChwYXJ0c1swXSA9PT0gJ3YnKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLnBhcnRzLnNsaWNlKDEpLm1hcChOdW1iZXIpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcnRzWzBdID09PSAndnQnKSB7XHJcbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLnBhcnRzLnNsaWNlKDEpLm1hcChOdW1iZXIpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHBhcnRzWzBdID09PSAnZicpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBwYXJ0c1tpXTtcclxuICAgICAgICAgICAgICAgIGlmICghdW5pcXVlVmVydGljZXMuaGFzKGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBbdkluZGV4LCB2dEluZGV4XSA9IGtleS5zcGxpdCgnLycpLm1hcChpZHggPT4gcGFyc2VJbnQoaWR4KSAtIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbmFsVmVydGljZXMucHVzaChcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zW3ZJbmRleCAqIDNdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnNbdkluZGV4ICogMyArIDFdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnNbdkluZGV4ICogMyArIDJdXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICBmaW5hbFVWcy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1dnNbdnRJbmRleCAqIDJdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1dnNbdnRJbmRleCAqIDIgKyAxXVxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5pcXVlVmVydGljZXMuc2V0KGtleSwgaW5kZXgrKyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2godW5pcXVlVmVydGljZXMuZ2V0KGtleSkhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KGZpbmFsVmVydGljZXMpLFxyXG4gICAgICAgIHV2czogbmV3IEZsb2F0MzJBcnJheShmaW5hbFVWcyksXHJcbiAgICAgICAgaW5kaWNlczogbmV3IFVpbnQxNkFycmF5KGluZGljZXMpLFxyXG4gICAgfTtcclxufVxyXG4iLCJpbXBvcnQgeyBQYW5lIH0gZnJvbSAndHdlYWtwYW5lJztcclxuXHJcbmV4cG9ydCBjb25zdCBwYW5lID0gbmV3IFBhbmUoe3RpdGxlOiAnU2V0dGluZ3MnLCBleHBhbmRlZDogdHJ1ZX0pO1xyXG5cclxuZXhwb3J0IGNvbnN0IFNFVFRJTkdTID0ge1xyXG5cclxuICAgIGNhbWVyYV9mb3Y6IDMwLjAsXHJcblxyXG4gICAgb2JqZWN0X3JvdGF0aW9uX3NwZWVkOiAxMC4wLFxyXG4gICAgb2JqZWN0X3NpemU6IDAuNCxcclxuXHJcbiAgICBiZW5jaG1hcmtfZnBzOiAwLjAsXHJcbiAgICBiZW5jaG1hcmtfbG9hZGluZ190aW1lOiAwLjAsXHJcblxyXG4gICAgc291cmNlX2dpdGh1YjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9WYWhhei9XZWJHTC1MZWFybmluZydcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0KCkge1xyXG5cclxuICAgIC8vIENBTUVSQVxyXG5cclxuICAgIGNvbnN0IGZDYW1lcmEgPSBwYW5lLmFkZEZvbGRlcih7dGl0bGU6ICdDYW1lcmEnLCBleHBhbmRlZDogZmFsc2V9KTtcclxuXHJcbiAgICBmQ2FtZXJhLmFkZEJpbmRpbmcoU0VUVElOR1MsICdjYW1lcmFfZm92Jywge1xyXG4gICAgICAgIGxhYmVsOiAnRk9WJyxcclxuICAgICAgICBtaW46IDMwLjAsXHJcbiAgICAgICAgbWF4OiAxMjAuMCxcclxuICAgICAgICBzdGVwOiA1LjBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIE9CSkVDVFxyXG5cclxuICAgIGNvbnN0IGZPYmplY3QgPSBwYW5lLmFkZEZvbGRlcih7dGl0bGU6ICdPYmplY3QnLCBleHBhbmRlZDogZmFsc2V9KTtcclxuXHJcbiAgICBmT2JqZWN0LmFkZEJpbmRpbmcoU0VUVElOR1MsICdvYmplY3Rfcm90YXRpb25fc3BlZWQnLCB7XHJcbiAgICAgICAgbGFiZWw6ICdSLiBTcGVlZCcsXHJcbiAgICAgICAgbWluOiAwLjAsXHJcbiAgICAgICAgbWF4OiAxODAuMCxcclxuICAgICAgICBzdGVwOiAxLjBcclxuICAgIH0pO1xyXG5cclxuICAgIGZPYmplY3QuYWRkQmluZGluZyhTRVRUSU5HUywgJ29iamVjdF9zaXplJywge1xyXG4gICAgICAgIGxhYmVsOiAnU2l6ZScsXHJcbiAgICAgICAgbWluOiAwLjEsXHJcbiAgICAgICAgbWF4OiAxLjAsXHJcbiAgICAgICAgc3RlcDogMC4xXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBCRU5DSE1BUktcclxuXHJcbiAgICBjb25zdCBmQmVuY2htYXJrID0gcGFuZS5hZGRGb2xkZXIoe3RpdGxlOiAnVGltZXJzJywgZXhwYW5kZWQ6IHRydWV9KTtcclxuXHJcbiAgICBmQmVuY2htYXJrLmFkZEJpbmRpbmcoU0VUVElOR1MsICdiZW5jaG1hcmtfZnBzJywge1xyXG4gICAgICAgIGxhYmVsOiAnRlBTJyxcclxuICAgICAgICByZWFkb25seTogdHJ1ZSxcclxuICAgICAgICB2aWV3OiAndGV4dCcsXHJcbiAgICAgICAgaW50ZXJ2YWw6IDUwMFxyXG4gICAgfSk7XHJcblxyXG4gICAgZkJlbmNobWFyay5hZGRCaW5kaW5nKFNFVFRJTkdTLCAnYmVuY2htYXJrX2xvYWRpbmdfdGltZScsIHtcclxuICAgICAgICBsYWJlbDogJ0xvYWRpbmcgVGltZScsXHJcbiAgICAgICAgcmVhZG9ubHk6IHRydWUsXHJcbiAgICAgICAgZm9ybWF0OiAodmFsdWU6IG51bWJlcik6IHN0cmluZyA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0ZpeGVkKDEpICsgJ21zJztcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTT1VSQ0VcclxuXHJcbiAgICBjb25zdCBmU291cmNlID0gcGFuZS5hZGRGb2xkZXIoe3RpdGxlOiAnU291cmNlcycsIGV4cGFuZGVkOiBmYWxzZX0pO1xyXG5cclxuICAgIGZTb3VyY2UuYWRkQnV0dG9uKHt0aXRsZTogJ1NlZSBSZXBvJywgbGFiZWw6ICdHaXRodWInfSkub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHdpbmRvdy5vcGVuKFNFVFRJTkdTLnNvdXJjZV9naXRodWIsICdfYmxhbmsnKTtcclxuICAgIH0pO1xyXG59O1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldID0gZGVmZXJyZWRbaV07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJtYWluXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgW2NodW5rSWRzLCBtb3JlTW9kdWxlcywgcnVudGltZV0gPSBkYXRhO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua3dlYmdsXCJdID0gc2VsZltcIndlYnBhY2tDaHVua3dlYmdsXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJsaWJcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zcmMvbWFpbi50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==