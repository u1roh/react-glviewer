import * as vec from './vecmath';
import * as glview from './glview';
import * as vbo from './vbo';
import * as shaders from './shaders';

export interface Points extends glview.DrawableSource {
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexBuffer;
    createDrawer(gl: WebGLRenderingContext, mode: number | glview.IndexBuffer, entity: object): glview.Drawable;
    count: number;
    posAt(i: number): vec.Vec3;
}

export interface PointsOf<P extends vec.Point3> extends Points {
    get(i: number): P;
    set(i: number, point: P): void;
}

export interface PointNormals extends PointsOf<vec.PointNormal> {
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexNormalBuffer;
    normalAt(i: number): vec.Vec3;
}

export function createInterleavedPointNormals(data: Float32Array, entity?: object): PointNormals {
    return new InterleavedPointNormals(data, entity);
}

export function createPointsAndNormals(points: Float32Array, normals: Float32Array, entity?: object): PointNormals {
    return new PointsAndNormals(points, normals, entity);
}

class InterleavedPointNormals implements PointNormals {
    private readonly boundary: vec.Sphere | undefined;
    private readonly entity: object;
    constructor(readonly data: Float32Array, entity?: object) {
        this.entity = entity || this;
        const builder = new vec.Box3Builder();
        for (let i = 0; i < this.count; ++i) {
            builder.add(this.posAt(i));
        }
        this.boundary = builder.build()?.boundingSphere();
    }
    createDrawer(gl: WebGLRenderingContext, mode: number | glview.IndexBuffer, entity: object): glview.Drawable {
        return new shaders.VertexNormalsDrawer(gl, this.createVertexBuffer(gl), mode, entity);
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) => this.createDrawer(gl, gl.POINTS, this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexNormalBuffer {
        return vbo.createInterleavedPointNormalsBuffer(gl, this.data);
    }
    get count(): number {
        return this.data.length / 6;
    }
    get(i: number): vec.PointNormal {
        return new vec.PointNormal(this.posAt(i), this.normalAt(i))
    }
    set(i: number, point: vec.PointNormal): void {
        this.data[6 * i + 0] = point.pos.x;
        this.data[6 * i + 1] = point.pos.y;
        this.data[6 * i + 2] = point.pos.z;
        this.data[6 * i + 3] = point.nrm.x;
        this.data[6 * i + 4] = point.nrm.y;
        this.data[6 * i + 5] = point.nrm.z;
    }
    posAt(i: number): vec.Vec3 {
        return new vec.Vec3(this.data[6 * i + 0], this.data[6 * i + 1], this.data[6 * i + 2]);
    }
    normalAt(i: number): vec.Vec3 {
        return new vec.Vec3(this.data[6 * i + 3], this.data[6 * i + 4], this.data[6 * i + 5]);
    }
}

class PointsAndNormals implements PointNormals {
    private readonly boundary: vec.Sphere | undefined;
    private readonly entity: object;
    constructor(readonly points: Float32Array, readonly normals: Float32Array, entity?: object) {
        if (points.length !== normals.length) throw new Error("points.length !== normals.length");
        this.entity = entity || this;
        this.boundary = vec.Box3.boundaryOf(points)?.boundingSphere();
    }
    createDrawer(gl: WebGLRenderingContext, mode: number | glview.IndexBuffer, entity: object): glview.Drawable {
        return new shaders.VertexNormalsDrawer(gl, this.createVertexBuffer(gl), mode, entity);
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) => this.createDrawer(gl, gl.POINTS, this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexNormalBuffer {
        return vbo.createPointsAndNormalsBuffer(gl, this.points, this.normals);
    }
    get count(): number {
        return this.points.length / 3;
    }
    get(i: number): vec.PointNormal {
        return new vec.PointNormal(this.posAt(i), this.normalAt(i));
    }
    set(i: number, point: vec.PointNormal): void {
        this.points[3 * i + 0] = point.pos.x;
        this.points[3 * i + 1] = point.pos.y;
        this.points[3 * i + 2] = point.pos.z;
        this.normals[3 * i + 0] = point.nrm.x;
        this.normals[3 * i + 1] = point.nrm.y;
        this.normals[3 * i + 2] = point.nrm.z;
    }
    posAt(i: number): vec.Vec3 {
        return new vec.Vec3(this.points[3 * i + 0], this.points[3 * i + 1], this.points[3 * i + 2]);
    }
    normalAt(i: number): vec.Vec3 {
        return new vec.Vec3(this.normals[3 * i + 0], this.normals[3 * i + 1], this.normals[3 * i + 2]);
    }
}
