//
// CLASS
//

export class Shape {
    private matWorld = new mat4();
    private scaleVec = new vec3();
    private rotation = new quat();

    constructor(
        private pos: vec3,
        private scale: number,
        private rotationAxis: vec3,
        private rotationAngle: number,
        public readonly vao: WebGLVertexArrayObject,
        public readonly numIndices: number
    ) { }

    rotate(angle: number) {
        this.rotationAngle = this.rotationAngle + angle;
    }

    draw(gl: WebGL2RenderingContext, matWorldUniform: WebGLUniformLocation) {
        this.rotation.setAxisAngle(this.rotationAxis, this.rotationAngle);
        this.scaleVec.set(this.scale, this.scale, this.scale);

        this.matWorld.setFromRotationTranslationScale(this.rotation, this.pos, this.scaleVec);

        gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld.mat);
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

}

export class vec3 {
    constructor(public x: number = 0.0, public y: number = 0.0, public z: number = 0.0) {}

    add(v: vec3): vec3 { return new vec3(this.x + v.x, this.y + v.y, this.z + v.z) }
    subtract(v: vec3): vec3 { return new vec3(this.x - v.x, this.y - v.y, this.z - v.z) }
    multiply(v: vec3): vec3 { return new vec3(this.x * v.x, this.y * v.y, this.z * v.z) }
    set(x: number, y: number, z: number): this {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }
    normalize(): vec3 {
        const len = Math.hypot(this.x, this.y, this.z);
        return len > 0 ? new vec3(this.x / len, this.y / len, this.z / len) : new vec3();
    }
    cross(v: vec3): vec3 {
        return new vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }
    dot(v: vec3): number { return this.x * v.x + this.y * v.y + this.z * v.z }
}

export class quat {
    constructor(
        public x: number = 0,
        public y: number = 0,
        public z: number = 0,
        public w: number = 1
    ) {}

    setAxisAngle(axis: vec3, angle: number): this {
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

export class mat4 {
    public mat: Float32Array;

    constructor() {
        this.mat = new Float32Array(16);
        this.identity();
    }

    identity(): this {
        const m = this.mat;
        m.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }

    copyFrom(mat: mat4): this {
        this.mat.set(mat.mat);
        return this;
    }


    /*
     *  x,  0,  0, 0
     *  0,  y,  0, 0
     *  0,  0,  z, 0
     * tx, ty, tz, 1
     */
    multiply(other: mat4): this {
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
    setPerspective(fovRad: number, aspect: number, near: number, far: number): this {
        const f = 1.0 / Math.tan(fovRad / 2);
        const nf = 1 / (near - far);
        const m = this.mat;
        m.set([
            f / aspect,     0,      0,                       0,
            0,              f,      0,                       0,
            0,              0,      (far + near) * nf,      -1,
            0,              0,      2*far*near*nf,           0
        ]);
        return this;
    }

    setLookAt(eye: vec3, center: vec3, up: vec3): this {
        const z = eye.subtract(center).normalize();
        const x = up.cross(z).normalize();
        const y = z.cross(x);
        const m = this.mat;
        m.set([
            x.x,            y.x,            z.x,            0,
            x.y,            y.y,            z.y,            0,
            x.z,            y.z,            z.z,            0,
            -x.dot(eye),    -y.dot(eye),    -z.dot(eye),    1
        ]);
        return this;
    }

    setFromRotationTranslationScale(q: quat, v: vec3, s: vec3): this {
        const x = q.x, y = q.y, z = q.z, w = q.w;
        const sx = s.x, sy = s.y, sz = s.z;

        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;
        const m = this.mat;
        m.set([
            (1 - (yy + zz)) * sx,         (xy + wz) * sx,       (xz - wy) * sx,     0,
            (xy - wz) * sy,   (1 - (xx + zz)) * sy,       (yz + wx) * sy,     0,
            (xz + wy) * sz,         (yz - wx) * sz, (1 - (xx + yy)) * sz,     0,
            v.x,                    v.y,                  v.z,     1
        ]);
        return this;
    }
}
