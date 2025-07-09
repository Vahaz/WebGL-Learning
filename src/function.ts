//
// FUNCTION
//

// Display an error message to the HTML Element with id "error-container".
export function showError(msg: string): void {
    const container = document.getElementById("error-container");
    if(container === null) return console.log("No Element with ID: error-container");
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

export async function loadImage(url: string): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = url;
    return image;
}

// Return the WebGL Context from the Canvas Element.
export function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
    return canvas.getContext('webgl2') as WebGL2RenderingContext ;
}

// Convert from degrees to radiant.
export function toRadian(angle: number): number {
    return angle * Math.PI / 180;
}

/**
 * Create a WebGL Buffer type. (Opaque Handle)
 * - STATIC_DRAW : wont update often, but often used.
 * - ARRAY_BUFFER : indicate the place to store the Array.
 * - ELEMENT_ARRAY_BUFFER : Used for indices with cube shapes drawing.
 * Bind the Buffer to the CPU, add the Array to the Buffer and Clear after use.
 */
export function createStaticBuffer(gl: WebGL2RenderingContext, data: ArrayBuffer, isIndice: boolean): WebGLBuffer {
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
export function createVAOBuffer(
    gl: WebGL2RenderingContext,
    vertexBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, texBuffer: WebGLBuffer,
    posAttrib: number, texAttrib: number
): WebGLVertexArrayObject {
    const vao = gl.createVertexArray();
    if(!vao) { showError("Failed to allocate VAO buffer."); return 0; }
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