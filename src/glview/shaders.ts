import * as glview from './glview';
import * as vbo from './vbo';

export class PointsProgram {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new PointsProgram(gl));
    private static readonly vs = `
    attribute vec4 position;
    uniform mat4 modelViewMatrix;
    uniform mat4 projMatrix;
    void main() {
        gl_Position = projMatrix * modelViewMatrix * position;
    }`;
    private static readonly fs = `
    precision mediump float;
    uniform vec3 color;
    void main(){
        gl_FragColor = vec4(color, 1);
    }`;
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    private readonly uniColor: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.createProgram(gl, PointsProgram.vs, PointsProgram.fs);
        this.atrPosition = gl.getAttribLocation(this.program, "position");
        this.uniModelViewMatrix = gl.getUniformLocation(this.program, "modelViewMatrix")!;
        this.uniProjMatrix = gl.getUniformLocation(this.program, "projMatrix")!;
        this.uniColor = gl.getUniformLocation(this.program, "color")!;
    }
    draw(rc: glview.RenderingContext, buffer: vbo.VertexBuffer, mode: number, color3f: glview.Color3) {
        if (rc.gl !== this.gl || buffer.gl !== this.gl) throw new Error("PointsProgram: GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        gl.uniform3f(this.uniColor, color3f.r, color3f.g, color3f.b);
        rc.glUniformModelViewMatrix(this.uniModelViewMatrix);
        rc.glUniformProjectionMatrix(this.uniProjMatrix);
        buffer.enablePoints(this.atrPosition);
        gl.drawArrays(mode, 0, buffer.vertexCount);
    }
}

export class PointNormalsProgram {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new PointNormalsProgram(gl));
    private static readonly vs = `
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
    }`;
    private static readonly fs = `
    precision mediump float;
    varying vec3 fPos;
    varying vec3 fNrm;
    void main(){
        vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);
        float shininess = 2.0;
        float ambient = 0.1;
        vec3 col = vec3(0.0, 0.8, 0.0);

        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);
        vec3 nrm = normalize(fNrm);
        vec3 refDir = reflect(-light, nrm);
        float diffuse = max(dot(light, nrm), 0.0);
        //float specular = 0.0;
        float specular = pow(max(refDir.z, 0.0), shininess);

        gl_FragColor = vec4((diffuse + ambient) * col + vec3(specular), 1);
    }`;
    private static readonly vs2 = `#version 300 es
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
    }`;
    private static readonly fs2 = `#version 300 es
    precision mediump float;
    in vec3 fPos;
    in vec3 fNrm;
    out vec4 color;
    void main(){
        vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);
        float shininess = 2.0;
        float ambient = 0.1;
        vec3 col = vec3(0.0, 0.8, 0.0);

        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);
        vec3 nrm = normalize(fNrm);
        vec3 refDir = reflect(-light, nrm);
        float diffuse = max(dot(light, nrm), 0.0);
        //float specular = 0.0;
        float specular = pow(max(refDir.z, 0.0), shininess);

        color = vec4((diffuse + ambient) * col + vec3(specular), 1);
    }`;
    private readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly atrNormal: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.isWebGL2(gl) ?
            glview.createProgram(gl, PointNormalsProgram.vs2, PointNormalsProgram.fs2) :
            glview.createProgram(gl, PointNormalsProgram.vs, PointNormalsProgram.fs);
        this.atrPosition = gl.getAttribLocation(this.program, "position");
        this.atrNormal = gl.getAttribLocation(this.program, "normal");
        this.uniModelViewMatrix = gl.getUniformLocation(this.program, "modelViewMatrix")!;
        this.uniProjMatrix = gl.getUniformLocation(this.program, "projMatrix")!;
    }
    draw(rc: glview.RenderingContext, buffer: vbo.VertexNormalBuffer, mode: number) {
        if (rc.gl !== this.gl || buffer.gl !== this.gl) throw new Error("GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        rc.glUniformModelViewMatrix(this.uniModelViewMatrix);
        rc.glUniformProjectionMatrix(this.uniProjMatrix);
        buffer.enablePoints(this.atrPosition);
        buffer.enableNormals(this.atrNormal);
        gl.drawArrays(mode, 0, buffer.vertexCount);
    }
}

export class VertexNormalsDrawer implements glview.Drawable {
    private readonly shadingProgram: PointNormalsProgram;
    private readonly selectionProgram: PointsProgram;
    private readonly buffer: vbo.VertexNormalBuffer;
    private readonly entity: object;
    private readonly mode: number;
    constructor(gl: WebGLRenderingContext, buffer: vbo.VertexNormalBuffer, mode: number, entity: object) {
        this.shadingProgram = PointNormalsProgram.get(gl);
        this.selectionProgram = PointsProgram.get(gl);
        this.buffer = buffer;
        this.entity = entity;
        this.mode = mode;
    }
    dispose() {
        this.buffer.dispose();
    }
    draw(rc: glview.RenderingContext) {
        this.shadingProgram.draw(rc, this.buffer, this.mode);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.selectionProgram.draw(rc, this.buffer, this.mode, session.emitColor3f(this.entity));
    }
}
