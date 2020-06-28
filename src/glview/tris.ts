import * as vec from './vecmath';
import * as glview from './glview';
import * as shaders from './shaders';
import * as vbo from './vbo';
import Lines from './lines';

class TrianglesDrawer implements glview.Drawable {
    private readonly shadingProgram: shaders.PointNormalsProgram;
    private readonly selectionProgram: shaders.PointsProgram;
    private readonly buffer: vbo.VertexNormalBuffer;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, buffer: vbo.VertexNormalBuffer, entity: object) {
        this.shadingProgram = shaders.PointNormalsProgram.get(gl);
        this.selectionProgram = shaders.PointsProgram.get(gl);
        this.buffer = buffer;
        this.entity = entity;
    }
    dispose() {
        this.buffer.dispose();
    }
    draw(rc: glview.RenderingContext) {
        this.shadingProgram.draw(rc, this.buffer, rc.gl.TRIANGLES);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.selectionProgram.draw(rc, this.buffer, rc.gl.TRIANGLES, session.emitColor3f(this.entity));
    }
}

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
        new TrianglesDrawer(gl, new vbo.PointsAndNormals(gl, this.points, this.normals), this.entity));
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
    private readonly pointNormals: Float32Array;
    private readonly boundary: vec.Sphere | undefined;
    private readonly entity: object;
    constructor(pointNormals: Float32Array, entity: object | null = null) {
        this.pointNormals = pointNormals;
        this.entity = entity === null ? this : entity;

        const builder = new vec.Box3Builder();
        for (let i = 0; i < this.pointCount; ++i) {
            builder.add(this.getPoint(i));
        }
        this.boundary = builder.build()?.boundingSphere();
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new TrianglesDrawer(gl, new vbo.InterleavedPointNormals(gl, this.pointNormals), this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
    get pointCount() {
        return this.pointNormals.length / 6;
    }
    getPoint(i: number): vec.Vec3 {
        return new vec.Vec3(this.pointNormals[6 * i + 0], this.pointNormals[6 * i + 1], this.pointNormals[6 * i + 2]);
    }
    get triangleCount() {
        return this.pointNormals.length / 6 / 3;
    }
    getTriangle(i: number) {
        return new vec.Triangle(this.getPoint(3 * i + 0), this.getPoint(3 * i + 1), this.getPoint(3 * i + 2));
    }
    toWireframe(): Lines {
        const points = new Float32Array(this.pointNormals.length);
        for (let i = 0; i < this.triangleCount; ++i) {
            for (let j = 0; j < 3; ++j) {
                const idx = 3 * i + j;
                const next = 3 * i + (j + 1) % 3;
                points[3 * (2 * idx + 0) + 0] = this.pointNormals[6 * idx + 0];
                points[3 * (2 * idx + 0) + 1] = this.pointNormals[6 * idx + 1];
                points[3 * (2 * idx + 0) + 2] = this.pointNormals[6 * idx + 2];
                points[3 * (2 * idx + 1) + 0] = this.pointNormals[6 * next + 0];
                points[3 * (2 * idx + 1) + 1] = this.pointNormals[6 * next + 1];
                points[3 * (2 * idx + 1) + 2] = this.pointNormals[6 * next + 2];
            }
        }
        return new Lines(points, this.entity);
    }
}
