# Development Journey! 💻

## 0️⃣ Before

> [!TIP]  
> Read the [README](README.md) file; it contains all the links that made this possible!

I'm not a writer, so this might not be 100% accurate. That is why I advise checking the linked tutorials / documentation to learn more about the subject.  
We are working with **WebGL** (Web Graphics Library), which, as **MDN Web Docs** says *"WebGL [...] is a JavaScript API [...] to create 3D and 2D graphics within any compatible web browser without the use of plug-ins"*. We are also using **HTML** (Hypertext Markup Language), and **Typescript**, a strongly typed programming language that builds on JavaScript.  

## 1️⃣ Basics

> [!NOTE]  
> The GPU is strong at parallel tasks / multi-tasking and uses **Shaders** to control the **Rendering Pipeline**. Different Graphics APIs (*OpenGL, WebGL, DirextX, Vulkan, etc*) allow us to communicate with the GPU.

A simplified view of the **Rendering Pipeline**:
- **Vertices**: Coordinates of each vertices.
- **Vertex shader**: Vertices location, color or texture sent to the GPU.
- **Rasterize**: Which pixel within the perimeter of the vertices needs to be colored.
- **Fragment shader**: Color the canvas.
- **Final display**: Render the final canvas.

`index.html` contains a `<canvas>` and `<div>` elements. The DIV is named **error-container** and linked to the `showError` function in [function.ts](/src/function.ts). It displays any errors directly on the page.  
In [main.ts](/src/main.ts) you need to get the canvas element, and check if the WebGL2 context is supported by your browser.

To render a triangle/point on screen, we need some steps:  
- **Create, Bind and Attribute a Vertex Buffer** to store positions, colors and attributes.
- **Create a [vertex_shader](/shaders/vertex_shader.vert)** to place our element and define its size, rotation, etc using buffer data.
- **Create a [fragment_shader](/shaders/fragment_shader.frag)** to define the final color using the buffer data.
- **Create a Program** to attach, link, and use our shaders.
- **Draw** the element on screen.

You can evolve this with more complex shaders (like light!) or further functions and steps to automate this process.

## 2️⃣ Animation 🔁

> [!NOTE]  
> Watch: [[02] WebGL Tutorial - Movement and Color](https://youtu.be/lLa6XkVLj0w)

To add animation or movement, we need a `frame` function, called each frame using `requestAnimationFrame()` function. This lets us change the size or add movement to our rendered shapes.  
We calculate the `delta time` (dt) using the **NodeJS** `performance.now()` to get the time spent between this frame and the last one in `ms`.   

## 3️⃣ Matrices

> [!WARNING]  
> Matrices, Vector and Quarternions are tricky and time-consuming to understand. Libraries are available like [glMatrix](https://glmatrix.net/) to ease the process.

> [!NOTE]  
> To understand Matrices, I suggest these videos from **pikuma**: ["Math for Game Developers: Why do we use 4x4 Matrices in 3D Graphics?"](https://youtu.be/Do_vEjd6gF0), ["Matrix Multiplication (A Simple Review)"](https://youtu.be/UG530eh8q4A), and [Perspective Projection Matrix (Math for Game Developers)](https://youtu.be/EqNcqBdrNyI)

Matrices can feel abstract to understand. In [class.ts](/src/class.ts), we start with a Vector3 class to store 3 coordinates. The Quaternion is used as a replacement of 3x3 / 4x4 matrices to avoid **Gimbal Lock** with rotation. Matrices, on the other hand, transform the world and camera space, handle scaling, object translation, and more.

## 4️⃣ A world in 3D

> [!NOTE]  
> Watch: [[03] WebGL Tutorial - Intro to 3D](https://youtu.be/_GSCxcmJ06A), [WebGL 2.0 by Andrew Adamson](https://youtube.com/playlist?list=PLPbmjY2NVO_X1U1JzLxLDdRn4NmtxyQQo), and [WebGL 2: Textures (Part 1)](https://youtu.be/0nZn5YPNf5k)

[geometry.ts](/src/geometry.ts) contains the vertices, indices location, and texture UVs. Overlapping tends to happen with complex shapes (*like squares*). So, **indices** are used to specify the drawing order to avoid having vertices on the same coordinates.

In the [vertex_shader](/shaders/vertex_shader.vert) a `texture function` is used to display texture instead of color.  
This function receives two arguments: **sampler** is used to convert an image into colorful pixels, and **texture_coord** is used to choose the texture with the [u, v] floats. These arguments are not used and their values are defaulted by WebGL. (Note: This function can be multiplied by other textures to blend them in.)