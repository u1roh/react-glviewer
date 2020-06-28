import * as vec from './vecmath';
import * as glview from './glview';
import * as shaders from './shaders';
import * as vbo from './vbo';
import * as points from './points';
import Lines from './lines';

export class TrianglesBy2Arrays implements glview.DrawableSource {
    private readonly points: Float32Array;
    private readonly normals: Float32Array;
    private readonly boundary: vec.Sphere | undefined;
    private readonly entity: object;
    constructor(points: Float32Array, normals: Float32Array, entity: object | null = null) {
        this.points = points;
        this.normals = normals;
        this.boundary = vec.Box3.boundaryOf(points)?.boundingSphere();
        this.entity = entity === null ? this : entity;
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new shaders.VertexNormalsDrawer(
            gl,
            vbo.createPointsAndNormalsBuffer(gl, this.points, this.normals),
            gl.TRIANGLES,
            this.entity
        ));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
    triangleCount() {
        return this.points.length / 3 / 3;
    }
    getTriangle(i: number) {
        const p1 = new vec.Vec3(this.points[9 * i + 0], this.points[9 * i + 1], this.points[9 * i + 2]);
        const p2 = new vec.Vec3(this.points[9 * i + 3], this.points[9 * i + 4], this.points[9 * i + 5]);
        const p3 = new vec.Vec3(this.points[9 * i + 6], this.points[9 * i + 7], this.points[9 * i + 8]);
        return new vec.Triangle(p1, p2, p3);
    }
    toWireframe(): Lines {
        const points = new Float32Array(2 * this.points.length);
        for (let i = 0; i < this.triangleCount(); ++i) {
            for (let j = 0; j < 3; ++j) {
                const idx = 3 * i + j;
                const next = 3 * i + (j + 1) % 3;
                points[3 * (2 * idx + 0) + 0] = this.points[3 * idx + 0];
                points[3 * (2 * idx + 0) + 1] = this.points[3 * idx + 1];
                points[3 * (2 * idx + 0) + 2] = this.points[3 * idx + 2];
                points[3 * (2 * idx + 1) + 0] = this.points[3 * next + 0];
                points[3 * (2 * idx + 1) + 1] = this.points[3 * next + 1];
                points[3 * (2 * idx + 1) + 2] = this.points[3 * next + 2];
            }
        }
        return new Lines(points, this.entity);
    }
}

export default class Triangles implements glview.DrawableSource {
    readonly vertices: points.PointNormals;
    private readonly entity: object;
    constructor(vertices: points.PointNormals, entity: object | null = null) {
        this.vertices = vertices;
        this.entity = entity === null ? this : entity;
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new shaders.VertexNormalsDrawer(
            gl,
            this.vertices.createVertexBuffer(gl),
            gl.TRIANGLES,
            this.entity
        ));
    boundingSphere(): vec.Sphere | undefined {
        return this.vertices.boundingSphere();
    }
    get triangleCount() {
        return this.vertices.count / 3;
    }
    getTriangle(i: number) {
        return new vec.Triangle(
            this.vertices.getPoint(3 * i + 0),
            this.vertices.getPoint(3 * i + 1),
            this.vertices.getPoint(3 * i + 2));
    }
    toWireframe(): Lines {
        const points = new Float32Array(2 * 3 * this.vertices.count);
        for (let i = 0; i < this.triangleCount; ++i) {
            for (let j = 0; j < 3; ++j) {
                const idx = 3 * i + j;
                const next = 3 * i + (j + 1) % 3;
                points[3 * (2 * idx + 0) + 0] = this.vertices.data[6 * idx + 0];
                points[3 * (2 * idx + 0) + 1] = this.vertices.data[6 * idx + 1];
                points[3 * (2 * idx + 0) + 2] = this.vertices.data[6 * idx + 2];
                points[3 * (2 * idx + 1) + 0] = this.vertices.data[6 * next + 0];
                points[3 * (2 * idx + 1) + 1] = this.vertices.data[6 * next + 1];
                points[3 * (2 * idx + 1) + 2] = this.vertices.data[6 * next + 2];
            }
        }
        return new Lines(points, this.entity);
    }
}
