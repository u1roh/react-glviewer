import * as vec from './vecmath';
import * as glview from './glview';
import * as vbo from './vbo';
import * as shaders from './shaders';

export interface PointNormals extends glview.DrawableSource {
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexNormalBuffer;
    count: number;
    getPoint(i: number): vec.Vec3;
    getNormal(i: number): vec.Vec3;
}

export function createInterleavedPointNormals(data: Float32Array, entity?: object): PointNormals {
    return new InterleavedPointNormals(data, entity);
}

export function createPointsAndNormals(points: Float32Array, normals: Float32Array, entity?: object): PointNormals {
    return new PointsAndNormals(points, normals, entity);
}

class InterleavedPointNormals implements PointNormals {
    readonly data: Float32Array;
    private readonly boundary: vec.Sphere | undefined;
    private readonly entity: object;
    constructor(data: Float32Array, entity?: object) {
        this.data = data;
        this.entity = entity || this;
        const builder = new vec.Box3Builder();
        for (let i = 0; i < this.count; ++i) {
            builder.add(this.getPoint(i));
        }
        this.boundary = builder.build()?.boundingSphere();
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new shaders.VertexNormalsDrawer(gl, this.createVertexBuffer(gl), gl.POINTS, this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexNormalBuffer {
        return vbo.createInterleavedPointNormalsBuffer(gl, this.data);
    }
    get count(): number {
        return this.data.length / 6;
    }
    getPoint(i: number): vec.Vec3 {
        return new vec.Vec3(this.data[6 * i + 0], this.data[6 * i + 1], this.data[6 * i + 2]);
    }
    getNormal(i: number): vec.Vec3 {
        return new vec.Vec3(this.data[6 * i + 3], this.data[6 * i + 4], this.data[6 * i + 5]);
    }
}

class PointsAndNormals implements PointNormals {
    private readonly points: Float32Array;
    private readonly normals: Float32Array;
    private readonly boundary: vec.Sphere | undefined;
    private readonly entity: object;
    constructor(points: Float32Array, normals: Float32Array, entity?: object) {
        if (points.length !== normals.length) throw new Error("points.length !== normals.length");
        this.points = points;
        this.normals = normals;
        this.entity = entity || this;
        this.boundary = vec.Box3.boundaryOf(points)?.boundingSphere();
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new shaders.VertexNormalsDrawer(gl, this.createVertexBuffer(gl), gl.POINTS, this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexNormalBuffer {
        return vbo.createPointsAndNormalsBuffer(gl, this.points, this.normals);
    }
    get count(): number {
        return this.points.length / 3;
    }
    getPoint(i: number): vec.Vec3 {
        return new vec.Vec3(this.points[3 * i + 0], this.points[3 * i + 1], this.points[3 * i + 2]);
    }
    getNormal(i: number): vec.Vec3 {
        return new vec.Vec3(this.normals[3 * i + 0], this.normals[3 * i + 1], this.normals[3 * i + 2]);
    }
}
