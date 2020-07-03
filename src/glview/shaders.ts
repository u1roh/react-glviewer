import * as glview from './glview';
import * as vbo from './vbo';
import { basename } from 'path';

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

export interface PointNormalsProgram {
    draw(rc: glview.RenderingContext, buffer: vbo.VertexNormalBuffer, mode: number): void;
}

class PointNormalsProgramImpl implements PointNormalsProgram {
    readonly gl: WebGLRenderingContext;
    readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly atrNormal: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    protected constructor(gl: WebGLRenderingContext, srcV: string, srcF: string) {
        this.gl = gl;
        this.program = glview.createProgram(gl, srcV, srcF);
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


class PointNormalsCommon {
    static readonly vs = `
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
    static readonly vs2 = `#version 300 es
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
}

export class PhongShadingProgram extends PointNormalsProgramImpl {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new PhongShadingProgram(gl));
    static readonly fs = `
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
    static readonly fs2 = `#version 300 es
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
    private constructor(gl: WebGLRenderingContext) {
        glview.isWebGL2(gl) ?
            super(gl, PointNormalsCommon.vs2, PhongShadingProgram.fs2) :
            super(gl, PointNormalsCommon.vs, PhongShadingProgram.fs);
    }
}

export class ToonShadingProgram extends PointNormalsProgramImpl {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new ToonShadingProgram(gl));
    private static readonly fs2 = `#version 300 es
    precision mediump float;
    in vec3 fPos;
    in vec3 fNrm;
    out vec4 color;
    void main(){
        const vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);
        const float shininess = 2.0;
        const float ambient = 0.3;
        const vec3 col = vec3(0.0, 0.8, 0.0);

        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);
        vec3 nrm = normalize(fNrm);
        vec3 refDir = reflect(-light, nrm);
        float diffuse = dot(light, nrm) < 0.0 ? 0.0 : 1.0;
        float specular = pow(max(refDir.z, 0.0), shininess);
        specular = specular < 0.5 ? 0.0 : 0.7;

        color = vec4((diffuse + ambient) * col + vec3(specular), 1);
    }`;
    private constructor(gl: WebGLRenderingContext) {
        super(gl, PointNormalsCommon.vs2, ToonShadingProgram.fs2);
    }
}

export class CrazyShadingProgram extends PointNormalsProgramImpl {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new CrazyShadingProgram(gl));
    private static readonly fs2 = `#version 300 es
    precision mediump float;
    in vec3 fPos;
    in vec3 fNrm;
    out vec4 color;
    void main(){
        const vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);
        const float shininess = 2.0;
        const float ambient = 0.2;
        const vec3 col = vec3(0.0, 0.8, 0.0);

        vec3 nrm = normalize(fNrm);
        vec3 a = abs(nrm);
        vec3 uvec;
        if (a.x < a.y && a.x < a.z) {
            uvec = normalize(vec3(0, nrm.z, -nrm.y));
        }
        else if (a.y < a.x && a.y < a.z) {
            uvec = normalize(vec3(-nrm.z, 0, nrm.x));
        }
        else {
            uvec = normalize(vec3(nrm.y, -nrm.x, 0));
        }
        float coef = 0.1;
        vec3 vvec = normalize(cross(nrm, uvec));
        float u = 2.0 * (coef * dot(fPos, uvec) - round(coef * dot(fPos, uvec)));
        float v = 2.0 * (coef * dot(fPos, vvec) - round(coef * dot(fPos, vvec)));
        float r2 = u * u + v * v;
        if (r2 < 1.0) {
            float n = sqrt(1.0 - r2);
            nrm = u * uvec + v * vvec + n * nrm;
        }

        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);
        vec3 refDir = reflect(-light, nrm);
        float diffuse = max(dot(light, nrm), 0.0);
        float specular = pow(max(refDir.z, 0.0), shininess);

        color = vec4((diffuse + ambient) * col + vec3(specular), 1);
    }`;
    private constructor(gl: WebGLRenderingContext) {
        super(gl, PointNormalsCommon.vs2, CrazyShadingProgram.fs2);
    }
}

