import { Points } from "./points";
import * as vec from "./vecmath";
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
        new glview.IndexBuffer(gl, this.indices, gl.TRIANGLES));
}

export class Mesh<T extends Points> implements glview.DrawableSource {
    readonly entity: object;
    constructor(readonly facets: Facets, readonly points: T, entity?: object) {
        this.entity = entity || this;
    }
    boundingSphere(): vec.Sphere | undefined {
        return this.points.boundingSphere();
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        this.points.createDrawer(gl, this.facets.getIndexBuffer(gl), this.entity));
}
