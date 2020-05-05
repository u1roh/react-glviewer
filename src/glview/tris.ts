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
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private atrPosition: number;
    private atrNormal: number;
    private uniModelViewMatrix: WebGLUniformLocation;
    private uniProjMatrix: WebGLUniformLocation;
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
}

class TrianglesNoShadingProgram {
    private gl: WebGLRenderingContext;
    private program: WebGLProgram;
    private atrPosition: number;
    private uniModelViewMatrix: WebGLUniformLocation;
    private uniProjMatrix: WebGLUniformLocation;
    private uniColor: WebGLUniformLocation;
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
}

class TrianglesDrawerPrograms {
    private static registry = new Map<WebGLRenderingContext, TrianglesDrawerPrograms>();
    static get(gl: WebGLRenderingContext) {
        let instance = this.registry.get(gl);
        if (instance === undefined) {
            instance = new TrianglesDrawerPrograms(gl);
            this.registry.set(gl, instance);
        }
        return instance;
    }
    gl: WebGLRenderingContext;
    shading: TrianglesShadingProgram;
    noShading: TrianglesNoShadingProgram;
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
    private programs: TrianglesDrawerPrograms;
    private count: number;
    private points: WebGLBuffer;
    private normals: WebGLBuffer;
    private entity: object;
    constructor(programs: TrianglesDrawerPrograms, points: Float32Array, normals: Float32Array, entity: object) {
        if (points.length !== normals.length) throw new Error("points.length != normals.length");
        this.programs = programs;
        this.count = points.length / 3;
        this.points = programs.createBuffer(points);
        this.normals = programs.createBuffer(normals);
        this.entity = entity;
    }
    gl() {
        return this.programs.gl;
    }
    draw(rc: glview.RenderingContext) {
        this.programs.shading.draw(rc, this.points, this.normals, this.count);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.programs.noShading.draw(rc, this.points, this.count, session.emitColor3f(this.entity));
    }
}

export class Triangles implements glview.DrawableSource {
    private drawers: TrianglesDrawer[];
    private points: Float32Array;
    private normals: Float32Array;
    private boundary: vec.Sphere;
    private entity: object;
    constructor(points: Float32Array, normals: Float32Array, entity: object | null = null) {
        this.points = points;
        this.normals = normals;
        this.drawers = [];
        this.boundary = vec.Box3.boundaryOf(points).boundingSphere();
        this.entity = entity === null ? this : entity;
    }
    getDrawer(gl: WebGLRenderingContext) {
        let drawer = this.drawers.find(drawer => drawer.gl() === gl);
        if (drawer === undefined) {
            drawer = new TrianglesDrawer(TrianglesDrawerPrograms.get(gl), this.points, this.normals, this.entity);
            this.drawers.push(drawer);
        }
        return drawer
    }
    boundingSphere(): vec.Sphere {
        return this.boundary;
    }
}
