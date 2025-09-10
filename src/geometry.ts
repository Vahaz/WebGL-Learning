// Vertex buffer format: XYZ

//
// Cube geometry
// taken from: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Creating_3D_objects_using_WebGL
export const CUBE_VERTICES = new Float32Array([
  // Front face
  -1.0, -1.0, 1.0,  // 0 A
  1.0, -1.0, 1.0,   // 1 B
  1.0, 1.0, 1.0,    // 2 C
  -1.0, 1.0, 1.0,   // 3 D

  // Back face
  -1.0, -1.0, -1.0, // 4
  -1.0, 1.0, -1.0,  // 5
  1.0, 1.0, -1.0,   // 6
  1.0, -1.0, -1.0,  // 7

  // Top face
  -1.0, 1.0, -1.0,  // 8
  -1.0, 1.0, 1.0,   // 9
  1.0, 1.0, 1.0,    // 10
  1.0, 1.0, -1.0,   // 11

  // Bottom face
  -1.0, -1.0, -1.0, // 12
  1.0, -1.0, -1.0,  // 13
  1.0, -1.0, 1.0,   // 14
  -1.0, -1.0, 1.0,  // 15

  // Right face
  1.0, -1.0, -1.0,  // 16
  1.0, 1.0, -1.0,   // 17
  1.0, 1.0, 1.0,    // 18
  1.0, -1.0, 1.0,   // 19

  // Left face
  -1.0, -1.0, -1.0, // 20
  -1.0, -1.0, 1.0,  // 21
  -1.0, 1.0, 1.0,   // 22
  -1.0, 1.0, -1.0,  // 23
]);

export const CUBE_INDICES = new Uint16Array([
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

export const UV_DATA = new Float32Array([
  0,0,   1,0,    1,1,    0,1,   // front
  0,0,   1,0,    1,1,    0,1,   // back
  0,0,   1,0,    1,1,    0,1,   // top
  0,0,   1,0,    1,1,    0,1,   // bottom
  0,0,   1,0,    1,1,    0,1,   // right
  0,0,   1,0,    1,1,    0,1,   // left
])