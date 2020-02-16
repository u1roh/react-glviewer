import * as vec from './vecmath';

export class Camera {
    private static orthoMatrix(volume: vec.Box3) {
        const c = volume.center();
        const w = volume.x.upper - c.x;
        const h = volume.y.upper - c.y;
        const d = volume.z.upper - c.z;
        return [
            1 / w, 0, 0, 0,
            0, 1 / h, 0, 0,
            0, 0, 1 / d, 0,
            -c.x / w, -c.y / w, -c.z / d, 1
        ];
    }
    private static makeProjMatrix(depth: vec.Interval, scale: number, canvasWidth: number, canvasHeight: number) {
        const [w, h] = (canvasWidth < canvasHeight) ?
            [scale, scale * canvasHeight / canvasWidth] :
            [scale * canvasWidth / canvasHeight, scale];
        const volume = new vec.Box3(
            new vec.Interval(-w, w),
            new vec.Interval(-h, h),
            depth);
        return this.orthoMatrix(volume);
    }

    focus: vec.RigidTrans;
    scale: number;
    modelViewMatrix: number[];
    projectionMatrix: number[];
    constructor(focus: vec.RigidTrans, scale: number) {
        this.focus = focus;
        this.scale = scale;
        this.modelViewMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
        this.projectionMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }
    fit(world: vec.Sphere) {
        this.focus.t = world.center;
        this.scale = world.radius;
    }
    update(world: vec.Sphere, canvasWidth: number, canvasHeight: number) {
        const inv = this.focus.inverse();
        const center = inv.transform(world.center);
        const depth = new vec.Interval(center.z - world.radius, center.z + world.radius);
        this.modelViewMatrix = inv.toMatrix();
        this.projectionMatrix = Camera.makeProjMatrix(depth, this.scale, canvasWidth, canvasHeight);
    }
}

export interface Drawable {
    draw(camera: Camera): void;
    boundingSphere(): vec.Sphere;
}

export interface DrawableSource {
    createDrawer(gl: WebGLRenderingContext): Drawable;
}

export class GLView {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    camera = new Camera(vec.RigidTrans.unit(), 1.0);
    scene: Drawable | null = null;
    world: vec.Sphere = new vec.Sphere(vec.Vec3.zero(), 1.0);
    constructor(canvas: HTMLCanvasElement, useWebGL2: boolean) {
        const gl = canvas.getContext(useWebGL2 ? "webgl2" : "webgl") as WebGLRenderingContext;
        this.canvas = canvas;
        this.gl = gl;

        gl.clearColor(0.3, 0.3, 0.3, 1);

        // Projection Matrix で視線方向を反転させていないので（つまり右手系のままなので）、
        // 通常の OpenGL と違ってデプス値はゼロで初期化して depthFunc を GL_GREATER にする。
        gl.clearDepth(0.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.GREATER);

        canvas.oncontextmenu = function () { return false; };    // disable context menu
        canvas.addEventListener("mousedown", e => {
            const scale = this.camera.scale;
            const focus = this.camera.focus.clone();
            const lengthPerPixel = this.lengthPerPixel();
            const [x0, y0] = [e.offsetX, e.offsetY];
            const onMouseMove = (e: MouseEvent) => {
                const dx = e.offsetX - x0;
                const dy = e.offsetY - y0;
                const move = focus.r.transform(new vec.Vec3(lengthPerPixel * dx, -lengthPerPixel * dy, 0));
                if (e.shiftKey) {
                    this.camera.focus.t = focus.t.sub(move);
                }
                else if (e.ctrlKey) {
                    const y = Math.abs(dy) / 40;
                    const factor = dy > 0 ? 1.0 / (1 + y) : 1 + y;
                    this.camera.scale = factor * scale;
                }
                else {
                    const axis = move.cross(focus.r.n());
                    const radian = move.length() / this.camera.scale;
                    this.camera.focus.r = vec.Rotation.ofAxis(axis, radian).mul(focus.r);
                }
                this.render();
            };
            const onMouseUp = (e: MouseEvent) => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
            };
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });
        canvas.addEventListener("wheel", e => {
            const y = 0.1 * Math.abs(e.deltaY) / 100;
            const factor = e.deltaY > 0 ? 1 / (1 + y) : 1 + y;
            this.camera.scale *= factor;
            this.render();
        });
    }
    setScene(source: DrawableSource) {
        this.scene = source.createDrawer(this.gl);
        this.world = this.scene.boundingSphere();
    }
    fit() {
        this.camera.fit(this.world);
    }
    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.camera.update(this.world, this.canvas.width, this.canvas.height);
        if (this.scene != null) {
            this.scene.draw(this.camera);
        }
    }
    lengthPerPixel() {
        return 2 * this.camera.scale / Math.min(this.canvas.width, this.canvas.height);
    }
    resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.render();
    }
    resizeToWindow() {
        const rect = this.canvas.getBoundingClientRect();
        const margin = rect.left;
        this.resize(window.innerWidth - 2 * margin, window.innerHeight - rect.top - margin);
    }
}

export function buildShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader == null) throw new Error("shader is null");

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    console.log(gl.getShaderInfoLog(shader));
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error("compile error");

    return shader;
}

export function createProgram(gl: WebGLRenderingContext, srcV: string, srcF: string): WebGLProgram {
    const shaderV = buildShader(gl, gl.VERTEX_SHADER, srcV);
    const shaderF = buildShader(gl, gl.FRAGMENT_SHADER, srcF);
    const program = gl.createProgram();
    if (program == null) throw new Error("program is null");

    gl.attachShader(program, shaderV);
    gl.attachShader(program, shaderF);
    gl.linkProgram(program);

    console.log(gl.getProgramInfoLog(program));
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Link Error");

    return program;
}
