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
    static readonly vs2 = `#version 300 es
    in vec4 position;
    in vec3 normal;
    out vec3 fPos;
    out vec3 fNrm;
    out vec2 fUV;
    out vec3 fVecU;
    out vec3 fVecV;
    uniform mat4 modelViewMatrix;
    uniform mat4 projMatrix;
    void main() {
        vec4 pos = modelViewMatrix * position;
        fPos = pos.xyz;
        fNrm = mat3(modelViewMatrix) * normal;
        gl_Position = projMatrix * pos;

        vec3 a = abs(normal);
        if (a.x <= a.y && a.x <= a.z) {
            fVecU = normalize(vec3(0, normal.z, -normal.y));
        }
        else if (a.y <= a.x && a.y <= a.z) {
            fVecU = normalize(vec3(-normal.z, 0, normal.x));
        }
        else {
            fVecU = normalize(vec3(normal.y, -normal.x, 0));
        }
        fVecV = normalize(cross(normal, fVecU));
        float u = dot(position.xyz, fVecU);
        float v = dot(position.xyz, fVecV);
        fUV = vec2(u, v);
        fVecU = mat3(modelViewMatrix) * fVecU;
        fVecV = mat3(modelViewMatrix) * fVecV;
    }`;
    private static readonly fs2 = `#version 300 es
    precision mediump float;
    in vec3 fPos;
    in vec3 fNrm;
    in vec2 fUV;
    in vec3 fVecU;
    in vec3 fVecV;
    out vec4 color;
    void main(){
        const vec4 lightPos = vec4(1.0, 1.0, 1.0, 0.0);
        const float shininess = 2.0;
        const float ambient = 0.2;
        const vec3 col = vec3(0.0, 0.8, 0.0);

        vec3 nrm = normalize(fNrm);
        const float SCALE = 10.0;
        float u = 2.0 * (fUV.x / SCALE - round(fUV.x / SCALE));
        float v = 2.0 * (fUV.y / SCALE - round(fUV.y / SCALE));
        float r2 = u * u + v * v;
        if (r2 < 1.0) {
            float n = sqrt(1.0 - r2);
            nrm = u * fVecU + v * fVecV + n * nrm;
        }

        vec3 light = normalize((lightPos - vec4(fPos, 1) * lightPos.w).xyz);
        vec3 refDir = reflect(-light, nrm);
        float diffuse = max(dot(light, nrm), 0.0);
        float specular = pow(max(refDir.z, 0.0), shininess);

        color = vec4((diffuse + ambient) * col + vec3(specular), 1);
    }`;
    private constructor(gl: WebGLRenderingContext) {
        super(gl, CrazyShadingProgram.vs2, CrazyShadingProgram.fs2);
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

class TextureMappingProgram {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new TextureMappingProgram(gl));
    private static readonly vs = `
    attribute vec4 position;
    attribute vec2 texCoord;
    uniform mat4 modelViewMatrix;
    uniform mat4 projMatrix;
    varying vec2 oTexCoord;
    void main() {
        gl_Position = projMatrix * modelViewMatrix * position;
        oTexCoord = vec2(texCoord.x, 1.0 - texCoord.y);
    }
    `;
    private static readonly fs = `
    precision mediump float;
    uniform sampler2D texture;
    uniform vec3 color;
    uniform bool isTextureEnabled;
    varying vec2 oTexCoord;
    void main(){
        if (isTextureEnabled) {
            gl_FragColor = vec4(color, 1) * texture2D(texture, oTexCoord);
        } else {
            gl_FragColor = vec4(color, 1);
        }
    }
    `;
    readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly atrTexCoord: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    private readonly uniTexture: WebGLUniformLocation;
    private readonly uniColor: WebGLUniformLocation;
    private readonly uniIsTextureEnabled: WebGLUniformLocation;
    private constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.createProgram(gl, TextureMappingProgram.vs, TextureMappingProgram.fs);
        this.atrPosition = gl.getAttribLocation(this.program, "position");
        this.atrTexCoord = gl.getAttribLocation(this.program, "texCoord");
        this.uniModelViewMatrix = gl.getUniformLocation(this.program, "modelViewMatrix")!;
        this.uniProjMatrix = gl.getUniformLocation(this.program, "projMatrix")!;
        this.uniTexture = gl.getUniformLocation(this.program, "texture")!;
        this.uniColor = gl.getUniformLocation(this.program, "color")!;
        this.uniIsTextureEnabled = gl.getUniformLocation(this.program, "isTextureEnabled")!;
    }
    draw(rc: glview.RenderingContext, buffer: vbo.VertexUVBuffer, mode: number, texOrColor: WebGLTexture | glview.Color3) {
        if (rc.gl !== this.gl) throw new Error("TrianglesDrawerProgram: GL rendering context mismatch");
        const gl = rc.gl;
        gl.useProgram(this.program);
        rc.glUniformModelViewMatrix(this.uniModelViewMatrix);
        rc.glUniformProjectionMatrix(this.uniProjMatrix);

        if ('r' in texOrColor) {
            gl.uniform3f(this.uniColor, texOrColor.r, texOrColor.g, texOrColor.b);
            gl.uniform1i(this.uniIsTextureEnabled, 0);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, texOrColor);
            gl.uniform1i(this.uniTexture, 0);
            gl.uniform3f(this.uniColor, 1, 1, 1);
            gl.uniform1i(this.uniIsTextureEnabled, 1);
        }

        buffer.enablePoints(this.atrPosition);
        buffer.enableUVs(this.atrTexCoord);

        gl.drawArrays(mode, 0, buffer.vertexCount);
    }
    createTexture(image: TexImageSource): WebGLTexture {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture!;
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

export class VertexUVsDrawer implements glview.Drawable {
    private readonly program: TextureMappingProgram;
    private readonly buffer: vbo.VertexUVBuffer;
    private readonly texture: WebGLTexture;
    private readonly mode: number;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, buffer: vbo.VertexUVBuffer, mode: number, image: TexImageSource, entity: object) {
        this.program = TextureMappingProgram.get(gl);
        this.buffer = buffer;
        this.mode = mode;
        this.texture = this.program.createTexture(image);
        this.entity = entity;
    }
    dispose() {
        this.buffer.dispose();
    }
    draw(rc: glview.RenderingContext) {
        this.program.draw(rc, this.buffer, this.mode, this.texture);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.program.draw(rc, this.buffer, this.mode, session.emitColor3f(this.entity));
    }
}
