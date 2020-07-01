import * as vec from './vecmath';
import * as glview from './glview';
import * as shaders from './shaders';
import * as vbo from './vbo';

export default class Lines implements glview.DrawableSource {
    private readonly points: Float32Array;
    private readonly boundary?: vec.Sphere;
    private readonly entity: object;
    constructor(points: Float32Array, entity: object | null = null) {
        this.points = points;
        this.boundary = vec.Box3.boundaryOf(points)?.boundingSphere();
        this.entity = entity === null ? this : entity;
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new shaders.VerticesDrawer(gl, vbo.createPointsBuffer(gl, this.points), gl.LINES, this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
}
