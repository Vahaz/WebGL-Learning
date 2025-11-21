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
        // Store our cubes, draw them each time. (a lot of draw calls)
        const cubes = [];
        cubes.push(new cls.Shape(new cls.vec3(0, 0, 0), SETTINGS.object_size, UP_VEC, fnc.toRadian(0), modelVAO, model.indices.length));
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
                cube.scale = SETTINGS.object_size;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7SUFDckYsR0FBRyxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztRQUMvQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsU0FBUztRQUNMLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7SUFDckYsQ0FBQztJQUNELEtBQUssQ0FBQyxDQUFPO1FBQ1QsT0FBTyxJQUFJLElBQUksQ0FDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUM5QixDQUFDO0lBQ04sQ0FBQztJQUNELEdBQUcsQ0FBQyxDQUFPLElBQVksT0FBTyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcs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LENBQUMsQ0FBQyxDQUFDO1FBRW5DLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNuQixDQUFDLENBQUMsR0FBRyxDQUFDO1lBQ0YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBTSxDQUFDO1lBQ3pFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQU0sQ0FBQztZQUNuRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFNLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUMsRUFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBbUIsQ0FBQyxDQUFDLENBQUMsRUFBTSxDQUFDO1NBQzNELENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQXZHRCxvQkF1R0M7Ozs7Ozs7Ozs7OztBQzNMRCxFQUFFO0FBQ0YsV0FBVztBQUNYLEVBQUU7Ozs7Ozs7Ozs7O0FBR0YsOEJBT0M7QUFHRCwwQ0FNQztBQUVELDRCQU1DO0FBR0QsZ0NBRUM7QUFHRCw0QkFFQztBQVFELGdEQWdCQztBQWVELDBDQW9CQztBQUdELHNDQW1DQztBQVVELGtDQWFDO0FBM0pELGdFQUFnRTtBQUNoRSxTQUFnQixTQUFTLENBQUMsTUFBYyxTQUFTO0lBQzdDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkQsSUFBRyxTQUFTLEtBQUssSUFBSTtRQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0lBQ3ZFLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUM7SUFDeEIsU0FBUyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsU0FBc0IsZUFBZSxDQUFDLEdBQVc7O1FBQzdDLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxHQUFHLE1BQU0sUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQztRQUNELE9BQU8sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FBQTtBQUVELFNBQXNCLFFBQVEsQ0FBQyxHQUFXOztRQUN0QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7WUFDM0IsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUMxQixLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUNoQixLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QyxDQUFDLENBQUM7SUFDTixDQUFDO0NBQUE7QUFFRCxvREFBb0Q7QUFDcEQsU0FBZ0IsVUFBVSxDQUFDLE1BQXlCO0lBQ2hELE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQTJCLENBQUU7QUFDbEUsQ0FBQztBQUVELG1DQUFtQztBQUNuQyxTQUFnQixRQUFRLENBQUMsS0FBYTtJQUNsQyxPQUFPLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNqQyxDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixrQkFBa0IsQ0FDOUIsRUFBMEIsRUFDMUIsSUFBZ0YsRUFDaEYsUUFBaUI7SUFFakIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2pDLE1BQU0sSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxZQUFZO0lBQzNFLElBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNULFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVELEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUIsT0FBTyxNQUFNO0FBQ2pCLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSCxTQUFnQixlQUFlLENBQzNCLEVBQTBCLEVBQzFCLFlBQXlCLEVBQUUsV0FBd0IsRUFBRSxRQUFxQixFQUMxRSxTQUFpQixFQUFFLFFBQWdCO0lBRW5DLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ25DLElBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUFDLFNBQVMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1FBQUMsT0FBTyxDQUFDLENBQUM7SUFBQyxDQUFDO0lBQ25FLEVBQUUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDeEIsRUFBRSxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDN0MsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsOEJBQThCO0lBQzNGLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDekMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzNELEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNwRCxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pCLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQUVELDhFQUE4RTtBQUM5RSxTQUFnQixhQUFhLENBQ3pCLEVBQTBCLEVBQzFCLGVBQXVCLEVBQ3ZCLGlCQUF5QjtJQUV6QixNQUFNLFlBQVksR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQWdCLENBQUM7SUFDdEUsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFnQixDQUFDO0lBQzFFLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUVuQyxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztJQUMvQyxFQUFFLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9CLElBQUcsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1FBQ3pELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNoRCxTQUFTLENBQUMsS0FBSyxJQUFJLCtCQUErQixDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQsRUFBRSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUNuRCxFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2pDLElBQUcsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1FBQzNELE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNsRCxTQUFTLENBQUMsS0FBSyxJQUFJLCtCQUErQixDQUFDLENBQUM7UUFDcEQsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQsK0JBQStCO0lBQy9CLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3ZDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3pDLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsSUFBRyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDbEQsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLFNBQVMsQ0FBQyxLQUFLLElBQUksZ0NBQWdDLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7SUFDRCxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBR0Q7Ozs7OztHQU1HO0FBQ0gsU0FBc0IsV0FBVyxDQUFDLEVBQTBCLEVBQUUsUUFBa0I7O1FBQzVFLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNuQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3RSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUU3QyxNQUFNLE1BQU0sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNyQyxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pHLENBQUM7UUFFRCxFQUFFLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0UsQ0FBQztDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0pELHVFQUFrQztBQUNsQyxpRUFBK0I7QUFDL0IsaUZBQXNDO0FBQ3RDLCtFQUF5QztBQUV6QyxFQUFFO0FBQ0YsT0FBTztBQUNQLEVBQUU7QUFFRixNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBTSxRQUFRLEdBQUcsQ0FBRSxtQkFBbUIsQ0FBRSxDQUFDO0FBQ3pDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFDcEMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0FBRWpCLFNBQWUsSUFBSTs7UUFFZix3Q0FBd0M7UUFDeEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQXNCLENBQUM7UUFDNUUsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVsQyxpREFBaUQ7UUFDakQsTUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLENBQUMsZUFBZSxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDNUUsTUFBTSxXQUFXLEdBQUcsTUFBTSxHQUFHLENBQUMsZUFBZSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDaEYsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTlELDhFQUE4RTtRQUM5RSxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUU5Qjs7Ozs7V0FLRztRQUNILE1BQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsZUFBZTtRQUMxRixNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsZUFBZTtRQUN6RSxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZTtRQUUvRSxpR0FBaUc7UUFDakcsTUFBTSxlQUFlLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxVQUFVLENBQXlCLENBQUM7UUFDM0YsTUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBeUIsQ0FBQztRQUNqRyxNQUFNLGNBQWMsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBeUIsQ0FBQztRQUUxRixrRkFBa0Y7UUFDbEYsSUFBRyxpQkFBaUIsR0FBRyxDQUFDLElBQUksV0FBVyxHQUFHLENBQUMsSUFBSSxjQUFjLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM5SCxHQUFHLENBQUMsU0FBUyxDQUFDLHdDQUF3QyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLO2dCQUM3RixRQUFRLGlCQUFpQixFQUFFO2dCQUMzQixPQUFPLFdBQVcsRUFBRTtnQkFDcEIsVUFBVSxjQUFjLEVBQUU7Z0JBQzFCLGFBQWEsQ0FBQyxDQUFDLGVBQWUsRUFBRTtnQkFDaEMsZ0JBQWdCLENBQUMsQ0FBQyxrQkFBa0IsRUFBRTtnQkFDdEMsWUFBWSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQ2pDLENBQUM7WUFDRixPQUFPO1FBQ1gsQ0FBQztRQUVELHlFQUF5RTtRQUN6RSxFQUFFLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVyQyxNQUFNLEtBQUssR0FBRyxNQUFNLHVCQUFPLEVBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUVwRCxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RSxNQUFNLGdCQUFnQixHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN6RSxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFbkUsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FDaEMsRUFBRSxFQUNGLGlCQUFpQixFQUNqQixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLGlCQUFpQixFQUNqQixXQUFXLENBQ2QsQ0FBQztRQUVGLDhEQUE4RDtRQUM5RCxNQUFNLEtBQUssR0FBZ0IsRUFBRSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUNwQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDckIsUUFBUSxDQUFDLFdBQVcsRUFDcEIsTUFBTSxFQUNOLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQ2YsUUFBUSxFQUNSLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUN2QixDQUFDLENBQUM7UUFFSCxJQUFJLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM3QixJQUFJLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVqQyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDcEI7Ozs7OztXQU1HO1FBQ0gsSUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXRDLE1BQU0sS0FBSyxHQUFHLEdBQVMsRUFBRTtZQUNyQiwyRUFBMkU7WUFDM0UsTUFBTSxhQUFhLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sRUFBRSxHQUFHLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNsRCxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBRTlCLDJDQUEyQztZQUMzQyx3Q0FBd0M7WUFFeEMsNEJBQTRCO1lBQzVCLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTFDLHdDQUF3QztZQUN4QyxPQUFPLENBQUMsU0FBUyxDQUNiLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEVBQ3BDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNyQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDeEIsQ0FBQztZQUNGLHNEQUFzRDtZQUN0RCxPQUFPLENBQUMsY0FBYyxDQUNsQixHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRSxNQUFNO1lBQ3pDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxlQUFlO1lBQzdDLEdBQUcsRUFBRSxLQUFLLENBQUMsaUJBQWlCO2FBQy9CLENBQUM7WUFFRix1Q0FBdUM7WUFDdkMsV0FBVyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFeEMsU0FBUztZQUNULE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQztZQUNyRCxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxZQUFZLEdBQUcsZ0JBQWdCLENBQUM7WUFFdkQsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRCxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QixFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFL0MsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QixFQUFFLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUdoRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDO2dCQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUVILDJDQUEyQztZQUMzQyw2Q0FBNkM7WUFDN0MsUUFBUSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUUzQyw4Q0FBOEM7WUFDOUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsQ0FBQyxFQUFDO1FBQ0YsNkNBQTZDO1FBQzdDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLFFBQVEsQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ3RELENBQUM7Q0FBQTtBQUlELElBQUksQ0FBQztJQUNELElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDYixHQUFHLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ25DLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ1QsR0FBRyxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRCxDQUFDLENBQUM7QUFDTixDQUFDO0FBQUMsT0FBTSxDQUFDLEVBQUUsQ0FBQztJQUNSLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUNBQW1DLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDMUQsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3hLRCwwQkE4Q0M7QUE5Q0QsU0FBc0IsT0FBTyxDQUFDLEdBQVc7O1FBQ3JDLE1BQU0sUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sSUFBSSxHQUFHLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25DLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFL0IsTUFBTSxTQUFTLEdBQWEsRUFBRSxDQUFDO1FBQy9CLE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUN6QixNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7UUFDN0IsTUFBTSxhQUFhLEdBQWEsRUFBRSxDQUFDO1FBQ25DLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztRQUU5QixNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUNqRCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFFZCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDdkMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ25CLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2xELENBQUM7aUJBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7Z0JBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVDLENBQUM7aUJBQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQzFCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDMUIsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO3dCQUMzQixNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUN2RSxhQUFhLENBQUMsSUFBSSxDQUNkLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQ3JCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUN6QixTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FDNUIsQ0FBQzt3QkFDRixRQUFRLENBQUMsSUFBSSxDQUNULEdBQUcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEVBQ2hCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUN2QixDQUFDO3dCQUNGLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQ3JDLENBQUM7b0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUM7Z0JBQzNDLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUVELE9BQU87WUFDSCxRQUFRLEVBQUUsSUFBSSxZQUFZLENBQUMsYUFBYSxDQUFDO1lBQ3pDLEdBQUcsRUFBRSxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUM7WUFDL0IsT0FBTyxFQUFFLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQztTQUNwQyxDQUFDO0lBQ04sQ0FBQztDQUFBOzs7Ozs7Ozs7Ozs7OztBQ25DRCxvQkF5REM7QUExRUQsdUdBQWlDO0FBRXBCLFlBQUksR0FBRyxJQUFJLGdCQUFJLENBQUMsRUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0FBRXJELGdCQUFRLEdBQUc7SUFFcEIsVUFBVSxFQUFFLElBQUk7SUFFaEIscUJBQXFCLEVBQUUsSUFBSTtJQUMzQixXQUFXLEVBQUUsR0FBRztJQUVoQixhQUFhLEVBQUUsR0FBRztJQUNsQixzQkFBc0IsRUFBRSxHQUFHO0lBRTNCLGFBQWEsRUFBRSx5Q0FBeUM7Q0FDM0QsQ0FBQztBQUVGLFNBQWdCLElBQUk7SUFFaEIsU0FBUztJQUVULE1BQU0sT0FBTyxHQUFHLFlBQUksQ0FBQyxTQUFTLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0lBRW5FLE9BQU8sQ0FBQyxVQUFVLENBQUMsZ0JBQVEsRUFBRSxZQUFZLEVBQUU7UUFDdkMsS0FBSyxFQUFFLEtBQUs7UUFDWixHQUFHLEVBQUUsSUFBSTtRQUNULEdBQUcsRUFBRSxLQUFLO1FBQ1YsSUFBSSxFQUFFLEdBQUc7S0FDWixDQUFDLENBQUM7SUFFSCxTQUFTO0lBRVQsTUFBTSxPQUFPLEdBQUcsWUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7SUFFbkUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxnQkFBUSxFQUFFLHVCQUF1QixFQUFFO1FBQ2xELEtBQUssRUFBRSxVQUFVO1FBQ2pCLEdBQUcsRUFBRSxHQUFHO1FBQ1IsR0FBRyxFQUFFLEtBQUs7UUFDVixJQUFJLEVBQUUsR0FBRztLQUNaLENBQUMsQ0FBQztJQUVILE9BQU8sQ0FBQyxVQUFVLENBQUMsZ0JBQVEsRUFBRSxhQUFhLEVBQUU7UUFDeEMsS0FBSyxFQUFFLE1BQU07UUFDYixHQUFHLEVBQUUsR0FBRztRQUNSLEdBQUcsRUFBRSxHQUFHO1FBQ1IsSUFBSSxFQUFFLEdBQUc7S0FDWixDQUFDLENBQUM7SUFFSCxZQUFZO0lBRVosTUFBTSxVQUFVLEdBQUcsWUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFFckUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxnQkFBUSxFQUFFLGVBQWUsRUFBRTtRQUM3QyxLQUFLLEVBQUUsS0FBSztRQUNaLFFBQVEsRUFBRSxJQUFJO1FBQ2QsSUFBSSxFQUFFLE1BQU07UUFDWixRQUFRLEVBQUUsR0FBRztLQUNoQixDQUFDLENBQUM7SUFFSCxVQUFVLENBQUMsVUFBVSxDQUFDLGdCQUFRLEVBQUUsd0JBQXdCLEVBQUU7UUFDdEQsS0FBSyxFQUFFLGNBQWM7UUFDckIsUUFBUSxFQUFFLElBQUk7UUFDZCxNQUFNLEVBQUUsQ0FBQyxLQUFhLEVBQVUsRUFBRTtZQUM5QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ25DLENBQUM7S0FDSixDQUFDLENBQUM7SUFFSCxTQUFTO0lBRVQsTUFBTSxPQUFPLEdBQUcsWUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7SUFFcEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFDckUsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBUSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFBQSxDQUFDOzs7Ozs7O1VDMUVGO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7Ozs7V0N6QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSwrQkFBK0Isd0NBQXdDO1dBQ3ZFO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUJBQWlCLHFCQUFxQjtXQUN0QztXQUNBO1dBQ0Esa0JBQWtCLHFCQUFxQjtXQUN2QztXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxFOzs7OztXQzNCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBLDRHOzs7OztVRWhEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvY2xhc3MudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvZnVuY3Rpb24udHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvbWFpbi50cyIsIndlYnBhY2s6Ly93ZWJnbC8uL3NyYy9vYmpMb2FkZXIudHMiLCJ3ZWJwYWNrOi8vd2ViZ2wvLi9zcmMvdHdlYWtwYW5lLnRzIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vd2ViZ2wvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL3dlYmdsL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93ZWJnbC93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy9cclxuLy8gQ0xBU1NcclxuLy9cclxuXHJcbmV4cG9ydCBjbGFzcyBTaGFwZSB7XHJcbiAgICBwcml2YXRlIG1hdFdvcmxkID0gbmV3IG1hdDQoKTtcclxuICAgIHByaXZhdGUgc2NhbGVWZWMgPSBuZXcgdmVjMygpO1xyXG4gICAgcHJpdmF0ZSByb3RhdGlvbiA9IG5ldyBxdWF0KCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHJpdmF0ZSBwb3M6IHZlYzMsXHJcbiAgICAgICAgcHVibGljIHNjYWxlOiBudW1iZXIsXHJcbiAgICAgICAgcHJpdmF0ZSByb3RhdGlvbkF4aXM6IHZlYzMsXHJcbiAgICAgICAgcHJpdmF0ZSByb3RhdGlvbkFuZ2xlOiBudW1iZXIsXHJcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IHZhbzogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCxcclxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgbnVtSW5kaWNlczogbnVtYmVyXHJcbiAgICApIHsgfVxyXG5cclxuICAgIHJvdGF0ZShhbmdsZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5yb3RhdGlvbkFuZ2xlID0gdGhpcy5yb3RhdGlvbkFuZ2xlICsgYW5nbGU7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyhnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgbWF0V29ybGRVbmlmb3JtOiBXZWJHTFVuaWZvcm1Mb2NhdGlvbikge1xyXG4gICAgICAgIHRoaXMucm90YXRpb24uc2V0QXhpc0FuZ2xlKHRoaXMucm90YXRpb25BeGlzLCB0aGlzLnJvdGF0aW9uQW5nbGUpO1xyXG4gICAgICAgIHRoaXMuc2NhbGVWZWMuc2V0KHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUsIHRoaXMuc2NhbGUpO1xyXG5cclxuICAgICAgICB0aGlzLm1hdFdvcmxkLnNldEZyb21Sb3RhdGlvblRyYW5zbGF0aW9uU2NhbGUodGhpcy5yb3RhdGlvbiwgdGhpcy5wb3MsIHRoaXMuc2NhbGVWZWMpO1xyXG5cclxuICAgICAgICBnbC51bmlmb3JtTWF0cml4NGZ2KG1hdFdvcmxkVW5pZm9ybSwgZmFsc2UsIHRoaXMubWF0V29ybGQubWF0KTtcclxuICAgICAgICBnbC5iaW5kVmVydGV4QXJyYXkodGhpcy52YW8pO1xyXG4gICAgICAgIGdsLmRyYXdFbGVtZW50cyhnbC5UUklBTkdMRVMsIHRoaXMubnVtSW5kaWNlcywgZ2wuVU5TSUdORURfU0hPUlQsIDApO1xyXG4gICAgICAgIGdsLmJpbmRWZXJ0ZXhBcnJheShudWxsKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyB2ZWMzIHtcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyB4OiBudW1iZXIgPSAwLjAsIHB1YmxpYyB5OiBudW1iZXIgPSAwLjAsIHB1YmxpYyB6OiBudW1iZXIgPSAwLjApIHt9XHJcblxyXG4gICAgYWRkKHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55LCB0aGlzLnogKyB2LnopIH1cclxuICAgIHN1YnRyYWN0KHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55LCB0aGlzLnogLSB2LnopIH1cclxuICAgIG11bHRpcGx5KHY6IHZlYzMpOiB2ZWMzIHsgcmV0dXJuIG5ldyB2ZWMzKHRoaXMueCAqIHYueCwgdGhpcy55ICogdi55LCB0aGlzLnogKiB2LnopIH1cclxuICAgIHNldCh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMueiA9IHo7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBub3JtYWxpemUoKTogdmVjMyB7XHJcbiAgICAgICAgY29uc3QgbGVuID0gTWF0aC5oeXBvdCh0aGlzLngsIHRoaXMueSwgdGhpcy56KTtcclxuICAgICAgICByZXR1cm4gbGVuID4gMCA/IG5ldyB2ZWMzKHRoaXMueCAvIGxlbiwgdGhpcy55IC8gbGVuLCB0aGlzLnogLyBsZW4pIDogbmV3IHZlYzMoKTtcclxuICAgIH1cclxuICAgIGNyb3NzKHY6IHZlYzMpOiB2ZWMzIHtcclxuICAgICAgICByZXR1cm4gbmV3IHZlYzMoXHJcbiAgICAgICAgICAgIHRoaXMueSAqIHYueiAtIHRoaXMueiAqIHYueSxcclxuICAgICAgICAgICAgdGhpcy56ICogdi54IC0gdGhpcy54ICogdi56LFxyXG4gICAgICAgICAgICB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2LnhcclxuICAgICAgICApO1xyXG4gICAgfVxyXG4gICAgZG90KHY6IHZlYzMpOiBudW1iZXIgeyByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56IH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIHF1YXQge1xyXG4gICAgY29uc3RydWN0b3IoXHJcbiAgICAgICAgcHVibGljIHg6IG51bWJlciA9IDAsXHJcbiAgICAgICAgcHVibGljIHk6IG51bWJlciA9IDAsXHJcbiAgICAgICAgcHVibGljIHo6IG51bWJlciA9IDAsXHJcbiAgICAgICAgcHVibGljIHc6IG51bWJlciA9IDFcclxuICAgICkge31cclxuXHJcbiAgICBzZXRBeGlzQW5nbGUoYXhpczogdmVjMywgYW5nbGU6IG51bWJlcik6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IG5vcm0gPSBheGlzLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IGhhbGYgPSBhbmdsZSAvIDI7XHJcbiAgICAgICAgY29uc3QgcyA9IE1hdGguc2luKGhhbGYpO1xyXG5cclxuICAgICAgICB0aGlzLnggPSBub3JtLnggKiBzO1xyXG4gICAgICAgIHRoaXMueSA9IG5vcm0ueSAqIHM7XHJcbiAgICAgICAgdGhpcy56ID0gbm9ybS56ICogcztcclxuICAgICAgICB0aGlzLncgPSBNYXRoLmNvcyhoYWxmKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBtYXQ0IHtcclxuICAgIHB1YmxpYyBtYXQ6IEZsb2F0MzJBcnJheTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLm1hdCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpO1xyXG4gICAgICAgIHRoaXMuaWRlbnRpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBpZGVudGl0eSgpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tYXQ7XHJcbiAgICAgICAgbS5zZXQoW1xyXG4gICAgICAgICAgICAxLCAwLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAxLCAwLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAxLCAwLFxyXG4gICAgICAgICAgICAwLCAwLCAwLCAxXHJcbiAgICAgICAgXSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgY29weUZyb20obWF0OiBtYXQ0KTogdGhpcyB7XHJcbiAgICAgICAgdGhpcy5tYXQuc2V0KG1hdC5tYXQpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogIHgsICAwLCAgMCwgMFxyXG4gICAgICogIDAsICB5LCAgMCwgMFxyXG4gICAgICogIDAsICAwLCAgeiwgMFxyXG4gICAgICogdHgsIHR5LCB0eiwgMVxyXG4gICAgICovXHJcbiAgICBtdWx0aXBseShvdGhlcjogbWF0NCk6IHRoaXMge1xyXG4gICAgICAgIGNvbnN0IGEgPSB0aGlzLm1hdCwgYiA9IG90aGVyLm1hdDtcclxuICAgICAgICBjb25zdCBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDE2KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyArK2kpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA0OyArK2opIHtcclxuICAgICAgICAgICAgICAgIG91dFtqICogNCArIGldID1cclxuICAgICAgICAgICAgICAgIGFbMCAqIDQgKyBpXSAqIGJbaiAqIDQgKyAwXSArXHJcbiAgICAgICAgICAgICAgICBhWzEgKiA0ICsgaV0gKiBiW2ogKiA0ICsgMV0gK1xyXG4gICAgICAgICAgICAgICAgYVsyICogNCArIGldICogYltqICogNCArIDJdICtcclxuICAgICAgICAgICAgICAgIGFbMyAqIDQgKyBpXSAqIGJbaiAqIDQgKyAzXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tYXQuc2V0KG91dCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuICAgICAqIFBlcnNwZWN0aXZlIG1hdHJpY2UsIHRoZSBmYWN0b3IgaXMgY2FsY3VsYXRlZCBmcm9tIHRoZSB0YW4gb2YgdGhlIEZPViBkaXZpZGVkIGJ5IDI6XHJcbiAgICAgKiBXZSBoYXZlIHRoZSBuZWFyIHBsYW5lIGFuZCBmYXIgcGxhbmUuIChvYmplY3RzIGFyZSBkcmF3biBpbiBiZXR3ZWVuKVxyXG4gICAgICogQXNwZWN0IGlzIHRoZSBhc3BlY3QgcmF0aW8sIGxpa2UgMTY6OSBvbiBtb3N0IHNjcmVlbnMuXHJcbiAgICAgKiBXZSBjaGFuZ2UgZWFjaCB2ZXJ0aWNlcyB4LCB5IGFuZCB6IGJ5IHRoZSBmb2xsb3dpbmc6XHJcbiAgICAgKiAwLCAwLCAgMCwgIDBcclxuICAgICAqIDAsIDUsICAwLCAgMFxyXG4gICAgICogMCwgMCwgMTAsIDExXHJcbiAgICAgKiAwLCAwLCAxNCwgMTVcclxuICAgICAqL1xyXG4gICAgc2V0UGVyc3BlY3RpdmUoZm92UmFkOiBudW1iZXIsIGFzcGVjdDogbnVtYmVyLCBuZWFyOiBudW1iZXIsIGZhcjogbnVtYmVyKTogdGhpcyB7XHJcbiAgICAgICAgY29uc3QgZiA9IDEuMCAvIE1hdGgudGFuKGZvdlJhZCAvIDIpO1xyXG4gICAgICAgIGNvbnN0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcclxuICAgICAgICBjb25zdCBtID0gdGhpcy5tYXQ7XHJcbiAgICAgICAgbS5zZXQoW1xyXG4gICAgICAgICAgICBmIC8gYXNwZWN0LCAgICAgMCwgICAgICAwLCAgICAgICAgICAgICAgICAgICAgICAgMCxcclxuICAgICAgICAgICAgMCwgICAgICAgICAgICAgIGYsICAgICAgMCwgICAgICAgICAgICAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgIDAsICAgICAgICAgICAgICAwLCAgICAgIChmYXIgKyBuZWFyKSAqIG5mLCAgICAgIC0xLFxyXG4gICAgICAgICAgICAwLCAgICAgICAgICAgICAgMCwgICAgICAyKmZhcipuZWFyKm5mLCAgICAgICAgICAgMFxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldExvb2tBdChleWU6IHZlYzMsIGNlbnRlcjogdmVjMywgdXA6IHZlYzMpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCB6ID0gZXllLnN1YnRyYWN0KGNlbnRlcikubm9ybWFsaXplKCk7XHJcbiAgICAgICAgY29uc3QgeCA9IHVwLmNyb3NzKHopLm5vcm1hbGl6ZSgpO1xyXG4gICAgICAgIGNvbnN0IHkgPSB6LmNyb3NzKHgpO1xyXG4gICAgICAgIGNvbnN0IG0gPSB0aGlzLm1hdDtcclxuICAgICAgICBtLnNldChbXHJcbiAgICAgICAgICAgIHgueCwgICAgICAgICAgICB5LngsICAgICAgICAgICAgei54LCAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgIHgueSwgICAgICAgICAgICB5LnksICAgICAgICAgICAgei55LCAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgIHgueiwgICAgICAgICAgICB5LnosICAgICAgICAgICAgei56LCAgICAgICAgICAgIDAsXHJcbiAgICAgICAgICAgIC14LmRvdChleWUpLCAgICAteS5kb3QoZXllKSwgICAgLXouZG90KGV5ZSksICAgIDFcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRGcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKHE6IHF1YXQsIHY6IHZlYzMsIHM6IHZlYzMpOiB0aGlzIHtcclxuICAgICAgICBjb25zdCB4ID0gcS54LCB5ID0gcS55LCB6ID0gcS56LCB3ID0gcS53O1xyXG4gICAgICAgIGNvbnN0IHN4ID0gcy54LCBzeSA9IHMueSwgc3ogPSBzLno7XHJcblxyXG4gICAgICAgIGNvbnN0IHgyID0geCArIHgsIHkyID0geSArIHksIHoyID0geiArIHo7XHJcbiAgICAgICAgY29uc3QgeHggPSB4ICogeDIsIHh5ID0geCAqIHkyLCB4eiA9IHggKiB6MjtcclxuICAgICAgICBjb25zdCB5eSA9IHkgKiB5MiwgeXogPSB5ICogejIsIHp6ID0geiAqIHoyO1xyXG4gICAgICAgIGNvbnN0IHd4ID0gdyAqIHgyLCB3eSA9IHcgKiB5Miwgd3ogPSB3ICogejI7XHJcbiAgICAgICAgY29uc3QgbSA9IHRoaXMubWF0O1xyXG4gICAgICAgIG0uc2V0KFtcclxuICAgICAgICAgICAgKDEgLSAoeXkgKyB6eikpICogc3gsICAgICAgICAgKHh5ICsgd3opICogc3gsICAgICAgICh4eiAtIHd5KSAqIHN4LCAgICAgMCxcclxuICAgICAgICAgICAgKHh5IC0gd3opICogc3ksICAgKDEgLSAoeHggKyB6eikpICogc3ksICAgICAgICh5eiArIHd4KSAqIHN5LCAgICAgMCxcclxuICAgICAgICAgICAgKHh6ICsgd3kpICogc3osICAgICAgICAgKHl6IC0gd3gpICogc3osICgxIC0gKHh4ICsgeXkpKSAqIHN6LCAgICAgMCxcclxuICAgICAgICAgICAgdi54LCAgICAgICAgICAgICAgICAgICAgdi55LCAgICAgICAgICAgICAgICAgIHYueiwgICAgIDFcclxuICAgICAgICBdKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG4iLCIvL1xyXG4vLyBGVU5DVElPTlxyXG4vL1xyXG5cclxuLy8gRGlzcGxheSBhbiBlcnJvciBtZXNzYWdlIHRvIHRoZSBIVE1MIEVsZW1lbnQgd2l0aCBpZCBcImVycm9yXCIuXHJcbmV4cG9ydCBmdW5jdGlvbiBzaG93RXJyb3IobXNnOiBzdHJpbmcgPSBcIk5vIERhdGFcIik6IHZvaWQge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlcnJvclwiKTtcclxuICAgIGlmKGNvbnRhaW5lciA9PT0gbnVsbCkgcmV0dXJuIGNvbnNvbGUubG9nKFwiTm8gRWxlbWVudCB3aXRoIElEOiBlcnJvclwiKTtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XHJcbiAgICBlbGVtZW50LmlubmVyVGV4dCA9IG1zZztcclxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbn1cclxuXHJcbi8vIEdldCBzaGFkZXJzIHNvdXJjZSBjb2RlLlxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U2hhZGVyU291cmNlKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIHdoaWxlIGxvYWRpbmcgc2hhZGVyIGNvZGUgYXQgXCIke3VybH1cIjogJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEltYWdlKHVybDogc3RyaW5nKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICBjb25zdCBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgIGltYWdlLnNyYyA9IHVybDtcclxuICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltYWdlKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vIFJldHVybiB0aGUgV2ViR0wgQ29udGV4dCBmcm9tIHRoZSBDYW52YXMgRWxlbWVudC5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbnRleHQoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCk6IFdlYkdMMlJlbmRlcmluZ0NvbnRleHQge1xyXG4gICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCd3ZWJnbDInKSBhcyBXZWJHTDJSZW5kZXJpbmdDb250ZXh0IDtcclxufVxyXG5cclxuLy8gQ29udmVydCBmcm9tIGRlZ3JlZXMgdG8gcmFkaWFudC5cclxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGFuZ2xlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIGFuZ2xlICogTWF0aC5QSSAvIDE4MDtcclxufVxyXG5cclxuLyogQ3JlYXRlIGEgV2ViR0wgQnVmZmVyIHR5cGUuIChPcGFxdWUgSGFuZGxlKVxyXG4gKiAtIFNUQVRJQ19EUkFXIDogd29uJ3QgdXBkYXRlIG9mdGVuLCBidXQgb2Z0ZW4gdXNlZC5cclxuICogLSBBUlJBWV9CVUZGRVIgOiBpbmRpY2F0ZSB0aGUgcGxhY2UgdG8gc3RvcmUgdGhlIEFycmF5LlxyXG4gKiAtIEVMRU1FTlRfQVJSQVlfQlVGRkVSIDogVXNlZCBmb3IgaW5kaWNlcyB3aXRoIGN1YmUgc2hhcGUgZHJhd2luZy5cclxuICogQmluZCB0aGUgQnVmZmVyIHRvIHRoZSBDUFUsIGFkZCB0aGUgQXJyYXkgdG8gdGhlIEJ1ZmZlciBhbmQgQ2xlYXIgYWZ0ZXIgdXNlLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0YXRpY0J1ZmZlcihcclxuICAgIGdsOiBXZWJHTDJSZW5kZXJpbmdDb250ZXh0LFxyXG4gICAgZGF0YTogQXJyYXlCdWZmZXIgfCBVaW50MTZBcnJheTxBcnJheUJ1ZmZlckxpa2U+IHwgRmxvYXQzMkFycmF5PEFycmF5QnVmZmVyTGlrZT4sXHJcbiAgICBpc0luZGljZTogYm9vbGVhblxyXG4pOiBXZWJHTEJ1ZmZlciB7XHJcbiAgICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcclxuICAgIGNvbnN0IHR5cGUgPSAoaXNJbmRpY2UgPT0gdHJ1ZSkgPyBnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiA6IGdsLkFSUkFZX0JVRkZFUlxyXG4gICAgaWYoIWJ1ZmZlcikge1xyXG4gICAgICAgIHNob3dFcnJvcihcIkZhaWxlZCB0byBhbGxvY2F0ZSBidWZmZXIgc3BhY2VcIik7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2wuYmluZEJ1ZmZlcih0eXBlLCBidWZmZXIpO1xyXG4gICAgZ2wuYnVmZmVyRGF0YSh0eXBlLCBkYXRhLCBnbC5TVEFUSUNfRFJBVyk7XHJcbiAgICBnbC5iaW5kQnVmZmVyKHR5cGUsIG51bGwpO1xyXG4gICAgcmV0dXJuIGJ1ZmZlclxyXG59XHJcblxyXG4vKiBDcmVhdGUgdmVydGV4IGFycmF5IG9iamVjdCBidWZmZXJzLCBpdCByZWFkcyB0aGUgdmVydGljZXMgZnJvbSBHUFUgQnVmZmVyLlxyXG4gKiBUaGUgdmVydGV4IGJ1ZmZlciBjb250YWlucyB0aGUgdmVydGljZXMnIGNvb3JkaW5hdGVzIChjYW4gYWxzbyBjb250YWluIGNvbG9yIGFuZCBzaXplKS5cclxuICogVGhlIGluZGV4IGJ1ZmZlciBjb250YWlucyB3aGljaCB2ZXJ0ZXggbmVlZHMgdG8gYmUgZHJhd24gb24gc2NlbmUgdG8gYXZvaWQgZHVwbGljYXRlIHZlcnRpY2VzLlxyXG4gKiBJbiBjYXNlIG9mIGNvbG9ycywgYW4gb2Zmc2V0IG9mIDMgZmxvYXRzIGlzIHVzZWQgZWFjaCB0aW1lIHRvIGF2b2lkICh4LCB5LCB6KSBjb29yZGluYXRlcy5cclxuICogVGhlIHZlcnRleCBzaGFkZXIgcGxhY2VzIHRoZSB2ZXJ0aWNlcyBpbiBjbGlwIHNwYWNlIGFuZCB0aGUgZnJhZ21lbnQgc2hhZGVyIGNvbG9ycyB0aGUgcGl4ZWxzLiAoRGVmYXVsdDogMClcclxuICogVmVydGV4QXR0cmliUG9pbnRlciBbSW5kZXgsIFNpemUsIFR5cGUsIElzTm9ybWFsaXplZCwgU3RyaWRlLCBPZmZzZXRdXHJcbiAqIC0gSW5kZXggKGxvY2F0aW9uKVxyXG4gKiAtIFNpemUgKENvbXBvbmVudCBwZXIgdmVjdG9yKVxyXG4gKiAtIFR5cGVcclxuICogLSBJc05vcm1hbGl6ZWQgKGludCB0byBmbG9hdHMsIGZvciBjb2xvcnMgdHJhbnNmb3JtIFswLCAyNTVdIHRvIGZsb2F0IFswLCAxXSlcclxuICogLSBTdHJpZGUgKERpc3RhbmNlIGJldHdlZW4gZWFjaCB2ZXJ0ZXggaW4gdGhlIGJ1ZmZlcilcclxuICogLSBPZmZzZXQgKE51bWJlciBvZiBza2lwZWQgYnl0ZXMgYmVmb3JlIHJlYWRpbmcgYXR0cmlidXRlcylcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVWQU9CdWZmZXIoXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHZlcnRleEJ1ZmZlcjogV2ViR0xCdWZmZXIsIGluZGV4QnVmZmVyOiBXZWJHTEJ1ZmZlciwgdXZCdWZmZXI6IFdlYkdMQnVmZmVyLFxyXG4gICAgcG9zQXR0cmliOiBudW1iZXIsIHV2QXR0cmliOiBudW1iZXJcclxuKTogV2ViR0xWZXJ0ZXhBcnJheU9iamVjdCB7XHJcbiAgICBjb25zdCB2YW8gPSBnbC5jcmVhdGVWZXJ0ZXhBcnJheSgpO1xyXG4gICAgaWYoIXZhbykgeyBzaG93RXJyb3IoXCJGYWlsZWQgdG8gYWxsb2NhdGUgVkFPIGJ1ZmZlci5cIik7IHJldHVybiAwOyB9XHJcbiAgICBnbC5iaW5kVmVydGV4QXJyYXkodmFvKTtcclxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHBvc0F0dHJpYik7XHJcbiAgICBnbC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSh1dkF0dHJpYik7XHJcbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgdmVydGV4QnVmZmVyKTtcclxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIocG9zQXR0cmliLCAzLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApOyAvLyBmb3JtYXQ6ICh4LCB5LCB6KSAoYWxsIGYzMilcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKTtcclxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCB1dkJ1ZmZlcik7XHJcbiAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHV2QXR0cmliLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaW5kZXhCdWZmZXIpO1xyXG4gICAgZ2wuYmluZFZlcnRleEFycmF5KG51bGwpO1xyXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbCk7XHJcbiAgICByZXR1cm4gdmFvO1xyXG59XHJcblxyXG4vLyBDcmVhdGUgYSBwcm9ncmFtIGFuZCBsaW5rIHRoZSB2ZXJ0ZXggYW5kIGZyYWdtZW50IHNoYWRlciBzb3VyY2UgY29kZSB0byBpdC5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVByb2dyYW0oXHJcbiAgICBnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCxcclxuICAgIHZlcnRleFNoYWRlclNyYzogc3RyaW5nLFxyXG4gICAgZnJhZ21lbnRTaGFkZXJTcmM6IHN0cmluZ1xyXG4pOiBXZWJHTFByb2dyYW0ge1xyXG4gICAgY29uc3QgdmVydGV4U2hhZGVyID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpIGFzIFdlYkdMU2hhZGVyO1xyXG4gICAgY29uc3QgZnJhZ21lbnRTaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKSBhcyBXZWJHTFNoYWRlcjtcclxuICAgIGNvbnN0IHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XHJcblxyXG4gICAgZ2wuc2hhZGVyU291cmNlKHZlcnRleFNoYWRlciwgdmVydGV4U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydGV4U2hhZGVyKTtcclxuICAgIGlmKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIodmVydGV4U2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcclxuICAgICAgICBjb25zdCBlcnJvciA9IGdsLmdldFNoYWRlckluZm9Mb2codmVydGV4U2hhZGVyKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBnbC5zaGFkZXJTb3VyY2UoZnJhZ21lbnRTaGFkZXIsIGZyYWdtZW50U2hhZGVyU3JjKTtcclxuICAgIGdsLmNvbXBpbGVTaGFkZXIoZnJhZ21lbnRTaGFkZXIpO1xyXG4gICAgaWYoIWdsLmdldFNoYWRlclBhcmFtZXRlcihmcmFnbWVudFNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpKSB7XHJcbiAgICAgICAgY29uc3QgZXJyb3IgPSBnbC5nZXRTaGFkZXJJbmZvTG9nKGZyYWdtZW50U2hhZGVyKTtcclxuICAgICAgICBzaG93RXJyb3IoZXJyb3IgfHwgXCJObyBzaGFkZXIgZGVidWcgbG9nIHByb3ZpZGVkLlwiKTtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBQcm9ncmFtIHNldCB1cCBmb3IgVW5pZm9ybXMuXHJcbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4U2hhZGVyKTtcclxuICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudFNoYWRlcik7XHJcbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcclxuICAgIGlmKCFnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yID0gZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSk7XHJcbiAgICAgICAgc2hvd0Vycm9yKGVycm9yIHx8IFwiTm8gcHJvZ3JhbSBkZWJ1ZyBsb2cgcHJvdmlkZWQuXCIpO1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHByb2dyYW07XHJcbn1cclxuXHJcblxyXG4vKiBDcmVhdGUgYSBXZWJHTCB0ZXh0dXJlIGFuZCBiaW5kIGl0IHRvIGEgVEVYVFVSRV8yRF9BUlJBWS5cclxuICogU2V0IHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgdGV4dHVyZXMgc3RvcmFnZS4gKFRhcmdldCwgTWlwbWFwX0xldmVscywgSW50ZXJuYWxfRm9ybWF0LCBXaWR0aCwgSGVpZ2h0LCBJbWFnZXNfQ291bnQpXHJcbiAqIEZsaXAgdGhlIG9yaWdpbiBwb2ludCBvZiBXZWJHTC4gKFBORyBmb3JtYXQgc3RhcnRzIGF0IHRoZSB0b3AgYW5kIFdlYkdMIGF0IHRoZSBib3R0b20pXHJcbiAqIEJlY2F1c2UgdGV4U3ViSW1hZ2UzRCBpcyBhc3luYywgd2FpdGluZyBmb3IgZWFjaCBpbWFnZSB0byBsb2FkIGlzIHNsb3cuIFNvLCB3ZSBwcmVsb2FkIGFsbCBpbWFnZXMgdXNpbmcgYSBQcm9taXNlLlxyXG4gKiBTZXQgdGhlIHBhcmFtZXRlcnMgb24gaG93IHRvIHN0b3JlIGVhY2ggdGV4dHVyZS4gKFRhcmdldCwgTWlwbWFwX0xldmVsLCBJbnRlcm5hbF9Gb3JtYXQsIFdpZHRoLCBIZWlnaHQsIERlcHRoLCBCb3JkZXIsIEZvcm1hdCwgVHlwZSwgT2Zmc2V0KVxyXG4gKiBDaGFuZ2UgdGhlIG1pbmltdW0gYW5kIG1hZ25pdHVkZSBmaWx0ZXJzIHdoZW4gc2NhbGluZyB1cCBhbmQgZG93biB0ZXh0dXJlcy5cclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkVGV4dHVyZShnbDogV2ViR0wyUmVuZGVyaW5nQ29udGV4dCwgdGV4dHVyZXM6IHN0cmluZ1tdKSB7XHJcbiAgICBjb25zdCB0ZXh0dXJlID0gZ2wuY3JlYXRlVGV4dHVyZSgpO1xyXG4gICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgdGV4dHVyZSk7XHJcbiAgICBnbC50ZXhTdG9yYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMSwgZ2wuUkdCQTgsIDEyOCwgMTI4LCB0ZXh0dXJlcy5sZW5ndGgpO1xyXG4gICAgZ2wucGl4ZWxTdG9yZWkoZ2wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdHJ1ZSk7XHJcblxyXG4gICAgY29uc3QgaW1hZ2VzID0gYXdhaXQgUHJvbWlzZS5hbGwodGV4dHVyZXMubWFwKHNyYyA9PiBnZXRJbWFnZShzcmMpKSk7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGltYWdlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGdsLnRleFN1YkltYWdlM0QoZ2wuVEVYVFVSRV8yRF9BUlJBWSwgMCwgMCwgMCwgaSwgMTI4LCAxMjgsIDEsIGdsLlJHQkEsIGdsLlVOU0lHTkVEX0JZVEUsIGltYWdlc1tpXSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJEX0FSUkFZLCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG4gICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJEX0FSUkFZLCBnbC5URVhUVVJFX01BR19GSUxURVIsIGdsLk5FQVJFU1QpO1xyXG59XHJcbiIsImltcG9ydCAqIGFzIGZuYyBmcm9tIFwiLi9mdW5jdGlvblwiO1xyXG5pbXBvcnQgKiBhcyBjbHMgZnJvbSBcIi4vY2xhc3NcIjtcclxuaW1wb3J0IHsgbG9hZE9CSiB9IGZyb20gXCIuL29iakxvYWRlclwiO1xyXG5pbXBvcnQgKiBhcyB0d2Vha3BhbmUgZnJvbSBcIi4vdHdlYWtwYW5lXCI7XHJcblxyXG4vL1xyXG4vLyBNQUlOXHJcbi8vXHJcblxyXG5jb25zdCBVUF9WRUMgPSBuZXcgY2xzLnZlYzMoMCwgMSwgMCk7XHJcbmNvbnN0IFQwID0gRGF0ZS5ub3coKTtcclxuY29uc3QgVEVYVFVSRVMgPSBbICcuL2ltZy9kaWFtb25kLnBuZycgXTtcclxuY29uc3QgU0VUVElOR1MgPSB0d2Vha3BhbmUuU0VUVElOR1M7XHJcbnR3ZWFrcGFuZS5pbml0KCk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBtYWluKCk6IFByb21pc2U8dm9pZD4ge1xyXG5cclxuICAgIC8vIENhbnZhcyBFbGVtZW50IGFuZCBSZW5kZXJpbmcgQ29udGV4dC5cclxuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwid2ViZ2wtY2FudmFzXCIpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xyXG4gICAgY29uc3QgZ2wgPSBmbmMuZ2V0Q29udGV4dChjYW52YXMpO1xyXG5cclxuICAgIC8vIEZldGNoIHNoYWRlcnMgY29kZSBhbmQgbGluayB0aGVtIHRvIGEgcHJvZ3JhbS5cclxuICAgIGNvbnN0IHZlcnRleFNyYyA9IGF3YWl0IGZuYy5nZXRTaGFkZXJTb3VyY2UoJy4vc2hhZGVycy92ZXJ0ZXhfc2hhZGVyLnZlcnQnKTtcclxuICAgIGNvbnN0IGZyYWdtZW50U3JjID0gYXdhaXQgZm5jLmdldFNoYWRlclNvdXJjZSgnLi9zaGFkZXJzL2ZyYWdtZW50X3NoYWRlci5mcmFnJyk7XHJcbiAgICBjb25zdCBwcm9ncmFtID0gZm5jLmNyZWF0ZVByb2dyYW0oZ2wsIHZlcnRleFNyYywgZnJhZ21lbnRTcmMpO1xyXG5cclxuICAgIC8vIExvYWQgYWxsIGltYWdlcywgY3JlYXRlIGEgc3RvcmFnZSwgYW5kIHN0b3JlIGVhY2ggaW1hZ2UgaW4gYSBUZXh0dXJlIEFycmF5LlxyXG4gICAgZm5jLmxvYWRUZXh0dXJlKGdsLCBURVhUVVJFUyk7XHJcblxyXG4gICAgLyogR2V0dGluZyB0aGUgYXR0cmlidXRlcyBmcm9tIHRoZSB2ZXJ0ZXggc2hhZGVyIGZpbGUuXHJcbiAgICAgKiBBdHRyaWJ1dGUgbG9jYXRpb25zIGNhbiBiZSBmb3JjZWQgaW4gdGhlIHZlcnRleCBzaGFkZXIgZmlsZSB3aXRoIChsb2NhdGlvbj1udW1iZXIpLlxyXG4gICAgICogSWYgbm90IGZvcmNlZCwgV2ViR0wgZ2l2ZXMgdGhlbSBhIG51bWJlciwgeW91IGNhbiBnZXQgdGhpcyBudW1iZXIgd2l0aCBnbC5nZXRBdHRyaWJMb2NhdGlvbigpLlxyXG4gICAgICogSGVyZSwgYmVjYXVzZSB3ZSBzZXQgbWFudWFsbHkgdGhlIGF0dHJpYnV0ZSBsb2NhdGlvbiBpbiB0aGUgdmVydGV4IHNoYWRlcixcclxuICAgICAqIFdlIGNhbiByZXBsYWNlIGdsLmdldEF0dHJpYkxvY2F0aW9uKCkgd2l0aCB0aGUgKGxvY2F0aW9uPW51bWJlcikgbnVtYmVyLlxyXG4gICAgICovXHJcbiAgICBjb25zdCBwb3NpdGlvbkF0dHJpYnV0ZSA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICd2ZXJ0ZXhQb3NpdGlvbicpOyAvLyBsb2NhdGlvbiA9IDBcclxuICAgIGNvbnN0IHV2QXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ2FVVicpOyAvLyBsb2NhdGlvbiA9IDFcclxuICAgIGNvbnN0IGRlcHRoQXR0cmlidXRlID0gZ2wuZ2V0QXR0cmliTG9jYXRpb24ocHJvZ3JhbSwgJ2FEZXB0aCcpOyAvLyBsb2NhdGlvbiA9IDJcclxuXHJcbiAgICAvLyBXZSBjYW5ub3Qgc3BlY2lmeSBVbmlmb3JtcyBsb2NhdGlvbnMgbWFudWFsbHkuIFdlIG5lZWQgdG8gZ2V0IHRoZW0gdXNpbmcgJ2dldFVuaWZvcm1Mb2NhdGlvbicuXHJcbiAgICBjb25zdCBtYXRXb3JsZFVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFdvcmxkJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcbiAgICBjb25zdCBtYXRWaWV3UHJvalVuaWZvcm0gPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgJ21hdFZpZXdQcm9qJykgYXMgV2ViR0xVbmlmb3JtTG9jYXRpb247XHJcbiAgICBjb25zdCBzYW1wbGVyVW5pZm9ybSA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCAndVNhbXBsZXInKSBhcyBXZWJHTFVuaWZvcm1Mb2NhdGlvbjtcclxuXHJcbiAgICAvLyBUeXBlc2NyaXB0IHdhbnRzIHRvIHZlcmlmeSBpZiB0aGUgdmFyaWFibGVzIGFyZSBzZXQsIG5vdCB0aGUgYmVzdCB3YXkgdG8gZG8gaXQuXHJcbiAgICBpZihwb3NpdGlvbkF0dHJpYnV0ZSA8IDAgfHwgdXZBdHRyaWJ1dGUgPCAwIHx8IGRlcHRoQXR0cmlidXRlIDwgMCB8fCAhbWF0V29ybGRVbmlmb3JtIHx8ICFtYXRWaWV3UHJvalVuaWZvcm0gfHwgIXNhbXBsZXJVbmlmb3JtKSB7XHJcbiAgICAgICAgZm5jLnNob3dFcnJvcihgRmFpbGVkIHRvIGdldCBhdHRyaWJzL3VuaWZvcm1zIChNYXg6ICR7Z2wuZ2V0UGFyYW1ldGVyKGdsLk1BWF9WRVJURVhfQVRUUklCUyl9KTogYCArXHJcbiAgICAgICAgICAgIGAgcG9zPSR7cG9zaXRpb25BdHRyaWJ1dGV9YCArXHJcbiAgICAgICAgICAgIGAgdXY9JHt1dkF0dHJpYnV0ZX1gICtcclxuICAgICAgICAgICAgYCBkZXB0aD0ke2RlcHRoQXR0cmlidXRlfWAgK1xyXG4gICAgICAgICAgICBgIG1hdFdvcmxkPSR7ISFtYXRXb3JsZFVuaWZvcm19YCArXHJcbiAgICAgICAgICAgIGAgbWF0Vmlld1Byb2o9JHshIW1hdFZpZXdQcm9qVW5pZm9ybX1gICtcclxuICAgICAgICAgICAgYCBzYW1wbGVyPSR7ISFzYW1wbGVyVW5pZm9ybX1gXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ29udHJvbCB0aGUgZGVwdGggb2YgdGhlIHRleHR1cmUgYXJyYXkuIFBpY2tpbmcgb3VyIGRpc3BsYXllZCB0ZXh0dXJlLlxyXG4gICAgZ2wudmVydGV4QXR0cmliMWYoZGVwdGhBdHRyaWJ1dGUsIDEpO1xyXG5cclxuICAgIGNvbnN0IG1vZGVsID0gYXdhaXQgbG9hZE9CSignLi9tb2RlbHMvZGlhbW9uZC5vYmonKTtcclxuXHJcbiAgICBjb25zdCBtb2RlbFZlcnRleEJ1ZmZlciA9IGZuYy5jcmVhdGVTdGF0aWNCdWZmZXIoZ2wsIG1vZGVsLnZlcnRpY2VzLCBmYWxzZSk7XHJcbiAgICBjb25zdCBtb2RlbEluZGV4QnVmZmVyID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgbW9kZWwuaW5kaWNlcywgdHJ1ZSk7XHJcbiAgICBjb25zdCBtb2RlbFVWQnVmZmVyID0gZm5jLmNyZWF0ZVN0YXRpY0J1ZmZlcihnbCwgbW9kZWwudXZzLCBmYWxzZSk7XHJcblxyXG4gICAgY29uc3QgbW9kZWxWQU8gPSBmbmMuY3JlYXRlVkFPQnVmZmVyKFxyXG4gICAgICAgIGdsLFxyXG4gICAgICAgIG1vZGVsVmVydGV4QnVmZmVyLFxyXG4gICAgICAgIG1vZGVsSW5kZXhCdWZmZXIsXHJcbiAgICAgICAgbW9kZWxVVkJ1ZmZlcixcclxuICAgICAgICBwb3NpdGlvbkF0dHJpYnV0ZSxcclxuICAgICAgICB1dkF0dHJpYnV0ZVxyXG4gICAgKTtcclxuXHJcbiAgICAvLyBTdG9yZSBvdXIgY3ViZXMsIGRyYXcgdGhlbSBlYWNoIHRpbWUuIChhIGxvdCBvZiBkcmF3IGNhbGxzKVxyXG4gICAgY29uc3QgY3ViZXM6IGNscy5TaGFwZVtdID0gW107XHJcbiAgICBjdWJlcy5wdXNoKG5ldyBjbHMuU2hhcGUoXHJcbiAgICAgICAgbmV3IGNscy52ZWMzKDAsIDAsIDApLFxyXG4gICAgICAgIFNFVFRJTkdTLm9iamVjdF9zaXplLFxyXG4gICAgICAgIFVQX1ZFQyxcclxuICAgICAgICBmbmMudG9SYWRpYW4oMCksXHJcbiAgICAgICAgbW9kZWxWQU8sXHJcbiAgICAgICAgbW9kZWwuaW5kaWNlcy5sZW5ndGhcclxuICAgICkpO1xyXG5cclxuICAgIGxldCBtYXRWaWV3ID0gbmV3IGNscy5tYXQ0KCk7XHJcbiAgICBsZXQgbWF0UHJvaiA9IG5ldyBjbHMubWF0NCgpO1xyXG4gICAgbGV0IG1hdFZpZXdQcm9qID0gbmV3IGNscy5tYXQ0KCk7XHJcblxyXG4gICAgbGV0IGNhbWVyYUFuZ2xlID0gMDtcclxuICAgIC8qIEFkZCBhIGZ1bmN0aW9uIHRvIGNhbGwgaXQgZWFjaCBmcmFtZS5cclxuICAgICAqIC0gT3V0cHV0IE1lcmdlcjogTWVyZ2UgdGhlIHNoYWRlZCBwaXhlbCBmcmFnbWVudCB3aXRoIHRoZSBleGlzdGluZyByZXN1bHQgaW1hZ2UuXHJcbiAgICAgKiAtIFJhc3Rlcml6ZXI6IFdpY2ggcGl4ZWxzIGFyZSBwYXJ0IG9mIHRoZSBWZXJ0aWNlcyArIFdpY2ggcGFydCB0aGF0IG1vZGlmaWVkIGJ5IFdlYkdMLlxyXG4gICAgICogLSBHUFUgUHJvZ3JhbTogUGFpciBWZXJ0ZXggJiBGcmFnbWVudCBzaGFkZXJzLlxyXG4gICAgICogLSBTZXQgVW5pZm9ybXMgKGNhbiBiZSBzZXQgYW55d2hlcmUpXHJcbiAgICAgKiAtIERyYXcgQ2FsbHMgKHcvIFByaW1pdGl2ZSBhc3NlbWJseSArIGZvciBsb29wKVxyXG4gICAgICovXHJcbiAgICBsZXQgbGFzdEZyYW1lVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG5cclxuICAgIGNvbnN0IGZyYW1lID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBkdCAoZGVsdGEgdGltZSkgd2l0aCB0aW1lIHNwZW50IGluIHNlY29uZHMgYmV0d2VlbiBlYWNoIGZyYW1lLlxyXG4gICAgICAgIGNvbnN0IHRoaXNGcmFtZVRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgICAgICBjb25zdCBkdCA9ICh0aGlzRnJhbWVUaW1lIC0gbGFzdEZyYW1lVGltZSkgLyAxMDAwO1xyXG4gICAgICAgIGxhc3RGcmFtZVRpbWUgPSB0aGlzRnJhbWVUaW1lO1xyXG5cclxuICAgICAgICAvLyBFYWNoIGZyYW1lIGFkZHMgMTDCsCB0byB0aGUgY2FtZXJhIGFuZ2xlLlxyXG4gICAgICAgIC8vIGNhbWVyYUFuZ2xlICs9IGR0ICogZm5jLnRvUmFkaWFuKDEwKTtcclxuXHJcbiAgICAgICAgLy8gRml4ZWQgY2FtZXJhIGNvb3JkaW5hdGVzLlxyXG4gICAgICAgIGNvbnN0IGNhbWVyYVggPSAzICogTWF0aC5zaW4oY2FtZXJhQW5nbGUpO1xyXG4gICAgICAgIGNvbnN0IGNhbWVyYVogPSAzICogTWF0aC5jb3MoY2FtZXJhQW5nbGUpO1xyXG5cclxuICAgICAgICAvLyBNYWtlIHRoZSAnY2FtZXJhJyBsb29rIGF0IHRoZSBjZW50ZXIuXHJcbiAgICAgICAgbWF0Vmlldy5zZXRMb29rQXQoXHJcbiAgICAgICAgICAgIG5ldyBjbHMudmVjMyhjYW1lcmFYLCAtLjI1LCBjYW1lcmFaKSxcclxuICAgICAgICAgICAgbmV3IGNscy52ZWMzKDAsIDAsIDApLFxyXG4gICAgICAgICAgICBuZXcgY2xzLnZlYzMoMCwgMSwgMClcclxuICAgICAgICApO1xyXG4gICAgICAgIC8vIFNldCB0aGUgY2FtZXJhIEZPViwgc2NyZWVuIHNpemUsIGFuZCB2aWV3IGRpc3RhbmNlLlxyXG4gICAgICAgIG1hdFByb2ouc2V0UGVyc3BlY3RpdmUoXHJcbiAgICAgICAgICAgIGZuYy50b1JhZGlhbihTRVRUSU5HUy5jYW1lcmFfZm92KSwgLy8gRk9WXHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCAvIGNhbnZhcy5oZWlnaHQsIC8vIEFTUEVDVCBSQVRJT1xyXG4gICAgICAgICAgICAwLjEsIDEwMC4wIC8vIFotTkVBUiAvIFotRkFSXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gR0xNOiBtYXRWaWV3UHJvaiA9IG1hdFByb2ogKiBtYXRWaWV3XHJcbiAgICAgICAgbWF0Vmlld1Byb2ogPSBtYXRQcm9qLm11bHRpcGx5KG1hdFZpZXcpO1xyXG5cclxuICAgICAgICAvLyBSZW5kZXJcclxuICAgICAgICBjYW52YXMud2lkdGggPSBjYW52YXMuY2xpZW50V2lkdGggKiBkZXZpY2VQaXhlbFJhdGlvO1xyXG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMuY2xpZW50SGVpZ2h0ICogZGV2aWNlUGl4ZWxSYXRpbztcclxuXHJcbiAgICAgICAgZ2wuY2xlYXJDb2xvcigwLjAyLCAwLjAyLCAwLjAyLCAxKTtcclxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XHJcbiAgICAgICAgZ2wuZW5hYmxlKGdsLkRFUFRIX1RFU1QpO1xyXG4gICAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpO1xyXG4gICAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spO1xyXG4gICAgICAgIGdsLmZyb250RmFjZShnbC5DQ1cpO1xyXG4gICAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSk7XHJcbiAgICAgICAgZ2wudW5pZm9ybU1hdHJpeDRmdihtYXRWaWV3UHJvalVuaWZvcm0sIGZhbHNlLCBtYXRWaWV3UHJvai5tYXQpO1xyXG5cclxuXHJcbiAgICAgICAgY3ViZXMuZm9yRWFjaCgoY3ViZSkgPT4ge1xyXG4gICAgICAgICAgICBjdWJlLnJvdGF0ZShkdCAqIGZuYy50b1JhZGlhbihTRVRUSU5HUy5vYmplY3Rfcm90YXRpb25fc3BlZWQpKTtcclxuICAgICAgICAgICAgY3ViZS5zY2FsZSA9IFNFVFRJTkdTLm9iamVjdF9zaXplO1xyXG4gICAgICAgICAgICBjdWJlLmRyYXcoZ2wsIG1hdFdvcmxkVW5pZm9ybSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGR0IGlzIHRoZSB0aW1lIHNwZW50IGJldHdlZW4gZWFjaCBpbWFnZS5cclxuICAgICAgICAvLyBmcHMgaXMgYSBmcmVxdWVuY3ksIGl0J3MgdGhlIGludmVydCBvZiBkdC5cclxuICAgICAgICBTRVRUSU5HUy5iZW5jaG1hcmtfZnBzID0gTWF0aC5jZWlsKDEgLyBkdCk7XHJcblxyXG4gICAgICAgIC8vIExvb3AgY2FsbHMsIGVhY2ggdGltZSB0aGUgZHJhd2luZyBpcyByZWFkeS5cclxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gICAgfTtcclxuICAgIC8vIEZpcnN0IGNhbGwsIGFzIHNvb24gYXMgdGhlIHBhZ2UgaXMgbG9hZGVkLlxyXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxuICAgIFNFVFRJTkdTLmJlbmNobWFya19sb2FkaW5nX3RpbWUgPSBEYXRlLm5vdygpIC0gVDA7XHJcbn1cclxuXHJcblxyXG5cclxudHJ5IHtcclxuICAgIG1haW4oKS50aGVuKCgpID0+IHtcclxuICAgICAgICBmbmMuc2hvd0Vycm9yKFwiTm8gRXJyb3JzISDwn4yeXCIpO1xyXG4gICAgfSlcclxuICAgIC5jYXRjaCgoZSkgPT4ge1xyXG4gICAgICAgIGZuYy5zaG93RXJyb3IoYFVuY2F1Z2h0IGFzeW5jIGV4Y2VwdGlvbjogJHtlfWApO1xyXG4gICAgfSlcclxufSBjYXRjaChlKSB7XHJcbiAgICBmbmMuc2hvd0Vycm9yKGBVbmNhdWdodCBzeW5jaHJvbm91cyBleGNlcHRpb246ICR7ZX1gKTtcclxufVxyXG4iLCJleHBvcnQgaW50ZXJmYWNlIE9iak1lc2gge1xyXG4gICAgdmVydGljZXM6IEZsb2F0MzJBcnJheTtcclxuICAgIGluZGljZXM6IFVpbnQxNkFycmF5O1xyXG4gICAgdXZzOiBGbG9hdDMyQXJyYXk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkT0JKKHVybDogc3RyaW5nKTogUHJvbWlzZTxPYmpNZXNoPiB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCk7XHJcbiAgICBjb25zdCB0ZXh0ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xyXG4gICAgY29uc3QgbGluZXMgPSB0ZXh0LnNwbGl0KFwiXFxuXCIpO1xyXG5cclxuICAgIGNvbnN0IHBvc2l0aW9uczogbnVtYmVyW10gPSBbXTtcclxuICAgIGNvbnN0IHV2czogbnVtYmVyW10gPSBbXTtcclxuICAgIGNvbnN0IGluZGljZXM6IG51bWJlcltdID0gW107XHJcbiAgICBjb25zdCBmaW5hbFZlcnRpY2VzOiBudW1iZXJbXSA9IFtdO1xyXG4gICAgY29uc3QgZmluYWxVVnM6IG51bWJlcltdID0gW107XHJcblxyXG4gICAgY29uc3QgdW5pcXVlVmVydGljZXMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpO1xyXG4gICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcclxuICAgICAgICBjb25zdCBwYXJ0cyA9IGxpbmUudHJpbSgpLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgaWYgKHBhcnRzWzBdID09PSAndicpIHtcclxuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4ucGFydHMuc2xpY2UoMSkubWFwKE51bWJlcikpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT09ICd2dCcpIHtcclxuICAgICAgICAgICAgdXZzLnB1c2goLi4ucGFydHMuc2xpY2UoMSkubWFwKE51bWJlcikpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGFydHNbMF0gPT09ICdmJykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSAzOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHBhcnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1bmlxdWVWZXJ0aWNlcy5oYXMoa2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFt2SW5kZXgsIHZ0SW5kZXhdID0ga2V5LnNwbGl0KCcvJykubWFwKGlkeCA9PiBwYXJzZUludChpZHgpIC0gMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluYWxWZXJ0aWNlcy5wdXNoKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnNbdkluZGV4ICogM10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uc1t2SW5kZXggKiAzICsgMV0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uc1t2SW5kZXggKiAzICsgMl1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbmFsVVZzLnB1c2goXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2c1t2dEluZGV4ICogMl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2c1t2dEluZGV4ICogMiArIDFdXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB1bmlxdWVWZXJ0aWNlcy5zZXQoa2V5LCBpbmRleCsrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaCh1bmlxdWVWZXJ0aWNlcy5nZXQoa2V5KSEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgdmVydGljZXM6IG5ldyBGbG9hdDMyQXJyYXkoZmluYWxWZXJ0aWNlcyksXHJcbiAgICAgICAgdXZzOiBuZXcgRmxvYXQzMkFycmF5KGZpbmFsVVZzKSxcclxuICAgICAgICBpbmRpY2VzOiBuZXcgVWludDE2QXJyYXkoaW5kaWNlcyksXHJcbiAgICB9O1xyXG59XHJcbiIsImltcG9ydCB7IFBhbmUgfSBmcm9tICd0d2Vha3BhbmUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IHBhbmUgPSBuZXcgUGFuZSh7dGl0bGU6ICdTZXR0aW5ncycsIGV4cGFuZGVkOiB0cnVlfSk7XHJcblxyXG5leHBvcnQgY29uc3QgU0VUVElOR1MgPSB7XHJcblxyXG4gICAgY2FtZXJhX2ZvdjogMzAuMCxcclxuXHJcbiAgICBvYmplY3Rfcm90YXRpb25fc3BlZWQ6IDEwLjAsXHJcbiAgICBvYmplY3Rfc2l6ZTogMC40LFxyXG5cclxuICAgIGJlbmNobWFya19mcHM6IDAuMCxcclxuICAgIGJlbmNobWFya19sb2FkaW5nX3RpbWU6IDAuMCxcclxuXHJcbiAgICBzb3VyY2VfZ2l0aHViOiAnaHR0cHM6Ly9naXRodWIuY29tL1ZhaGF6L1dlYkdMLUxlYXJuaW5nJ1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXQoKSB7XHJcblxyXG4gICAgLy8gQ0FNRVJBXHJcblxyXG4gICAgY29uc3QgZkNhbWVyYSA9IHBhbmUuYWRkRm9sZGVyKHt0aXRsZTogJ0NhbWVyYScsIGV4cGFuZGVkOiBmYWxzZX0pO1xyXG5cclxuICAgIGZDYW1lcmEuYWRkQmluZGluZyhTRVRUSU5HUywgJ2NhbWVyYV9mb3YnLCB7XHJcbiAgICAgICAgbGFiZWw6ICdGT1YnLFxyXG4gICAgICAgIG1pbjogMzAuMCxcclxuICAgICAgICBtYXg6IDEyMC4wLFxyXG4gICAgICAgIHN0ZXA6IDUuMFxyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gT0JKRUNUXHJcblxyXG4gICAgY29uc3QgZk9iamVjdCA9IHBhbmUuYWRkRm9sZGVyKHt0aXRsZTogJ09iamVjdCcsIGV4cGFuZGVkOiBmYWxzZX0pO1xyXG5cclxuICAgIGZPYmplY3QuYWRkQmluZGluZyhTRVRUSU5HUywgJ29iamVjdF9yb3RhdGlvbl9zcGVlZCcsIHtcclxuICAgICAgICBsYWJlbDogJ1IuIFNwZWVkJyxcclxuICAgICAgICBtaW46IDAuMCxcclxuICAgICAgICBtYXg6IDE4MC4wLFxyXG4gICAgICAgIHN0ZXA6IDEuMFxyXG4gICAgfSk7XHJcblxyXG4gICAgZk9iamVjdC5hZGRCaW5kaW5nKFNFVFRJTkdTLCAnb2JqZWN0X3NpemUnLCB7XHJcbiAgICAgICAgbGFiZWw6ICdTaXplJyxcclxuICAgICAgICBtaW46IDAuMSxcclxuICAgICAgICBtYXg6IDEuMCxcclxuICAgICAgICBzdGVwOiAwLjFcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEJFTkNITUFSS1xyXG5cclxuICAgIGNvbnN0IGZCZW5jaG1hcmsgPSBwYW5lLmFkZEZvbGRlcih7dGl0bGU6ICdUaW1lcnMnLCBleHBhbmRlZDogdHJ1ZX0pO1xyXG5cclxuICAgIGZCZW5jaG1hcmsuYWRkQmluZGluZyhTRVRUSU5HUywgJ2JlbmNobWFya19mcHMnLCB7XHJcbiAgICAgICAgbGFiZWw6ICdGUFMnLFxyXG4gICAgICAgIHJlYWRvbmx5OiB0cnVlLFxyXG4gICAgICAgIHZpZXc6ICd0ZXh0JyxcclxuICAgICAgICBpbnRlcnZhbDogNTAwXHJcbiAgICB9KTtcclxuXHJcbiAgICBmQmVuY2htYXJrLmFkZEJpbmRpbmcoU0VUVElOR1MsICdiZW5jaG1hcmtfbG9hZGluZ190aW1lJywge1xyXG4gICAgICAgIGxhYmVsOiAnTG9hZGluZyBUaW1lJyxcclxuICAgICAgICByZWFkb25seTogdHJ1ZSxcclxuICAgICAgICBmb3JtYXQ6ICh2YWx1ZTogbnVtYmVyKTogc3RyaW5nID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvRml4ZWQoMSkgKyAnbXMnO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNPVVJDRVxyXG5cclxuICAgIGNvbnN0IGZTb3VyY2UgPSBwYW5lLmFkZEZvbGRlcih7dGl0bGU6ICdTb3VyY2VzJywgZXhwYW5kZWQ6IGZhbHNlfSk7XHJcblxyXG4gICAgZlNvdXJjZS5hZGRCdXR0b24oe3RpdGxlOiAnU2VlIFJlcG8nLCBsYWJlbDogJ0dpdGh1Yid9KS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgd2luZG93Lm9wZW4oU0VUVElOR1Muc291cmNlX2dpdGh1YiwgJ19ibGFuaycpO1xyXG4gICAgfSk7XHJcbn07XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rd2ViZ2xcIl0gPSBzZWxmW1wid2VicGFja0NodW5rd2ViZ2xcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcImxpYlwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9tYWluLnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9