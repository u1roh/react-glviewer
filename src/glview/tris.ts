import * as vec from './vecmath';
import * as glview from './glview';
import * as shaders from './shaders';
import Lines from './lines';

class TrianglesDrawer implements glview.Drawable {
    private readonly shadingProgram: shaders.PointNormalsProgram;
    private readonly selectionProgram: shaders.PointsProgram;
    private readonly buffer: shaders.VertexBuffer;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, buffer: shaders.VertexBuffer, entity: object) {
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

function createBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer | null {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buf;
}

class PointsAndNormals implements shaders.VertexBuffer {
    readonly gl: WebGLRenderingContext;
    readonly points: WebGLBuffer | null;
    readonly normals: WebGLBuffer | null;
    readonly vertexCount: number;
    constructor(gl: WebGLRenderingContext, points: Float32Array, normals: Float32Array) {
        if (points.length !== normals.length) throw new Error("points.length != normals.length");
        this.gl = gl;
        this.points = createBuffer(gl, points);
        this.normals = createBuffer(gl, normals);
        this.vertexCount = points.length / 3;
    }
    dispose() {
        this.gl.deleteBuffer(this.points);
        this.gl.deleteBuffer(this.normals);
    }
    enablePoints(atrPosition: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.points);
        this.gl.enableVertexAttribArray(atrPosition);
        this.gl.vertexAttribPointer(atrPosition, 3, this.gl.FLOAT, false, 0, 0);
    }
    enableNormals(atrNormal: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normals);
        this.gl.enableVertexAttribArray(atrNormal);
        this.gl.vertexAttribPointer(atrNormal, 3, this.gl.FLOAT, true, 0, 0);
    }
}

class InterleavedPointNormals implements shaders.VertexBuffer {
    readonly gl: WebGLRenderingContext;
    readonly pointNormals: WebGLBuffer | null;
    readonly vertexCount: number;
    constructor(gl: WebGLRenderingContext, pointNormals: Float32Array) {
        this.gl = gl;
        this.pointNormals = createBuffer(gl, pointNormals);
        this.vertexCount = pointNormals.length / 6;
    }
    dispose() {
        this.gl.deleteBuffer(this.pointNormals);
    }
    enablePoints(atrPosition: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointNormals);
        this.gl.enableVertexAttribArray(atrPosition);
        this.gl.vertexAttribPointer(atrPosition, 3, this.gl.FLOAT, false, 4 * 6, 0);
    }
    enableNormals(atrNormal: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointNormals);
        this.gl.enableVertexAttribArray(atrNormal);
        this.gl.vertexAttribPointer(atrNormal, 3, this.gl.FLOAT, true, 4 * 6, 4 * 3);
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
        new TrianglesDrawer(gl, new PointsAndNormals(gl, this.points, this.normals), this.entity));
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
        new TrianglesDrawer(gl, new InterleavedPointNormals(gl, this.pointNormals), this.entity));
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
