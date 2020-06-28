import * as vec from './vecmath';
import * as glview from './glview';
import * as vbo from './vbo';
import * as shaders from './shaders';

class PointsDrawer implements glview.Drawable {
    private readonly shadingProgram: shaders.PointNormalsProgram;
    private readonly selectionProgram: shaders.PointsProgram;
    private readonly buffer: vbo.VertexNormalBuffer;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, buffer: vbo.VertexNormalBuffer, entity: object) {
        this.shadingProgram = shaders.PointNormalsProgram.get(gl);
        this.selectionProgram = shaders.PointsProgram.get(gl);
        this.buffer = buffer;
        this.entity = entity;
    }
    dispose() {
        this.buffer.dispose();
    }
    draw(rc: glview.RenderingContext) {
        this.shadingProgram.draw(rc, this.buffer, rc.gl.POINTS);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.selectionProgram.draw(rc, this.buffer, rc.gl.POINTS, session.emitColor3f(this.entity));
    }
}

export class PointNormals implements glview.DrawableSource {
    readonly data: Float32Array;
    private readonly boundary: vec.Sphere | undefined;
    private readonly entity: object;
    constructor(data: Float32Array, entity?: object) {
        this.data = data;
        this.entity = entity || this;
        const builder = new vec.Box3Builder();
        for (let i = 0; i < this.count; ++i) {
            builder.add(this.getPoint(i));
        }
        this.boundary = builder.build()?.boundingSphere();
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new PointsDrawer(gl, this.createVertexBuffer(gl), this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
    createVertexBuffer(gl: WebGLRenderingContext): vbo.VertexNormalBuffer {
        return new vbo.InterleavedPointNormals(gl, this.data);
    }
    get count(): number {
        return this.data.length / 6;
    }
    getPoint(i: number): vec.Vec3 {
        return new vec.Vec3(this.data[6 * i + 0], this.data[6 * i + 1], this.data[6 * i + 2]);
    }
    getNormal(i: number): vec.Vec3 {
        return new vec.Vec3(this.data[6 * i + 3], this.data[6 * i + 4], this.data[6 * i + 5]);
    }
}
