//
// FUNCTION
//

// Display an error message to the HTML Element with id "error".
export function showError(msg: string = "No Data"): void {
    const container = document.getElementById("error");
    if(container === null) return console.log("No Element with ID: error");
    const element = document.createElement('p');
    element.innerText = msg;
    container.appendChild(element);
    console.log(msg);
}

// Get shaders source code.
export async function getShaderSource(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error while loading shader code at "${url}": ${response.statusText}`);
    }
    return response.text();
}

export async function getImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
    })
}

// Return the WebGL Context from the Canvas Element.
export function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    return canvas.getContext('webgl2') as WebGL2RenderingContext ;
}

// Convert from degrees to radiant.
export function toRadian(angle: number): number {
    return angle * Math.PI / 180;
}

/* Create a WebGL Buffer type. (Opaque Handle)
 * - STATIC_DRAW : won't update often, but often used.
 * - ARRAY_BUFFER : indicate the place to store the Array.
 * - ELEMENT_ARRAY_BUFFER : Used for indices with cube shape drawing.
 * Bind the Buffer to the CPU, add the Array to the Buffer and Clear after use.
 */
export function createStaticBuffer(
    gl: WebGL2RenderingContext,
    data: ArrayBuffer | Uint16Array<ArrayBufferLike> | Float32Array<ArrayBufferLike>,
    isIndice: boolean
): WebGLBuffer {
    const buffer = gl.createBuffer();
    const type = (isIndice == true) ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER
    if(!buffer) {
        showError("Failed to allocate buffer space");
        return 0;
    }

    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);
    gl.bindBuffer(type, null);
    return buffer
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
export function createVAOBuffer(
    gl: WebGL2RenderingContext,
    vertexBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, uvBuffer: WebGLBuffer,
    posAttrib: number, uvAttrib: number
): WebGLVertexArrayObject {
    const vao = gl.createVertexArray();
    if(!vao) { showError("Failed to allocate VAO buffer."); return 0; }
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
export function createProgram(
    gl: WebGL2RenderingContext,
    vertexShaderSrc: string,
    fragmentShaderSrc: string
): WebGLProgram {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    const program = gl.createProgram();

    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(vertexShader);
        showError(error || "No shader debug log provided.");
        return 0;
    }

    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(fragmentShader);
        showError(error || "No shader debug log provided.");
        return 0;
    }

    // Program set up for Uniforms.
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
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
export async function loadTexture(gl: WebGL2RenderingContext, textures: string[]) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, 128, 128, textures.length);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const images = await Promise.all(textures.map(src => getImage(src)));
    for (let i = 0; i < images.length; i++) {
        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
    }

    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}
