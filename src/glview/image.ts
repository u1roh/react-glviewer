import * as vec from './vecmath';
import * as glview from './glview';
import * as shaders from './shaders';
import * as vbo from './vbo';

export class ImageBoard implements glview.DrawableSource {
    private readonly boundary: vec.Sphere;
    private readonly entity: object;
    private readonly drawers = new glview.Cache((gl: WebGLRenderingContext) => {
        const buffer = vbo.createInterleavedPointUVsBuffer(gl, this.genRectPoints());
        return new shaders.VertexUVsDrawer(gl, this.image, buffer, gl.TRIANGLE_FAN, this.entity);
    });
    constructor(
        private readonly image: TexImageSource,
        private readonly area: vec.Box2 = new vec.Box2(new vec.Interval(0, image.width), new vec.Interval(0, image.height)),
        private readonly pos: vec.RigidTrans = vec.RigidTrans.UNIT,
        entity?: object
    ) {
        this.boundary = new vec.Sphere(
            pos.transform(area.center.to3d()),
            area.lower.sub(area.center).length()
        );
        this.entity = entity || this;
    }
    dispose() {
        this.drawers.dispose();
    }
    getDrawer(gl: WebGLRenderingContext): glview.Drawable {
        return this.drawers.get(gl);
    }
    boundingSphere(): vec.Sphere {
        return this.boundary;
    }
    private genRectPoints() {
        const uvpoints = this.area.points_ccw();
        const points = new Float32Array(5 * uvpoints.length);
        const uv = [
            new vec.Vec2(0, 0),
            new vec.Vec2(1, 0),
            new vec.Vec2(1, 1),
            new vec.Vec2(0, 1),
        ];
        for (let i = 0; i < uvpoints.length; ++i) {
            const p = this.pos.transform(uvpoints[i].to3d());
            points[5 * i + 0] = p.x;
            points[5 * i + 1] = p.y;
            points[5 * i + 2] = p.z;
            points[5 * i + 3] = uv[i].x;
            points[5 * i + 4] = uv[i].y;
        }
        return points;
    }
}
