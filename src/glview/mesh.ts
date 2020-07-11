import { Points, PointsOf, PointNormals } from "./points";
import { Vec3, Point3 } from "./vecmath";
import { PointNormalsProgram } from "./shaders";
import * as glview from "./glview";

export class Facet {
    constructor(
        readonly v1: number,
        readonly v2: number,
        readonly v3: number
    ) { }
}

export class Facets {
    readonly indices: Int32Array;
    constructor(count: number) {
        this.indices = new Int32Array(3 * count);
    }
    get count() {
        return this.indices.length / 3;
    }
    get(i: number): Facet {
        return new Facet(
            this.indices[3 * i + 0],
            this.indices[3 * i + 1],
            this.indices[3 * i + 2]
        );
    }
    set(i: number, f: Facet) {
        this.indices[3 * i + 0] = f.v1;
        this.indices[3 * i + 1] = f.v2;
        this.indices[3 * i + 2] = f.v3;
    }
    readonly getIndexBuffer = glview.createCache((gl: WebGLRenderingContext) =>
        new IndexBuffer(gl, this.indices, gl.TRIANGLES));
}

class IndexBuffer implements glview.Dispose {
    readonly buffer: WebGLBuffer | null;
    readonly count: number;
    constructor(readonly gl: WebGLRenderingContext, indices: Int32Array, readonly mode: number) {
        this.count = indices.length;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }
    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
    drawElements() {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        this.gl.drawElements(this.mode, this.count, this.gl.UNSIGNED_INT, 0);
    }
}

export class Mesh<T extends Point3> {
    constructor(readonly points: PointsOf<T>) { }
}

export class Mesh2<T extends Points> {
    constructor(readonly facets: Facets, readonly points: T) { }
}
