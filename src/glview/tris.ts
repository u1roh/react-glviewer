import * as vec from './vecmath';
import * as glview from './glview';
import Lines from './lines';

const vs = `
attribute vec4 position;
attribute vec3 normal;
varying vec3 fPos;
varying vec3 fNrm;
uniform mat4 modelViewMatrix;
uniform mat4 projMatrix;
void main() {
    vec4 pos = modelViewMatrix * position;
    fPos = pos.xyz;
    fNrm = mat3(modelViewMatrix) * normal;
    gl_Position = projMatrix * pos;
}
`;

const fs = `
precision mediump float;
varying vec3 fPos;
varying vec3 fNrm;
void main(){
    vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);
    float shininess = 1.0;
    float ambient = 0.1;
    vec3 col = vec3(0.0, 0.8, 0.0);

    vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);
    vec3 nrm = normalize(fNrm);
    float diffuse = max(dot(light, nrm), 0.0);
    float specular = 0.0; // pow(max(dot(nrm, normalize(light - normalize(fPos))), 0.0), shininess);

    gl_FragColor = vec4((diffuse + specular + ambient) * col, 1);
}
`;

const vs2 = `#version 300 es
in vec4 position;
in vec3 normal;
out vec3 fPos;
out vec3 fNrm;
uniform mat4 modelViewMatrix;
uniform mat4 projMatrix;
void main() {
    vec4 pos = modelViewMatrix * position;
    fPos = pos.xyz;
    fNrm = mat3(modelViewMatrix) * normal;
    gl_Position = projMatrix * pos;
}
`;

const fs2 = `#version 300 es
precision mediump float;
in vec3 fPos;
in vec3 fNrm;
out vec4 color;
void main(){
    vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);
    float shininess = 1.0;
    float ambient = 0.1;
    vec3 col = vec3(0.0, 0.8, 0.0);

    vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);
    vec3 nrm = normalize(fNrm);
    float diffuse = max(dot(light, nrm), 0.0);
    float specular = 0.0; // pow(max(dot(nrm, normalize(light - normalize(fPos))), 0.0), shininess);

    color = vec4((diffuse + specular + ambient) * col, 1);
}
`;

const no_shading_vs = `
attribute vec4 position;
uniform mat4 modelViewMatrix;
uniform mat4 projMatrix;
void main() {
    gl_Position = projMatrix * modelViewMatrix * position;
}
`;

const no_shading_fs = `
precision mediump float;
uniform vec3 color;
void main(){
    gl_FragColor = vec4(color, 1);
}
`;

