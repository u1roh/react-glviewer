import * as vec from './vecmath';
import * as glview from './glview';
import * as shaders from './shaders';
import * as vbo from './vbo';

export default class Lines implements glview.DrawableSource {
    private readonly boundary?: vec.Sphere;
    private readonly entity: object;
    constructor(private readonly points: Float32Array, entity?: object) {
        this.boundary = vec.Box3.boundaryOf(points)?.boundingSphere();
        this.entity = entity || this;
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new shaders.VerticesDrawer(gl, vbo.createPointsBuffer(gl, this.points), gl.LINES, this.entity));
    boundingSphere(): vec.Sphere | undefined {
        return this.boundary;
    }
}
