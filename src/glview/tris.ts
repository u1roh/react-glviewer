import * as vec from './vecmath';
import * as glview from './glview';

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

class TrianglesDrawerProgram {
    private static registry = new Map<WebGLRenderingContext, TrianglesDrawerProgram>();
    static get(gl: WebGLRenderingContext) {
        let instance = this.registry.get(gl);
        if (instance === undefined) {
            instance = new TrianglesDrawerProgram(gl);
            this.registry.set(gl, instance);
        }
        return instance;
    }

    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private atrPosition: number;
    private atrNormal: number;
    private uniModelViewMatrix: WebGLUniformLocation;
    private uniProjMatrix: WebGLUniformLocation;
    private constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.isWebGL2(gl) ? glview.createProgram(gl, vs2, fs2) : glview.createProgram(gl, vs, fs);
        this.atrPosition = gl.getAttribLocation(this.program, "position");
        this.atrNormal = gl.getAttribLocation(this.program, "normal");
        this.uniModelViewMatrix = gl.getUniformLocation(this.program, "modelViewMatrix")!;
        this.uniProjMatrix = gl.getUniformLocation(this.program, "projMatrix")!;
    }
    createBuffer(data: Float32Array): WebGLBuffer {
        const buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        return buf!;
    }
    draw(camera: glview.Camera, points: WebGLBuffer, normals: WebGLBuffer, count: number) {
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.uniModelViewMatrix, false, camera.modelViewMatrix);
        gl.uniformMatrix4fv(this.uniProjMatrix, false, camera.projectionMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, points);
        gl.enableVertexAttribArray(this.atrPosition);
        gl.vertexAttribPointer(this.atrPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, normals);
        gl.enableVertexAttribArray(this.atrNormal);
        gl.vertexAttribPointer(this.atrNormal, 3, gl.FLOAT, true, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, count);
    }
}

export class TrianglesDrawer implements glview.Drawable {
    private program: TrianglesDrawerProgram;
    private count: number;
    private points: WebGLBuffer;
    private normals: WebGLBuffer;
    private boundary: vec.Sphere;
    constructor(program: TrianglesDrawerProgram, points: Float32Array, normals: Float32Array) {
        if (points.length !== normals.length) throw new Error("points.length != normals.length");
        this.program = program;
        this.count = points.length / 3;
        this.points = program.createBuffer(points);
        this.normals = program.createBuffer(normals);
        this.boundary = vec.Box3.boundaryOf(points).boundingSphere();
    }
    draw(camera: glview.Camera) {
        this.program.draw(camera, this.points, this.normals, this.count);
    }
    boundingSphere(): vec.Sphere {
        return this.boundary;
    }
}

export class Triangles implements glview.DrawableSource {
    private points: Float32Array;
    private normals: Float32Array;
    constructor(points: Float32Array, normals: Float32Array) {
        this.points = points;
        this.normals = normals;
    }
    createDrawer(gl: WebGLRenderingContext) {
        return new TrianglesDrawer(TrianglesDrawerProgram.get(gl), this.points, this.normals);
    }
}