class TrianglesShadingProgram {
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly atrNormal: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.isWebGL2(gl) ? glview.createProgram(gl, vs2, fs2) : glview.createProgram(gl, vs, fs);
        this.atrPosition = gl.getAttribLocation(this.program, "position");
        this.atrNormal = gl.getAttribLocation(this.program, "normal");
        this.uniModelViewMatrix = gl.getUniformLocation(this.program, "modelViewMatrix")!;
        this.uniProjMatrix = gl.getUniformLocation(this.program, "projMatrix")!;
    }
    draw(rc: glview.RenderingContext, points: WebGLBuffer, normals: WebGLBuffer, count: number) {
        if (rc.gl !== this.gl) throw new Error("TrianglesDrawerProgram: GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        rc.glUniformModelViewMatrix(this.uniModelViewMatrix);
        rc.glUniformProjectionMatrix(this.uniProjMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, points);
        gl.enableVertexAttribArray(this.atrPosition);
        gl.vertexAttribPointer(this.atrPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, normals);
        gl.enableVertexAttribArray(this.atrNormal);
        gl.vertexAttribPointer(this.atrNormal, 3, gl.FLOAT, true, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
    drawInterleaved(rc: glview.RenderingContext, pointNormals: WebGLBuffer, count: number) {
        if (rc.gl !== this.gl) throw new Error("TrianglesDrawerProgram: GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        rc.glUniformModelViewMatrix(this.uniModelViewMatrix);
        rc.glUniformProjectionMatrix(this.uniProjMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, pointNormals);
        gl.enableVertexAttribArray(this.atrPosition);
        gl.vertexAttribPointer(this.atrPosition, 3, gl.FLOAT, false, 4 * 6, 0);

        //gl.bindBuffer(gl.ARRAY_BUFFER, pointNormals);
        gl.enableVertexAttribArray(this.atrNormal);
        gl.vertexAttribPointer(this.atrNormal, 3, gl.FLOAT, true, 4 * 6, 4 * 3);

        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
}

class TrianglesNoShadingProgram {
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    private readonly uniColor: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.createProgram(gl, no_shading_vs, no_shading_fs);
        this.atrPosition = gl.getAttribLocation(this.program, "position");
        this.uniModelViewMatrix = gl.getUniformLocation(this.program, "modelViewMatrix")!;
        this.uniProjMatrix = gl.getUniformLocation(this.program, "projMatrix")!;
        this.uniColor = gl.getUniformLocation(this.program, "color")!;
    }
    draw(rc: glview.RenderingContext, points: WebGLBuffer, count: number, color3f: glview.Color3) {
        if (rc.gl !== this.gl) throw new Error("TrianglesDrawerProgram: GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        gl.uniform3f(this.uniColor, color3f.r, color3f.g, color3f.b);
        rc.glUniformModelViewMatrix(this.uniModelViewMatrix);
        rc.glUniformProjectionMatrix(this.uniProjMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, points);
        gl.enableVertexAttribArray(this.atrPosition);
        gl.vertexAttribPointer(this.atrPosition, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
    drawInterleaved(rc: glview.RenderingContext, pointNormals: WebGLBuffer, count: number, color3f: glview.Color3) {
        if (rc.gl !== this.gl) throw new Error("TrianglesDrawerProgram: GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        gl.uniform3f(this.uniColor, color3f.r, color3f.g, color3f.b);
        rc.glUniformModelViewMatrix(this.uniModelViewMatrix);
        rc.glUniformProjectionMatrix(this.uniProjMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, pointNormals);
        gl.enableVertexAttribArray(this.atrPosition);
        gl.vertexAttribPointer(this.atrPosition, 3, gl.FLOAT, false, 4 * 6, 0);

        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
}

class TrianglesDrawerPrograms {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new TrianglesDrawerPrograms(gl));
    readonly gl: WebGLRenderingContext;
    readonly shading: TrianglesShadingProgram;
    readonly noShading: TrianglesNoShadingProgram;
    private constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.shading = new TrianglesShadingProgram(gl);
        this.noShading = new TrianglesNoShadingProgram(gl);
    }
    createBuffer(data: Float32Array): WebGLBuffer {
        const buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        return buf!;
    }
}

class TrianglesDrawer implements glview.Drawable {
    private readonly programs: TrianglesDrawerPrograms;
    private readonly count: number;
    private readonly points: WebGLBuffer;
    private readonly normals: WebGLBuffer;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, points: Float32Array, normals: Float32Array, entity: object) {
        if (points.length !== normals.length) throw new Error("points.length != normals.length");
        this.programs = TrianglesDrawerPrograms.get(gl);
        this.count = points.length / 3;
        this.points = this.programs.createBuffer(points);
        this.normals = this.programs.createBuffer(normals);
        this.entity = entity;
    }
    dispose() {
        this.programs.gl.deleteBuffer(this.points);
        this.programs.gl.deleteBuffer(this.normals);
    }
    draw(rc: glview.RenderingContext) {
        this.programs.shading.draw(rc, this.points, this.normals, this.count);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.programs.noShading.draw(rc, this.points, this.count, session.emitColor3f(this.entity));
    }
}

export class Triangles1 implements glview.DrawableSource {
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
        new TrianglesDrawer(gl, this.points, this.normals, this.entity));
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

// ---------------------------------------------------------------------

class TrianglesDrawer2 implements glview.Drawable {
    private readonly programs: TrianglesDrawerPrograms;
    private readonly count: number;
    private readonly pointNormals: WebGLBuffer;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, pointNormals: Float32Array, entity: object) {
        this.programs = TrianglesDrawerPrograms.get(gl);
        this.count = pointNormals.length / 6;
        this.pointNormals = this.programs.createBuffer(pointNormals);
        this.entity = entity;
    }
    dispose() {
        this.programs.gl.deleteBuffer(this.pointNormals);
    }
    draw(rc: glview.RenderingContext) {
        this.programs.shading.drawInterleaved(rc, this.pointNormals, this.count);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.programs.noShading.drawInterleaved(rc, this.pointNormals, this.count, session.emitColor3f(this.entity));
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
        new TrianglesDrawer2(gl, this.pointNormals, this.entity));
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
