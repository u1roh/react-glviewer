import * as vec from './vecmath';
import * as glview from './glview';

const vs = `
attribute vec4 position;
uniform mat4 modelViewMatrix;
uniform mat4 projMatrix;
void main() {
    gl_Position = projMatrix * modelViewMatrix * position;
}
`;

const fs = `
precision mediump float;
uniform vec3 color;
void main(){
    gl_FragColor = vec4(color, 1);
}
`;

class LinesProgram {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new LinesProgram(gl));
    readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    private readonly uniColor: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.createProgram(gl, vs, fs);
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

        gl.drawArrays(gl.LINES, 0, count);
    }
    createBuffer(data: Float32Array): WebGLBuffer {
        const buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        return buf!;
    }
}

class LinesDrawer implements glview.Drawable {
    private readonly program: LinesProgram;
    private readonly count: number;
    private readonly points: WebGLBuffer;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, points: Float32Array, entity: object) {
        this.program = LinesProgram.get(gl);
        this.count = points.length / 3;
        this.points = this.program.createBuffer(points);
        this.entity = entity;
    }
    gl() {
        return this.program.gl;
    }
    draw(rc: glview.RenderingContext) {
        this.program.draw(rc, this.points, this.count, new glview.Color3(0, 1, 0));
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.program.draw(rc, this.points, this.count, session.emitColor3f(this.entity));
    }
}

export default class Lines implements glview.DrawableSource {
    private readonly points: Float32Array;
    private readonly boundary: vec.Sphere;
    private readonly entity: object;
    constructor(points: Float32Array, entity: object | null = null) {
        this.points = points;
        this.boundary = vec.Box3.boundaryOf(points).boundingSphere();
        this.entity = entity === null ? this : entity;
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new LinesDrawer(gl, this.points, this.entity));
    boundingSphere(): vec.Sphere {
        return this.boundary;
    }
}
