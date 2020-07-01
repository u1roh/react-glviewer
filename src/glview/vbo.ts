import * as glview from './glview';

export interface VertexBuffer extends glview.Dispose {
    gl: WebGLRenderingContext;
    vertexCount: number;
    enablePoints(atrPosition: number): void;
}

export interface VertexNormalBuffer extends VertexBuffer {
    enableNormals(atrPosition: number): void;
}

export interface VertexUVBuffer extends VertexBuffer {
    enableUVs(atrUV: number): void;
}

export function createPointsBuffer(
    gl: WebGLRenderingContext,
    points: Float32Array,
): VertexBuffer {
    return new Points(gl, points);
}

export function createPointsAndNormalsBuffer(
    gl: WebGLRenderingContext,
    points: Float32Array,
    normals: Float32Array
): VertexNormalBuffer {
    return new PointsAndNormals(gl, points, normals);
}

export function createInterleavedPointNormalsBuffer(
    gl: WebGLRenderingContext,
    pointNormals: Float32Array
): VertexNormalBuffer {
    return new InterleavedPointNormals(gl, pointNormals);
}

export function createInterleavedPointUVsBuffer(
    gl: WebGLRenderingContext,
    pointUVs: Float32Array
): VertexUVBuffer {
    return new InterleavedPointUVs(gl, pointUVs);
}

function createBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer | null {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return buf;
}

class Points implements VertexBuffer {
    readonly gl: WebGLRenderingContext;
    readonly points: WebGLBuffer | null;
    readonly vertexCount: number;
    constructor(gl: WebGLRenderingContext, points: Float32Array) {
        this.gl = gl;
        this.points = createBuffer(gl, points);
        this.vertexCount = points.length / 3;
    }
    dispose() {
        this.gl.deleteBuffer(this.points);
    }
    enablePoints(atrPosition: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.points);
        this.gl.enableVertexAttribArray(atrPosition);
        this.gl.vertexAttribPointer(atrPosition, 3, this.gl.FLOAT, false, 0, 0);
    }
}

class PointsAndNormals implements VertexNormalBuffer {
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

class InterleavedPointNormals implements VertexNormalBuffer {
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


class InterleavedPointUVs implements VertexUVBuffer {
    readonly gl: WebGLRenderingContext;
    readonly pointUVs: WebGLBuffer | null;
    readonly vertexCount: number;
    constructor(gl: WebGLRenderingContext, pointUVs: Float32Array) {
        this.gl = gl;
        this.pointUVs = createBuffer(gl, pointUVs);
        this.vertexCount = pointUVs.length / 5;
    }
    dispose() {
        this.gl.deleteBuffer(this.pointUVs);
    }
    enablePoints(atrPosition: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointUVs);
        this.gl.enableVertexAttribArray(atrPosition);
        this.gl.vertexAttribPointer(atrPosition, 3, this.gl.FLOAT, false, 4 * 5, 0);
    }
    enableUVs(atrUV: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointUVs);
        this.gl.enableVertexAttribArray(atrUV);
        this.gl.vertexAttribPointer(atrUV, 2, this.gl.FLOAT, false, 4 * 5, 4 * 3);
    }
}
