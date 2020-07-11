import * as vec from './vecmath';
import * as glview from './glview';
import * as shaders from './shaders';
import * as points from './points';
import Lines from './lines';

export default class Triangles implements glview.DrawableSource {
    private readonly entity: object;
    constructor(public readonly vertices: points.PointNormals, entity?: object) {
        this.entity = entity || this;
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) =>
        new shaders.VertexNormalsDrawer(
            gl,
            this.vertices.createVertexBuffer(gl),
            gl.TRIANGLES,
            this.entity
        ));
    boundingSphere(): vec.Sphere | undefined {
        return this.vertices.boundingSphere();
    }
    get triangleCount() {
        return this.vertices.count / 3;
    }
    getTriangle(i: number) {
        return new vec.Triangle(
            this.vertices.getPoint(3 * i + 0),
            this.vertices.getPoint(3 * i + 1),
            this.vertices.getPoint(3 * i + 2));
    }
    toWireframe(): Lines {
        const points = new Float32Array(2 * 3 * this.vertices.count);
        for (let i = 0; i < this.triangleCount; ++i) {
            for (let j = 0; j < 3; ++j) {
                const idx = 3 * i + j;
                const next = 3 * i + (j + 1) % 3;
                const p1 = this.vertices.getPoint(idx);
                const p2 = this.vertices.getPoint(next);
                points[3 * (2 * idx + 0) + 0] = p1.x;
                points[3 * (2 * idx + 0) + 1] = p1.y;
                points[3 * (2 * idx + 0) + 2] = p1.z;
                points[3 * (2 * idx + 1) + 0] = p2.x;
                points[3 * (2 * idx + 1) + 1] = p2.y;
                points[3 * (2 * idx + 1) + 2] = p2.z;
            }
        }
        return new Lines(points, this.entity);
    }
}
