import * as glview from './glview';

export interface VertexBuffer extends glview.Dispose {
    gl: WebGLRenderingContext;
    vertexCount: number;
    enablePoints(atrPosition: number): void;
}

export interface VertexNormalBuffer extends VertexBuffer {
    enableNormals(atrPosition: number): void;
}

function createBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer | null {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buf;
}

export class PointsAndNormals implements VertexNormalBuffer {
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

export class InterleavedPointNormals implements VertexNormalBuffer {
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