export class PulseAnimationProgram extends PointNormalsProgramImpl {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new PulseAnimationProgram(gl));
    static readonly vs2 = `#version 300 es
    in vec4 position;
    in vec3 normal;
    out vec3 fPos;
    out vec3 fNrm;
    uniform mat4 modelViewMatrix;
    uniform mat4 projMatrix;
    uniform float seconds;
    uniform float amplitude;
    const float PERIOD = 2.0;
    const float PI = 3.141592653589793;
    void main() {
        float delta = amplitude * sin(2.0 * PI * seconds / PERIOD);
        vec4 pos = modelViewMatrix * (position + delta * vec4(normal, 0));
        fPos = pos.xyz;
        fNrm = mat3(modelViewMatrix) * normal;
        gl_Position = projMatrix * pos;
    }`;
    private readonly uniSeconds: WebGLUniformLocation;
    private readonly uniAmplitude: WebGLUniformLocation;
    private seconds: number = 0.0;
    private constructor(gl: WebGLRenderingContext) {
        super(gl, PulseAnimationProgram.vs2, PhongShadingProgram.fs2);
        this.uniSeconds = gl.getUniformLocation(this.program, "seconds")!;
        this.uniAmplitude = gl.getUniformLocation(this.program, "amplitude")!;
        const dt = 10;  // [milliseconds]
        setInterval(() => { this.seconds += dt / 1000.0; }, dt);
    }
    draw(rc: glview.RenderingContext, buffer: vbo.VertexNormalBuffer, mode: number) {
        if (rc.gl !== this.gl || buffer.gl !== this.gl) throw new Error("GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        gl.uniform1f(this.uniSeconds, this.seconds);
        gl.uniform1f(this.uniAmplitude, 2.0);
        super.draw(rc, buffer, mode);
    }
}

export class VerticesDrawer implements glview.Drawable {
    private readonly program: PointsProgram;
    private readonly buffer: vbo.VertexBuffer;
    private readonly entity: object;
    private readonly mode: number;
    constructor(gl: WebGLRenderingContext, buffer: vbo.VertexBuffer, mode: number, entity: object) {
        this.program = PointsProgram.get(gl);
        this.buffer = buffer;
        this.entity = entity;
        this.mode = mode;
    }
    dispose() {
        this.buffer.dispose();
    }
    draw(rc: glview.RenderingContext) {
        this.program.draw(rc, this.buffer, this.mode, new glview.Color3(0, 1, 0));
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.program.draw(rc, this.buffer, this.mode, session.emitColor3f(this.entity));
    }
}

export class VertexNormalsDrawer implements glview.Drawable {
    static shaderNo: number = 0;
    static incrementShaderNo() {
        ++this.shaderNo;
    }
    //private readonly shadingProgram: PointNormalsProgram;
    private readonly shadingPrograms: PointNormalsProgram[];
    private readonly selectionProgram: PointsProgram;
    private readonly buffer: vbo.VertexNormalBuffer;
    private readonly entity: object;
    private readonly mode: number;
    constructor(gl: WebGLRenderingContext, buffer: vbo.VertexNormalBuffer, mode: number, entity: object) {
        //this.shadingProgram = PhongShadingProgram.get(gl);
        this.shadingPrograms = [
            PhongShadingProgram.get(gl),
            ToonShadingProgram.get(gl),
            CrazyShadingProgram.get(gl),
            PulseAnimationProgram.get(gl),
        ];
        this.selectionProgram = PointsProgram.get(gl);
        this.buffer = buffer;
        this.entity = entity;
        this.mode = mode;
    }
    dispose() {
        this.buffer.dispose();
    }
    draw(rc: glview.RenderingContext) {
        //this.shadingProgram.draw(rc, this.buffer, this.mode);
        const i = VertexNormalsDrawer.shaderNo % this.shadingPrograms.length;
        this.shadingPrograms[i].draw(rc, this.buffer, this.mode);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.selectionProgram.draw(rc, this.buffer, this.mode, session.emitColor3f(this.entity));
    }
}
