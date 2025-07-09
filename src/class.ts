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

        gl.uniformMatrix4fv(matWorldUniform, false, this.matWorld.m);
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
    public m: Float32Array;

    constructor() {
        this.m = new Float32Array(16);
        this.identity();
    }

    identity(): this {
        const m = this.m;
        m.set([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return this;
    }

    copyFrom(mat: mat4): this {
        this.m.set(mat.m);
        return this;
    }

    
    /**
     *  x,  0,  0, 0
     *  0,  y,  0, 0
     *  0,  0,  z, 0
     * tx, ty, tz, 1
     */
    multiply(other: mat4): this {
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
    setPerspective(fovRad: number, aspect: number, near: number, far: number): this {
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

    setLookAt(eye: vec3, center: vec3, up: vec3): this {
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

    setFromRotationTranslationScale(q: quat, v: vec3, s: vec3): this {
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