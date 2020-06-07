import * as vec from './vecmath';

export class Color3 {
    r: number;
    g: number;
    b: number;
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    to3f() {
        return new Color3(
            this.r / 0xff,
            this.g / 0xff,
            this.b / 0xff);
    }
    to3b() {
        return new Color3(
            Math.round(this.r * 0xff),
            Math.round(this.g * 0xff),
            Math.round(this.b * 0xff));
    }
}

export interface RenderingContext {
    gl: WebGLRenderingContext;
    canvasWidth: number;
    canvasHeight: number;
    camera: Camera;
    glUniformProjectionMatrix(location: WebGLUniformLocation): void;
    glUniformModelViewMatrix(location: WebGLUniformLocation): void;
}

export class Camera {
    private static orthoMatrix(volume: vec.Box3): vec.Matrix4 {
        const c = volume.center;
        const w = volume.x.upper - c.x;
        const h = volume.y.upper - c.y;
        const d = volume.z.upper - c.z;
        return new vec.Matrix4([
            1 / w, 0, 0, 0,
            0, 1 / h, 0, 0,
            0, 0, 1 / d, 0,
            -c.x / w, -c.y / w, -c.z / d, 1
        ]);
    }
    private static makeProjMatrix(depth: vec.Interval, scale: number, canvasWidth: number, canvasHeight: number): vec.Matrix4 {
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
    constructor(focus: vec.RigidTrans, scale: number) {
        this.focus = focus;
        this.scale = scale;
    }
    fit(world: vec.Sphere) {
        this.focus = new vec.RigidTrans(this.focus.r, world.center);
        this.scale = world.radius;
    }
    createMatrix(world: vec.Sphere, canvasWidth: number, canvasHeight: number): [vec.Matrix4, vec.Matrix4] {
        const inv = this.focus.inverse();
        const centerZ = inv.transform(world.center).z;
        const projMatrix = Camera.makeProjMatrix(
            new vec.Interval(centerZ - world.radius, centerZ + world.radius),
            this.scale, canvasWidth, canvasHeight);
        return [projMatrix, inv.toMatrix()]
    }
}

export class SelectionSession {
    private readonly objects: object[] = [];
    emitColor3f(obj: object): Color3 {
        this.objects.push(obj);
        return SelectionSession.encodeToColor3b(this.objects.length).to3f();
    }
    getObject(color3b: Color3): object | null {
        const i = SelectionSession.decodeFromColor3b(color3b);
        return 0 < i && i <= this.objects.length ? this.objects[i - 1] : null;
    }
    private static encodeToColor3b(n: number): Color3 {
        return new Color3(
            n % 0x100,
            Math.floor(n / 0x100) % 0x100,
            Math.floor(n / 0x10000) % 0x100);
    }
    private static decodeFromColor3b(color3b: Color3): number {
        return color3b.r + color3b.g * 0x100 + color3b.b * 0x10000;
    }
}

class SelectionBuffer {
    private readonly gl: WebGLRenderingContext;
    private readonly renderFunc: (session: SelectionSession) => void;
    private readonly fb: WebGLFramebuffer | null;
    private readonly depthBuf: WebGLRenderbuffer | null;
    private readonly colorBuf: WebGLTexture | null;
    private canvasWidth: number = -1;
    private canvasHeight: number = -1;
    private session: SelectionSession | null = null;
    constructor(gl: WebGLRenderingContext, renderFunc: (session: SelectionSession) => void) {
        this.gl = gl;
        this.renderFunc = renderFunc;
        this.fb = gl.createFramebuffer();
        this.depthBuf = gl.createRenderbuffer();
        this.colorBuf = gl.createTexture();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);

        // attach depth buffer to framebuffer
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuf);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuf);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        // attach color buffer to framebuffer
        gl.bindTexture(gl.TEXTURE_2D, this.colorBuf);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorBuf, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    dispose() {
        this.gl.deleteFramebuffer(this.fb);
        this.gl.deleteRenderbuffer(this.depthBuf);
        this.gl.deleteTexture(this.colorBuf);
    }
    clearSession() {
        this.session = null;
    }
    select(x: number, y: number, width: number, height: number) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb);
        if (width !== this.canvasWidth || height !== this.canvasHeight) {
            console.log("setup depth-buffer, color-buffer");
            this.session = null;
            this.canvasWidth = width;
            this.canvasHeight = height;

            gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuf);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);

            gl.bindTexture(gl.TEXTURE_2D, this.colorBuf);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.viewport(0, 0, width, height);
        }
        if (this.session === null) {
            console.log("render for selection");
            this.session = this.render();
        }
        let pixels = new Uint8Array(3);
        gl.readPixels(x, this.canvasHeight - y, 1, 1, gl.RGB, gl.UNSIGNED_BYTE, pixels);
        let color = new Color3(pixels[0], pixels[1], pixels[2]);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return this.session.getObject(color);
    }
    render() {
        const session = new SelectionSession();
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.renderFunc(session);
        this.gl.flush();
        return session;
    }
}

export interface Dispose {
    dispose: () => void;
}

export interface Drawable extends Dispose {
    draw(rc: RenderingContext): void;
    drawForSelection(rc: RenderingContext, session: SelectionSession): void;
}

export interface DrawableSource {
    getDrawer(gl: WebGLRenderingContext): Drawable;
    boundingSphere(): vec.Sphere | undefined;
}

class DrawableList implements Drawable {
    readonly items: Drawable[];
    constructor(items: Drawable[] = []) {
        this.items = items;
    }
    dispose() {
        for (let x of this.items) x.dispose();
    }
    draw(rc: RenderingContext) {
        for (let x of this.items) x.draw(rc);
    }
    drawForSelection(rc: RenderingContext, session: SelectionSession) {
        for (let x of this.items) x.drawForSelection(rc, session);
    }
}

export class SceneGraph implements DrawableSource {
    private nodes: DrawableSource[] = [];
    private world: vec.Sphere | null = null;
    private drawer: DrawableList | null = null;
    getDrawer(gl: WebGLRenderingContext): Drawable {
        if (this.drawer === null) {
            this.drawer = new DrawableList(this.nodes.map(x => x.getDrawer(gl)));
        }
        return this.drawer;
    }
    boundingSphere(): vec.Sphere {
        if (this.world === null) {
            const spheres = this.nodes.map(node => node.boundingSphere()).filter(s => s !== undefined).map(s => s!);
            this.world = spheres.length === 0 ? vec.Sphere.unit() : vec.Sphere.boundaryOfArray(spheres);
        }
        return this.world;
    }
    get nodeCount(): number {
        return this.nodes.length
    }
    getNode(i: number): DrawableSource {
        return this.nodes[i];
    }
    setNodes(nodes: DrawableSource[]) {
        this.nodes = nodes;
        this.world = null;
        this.drawer = null;
    }
    clearNodes() {
        this.setNodes([]);
    }
    addNode(node: DrawableSource) {
        this.nodes.push(node);
        this.world = null;
        this.drawer = null;
    }
}

export class GLView {
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGLRenderingContext;
    readonly camera = new Camera(vec.RigidTrans.UNIT, 1.0);
    readonly sceneGraph: SceneGraph;
    private readonly selectionBuf: SelectionBuffer;
    constructor(canvas: HTMLCanvasElement, useWebGL2: boolean, sceneGraph: SceneGraph) {
        const gl = canvas.getContext(useWebGL2 ? "webgl2" : "webgl") as WebGLRenderingContext;
        this.canvas = canvas;
        this.gl = gl;
        this.sceneGraph = sceneGraph;
        this.selectionBuf = new SelectionBuffer(gl, (session) => {
            const rc = this.createContext();
            this.sceneGraph.getDrawer(this.gl).drawForSelection(rc, session);
        });

        // Projection Matrix で視線方向を反転させていないので（つまり右手系のままなので）、
        // 通常の OpenGL と違ってデプス値はゼロで初期化して depthFunc を GL_GREATER にする。
        gl.clearDepth(0.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.GREATER);

        canvas.oncontextmenu = function () { return false; };    // disable context menu
        canvas.addEventListener("mousedown", e => {
            if (e.button !== 2) return;
            const scale = this.camera.scale;
            const focus = this.camera.focus;
            const lengthPerPixel = this.lengthPerPixel();
            const [x0, y0] = [e.offsetX, e.offsetY];
            const onMouseMove = (e: MouseEvent) => {
                const dx = e.offsetX - x0;
                const dy = e.offsetY - y0;
                const move = focus.r.transform(new vec.Vec3(lengthPerPixel * dx, -lengthPerPixel * dy, 0));
                if (e.shiftKey) {
                    this.camera.focus = new vec.RigidTrans(this.camera.focus.r, focus.t.sub(move));
                }
                else if (e.ctrlKey) {
                    const y = Math.abs(dy) / 40;
                    const factor = dy > 0 ? 1.0 / (1 + y) : 1 + y;
                    this.camera.scale = factor * scale;
                }
                else {
                    const axis = move.cross(focus.r.n);
                    const radian = move.length() / this.camera.scale;
                    this.camera.focus = new vec.RigidTrans(vec.Rotation.ofAxis(axis, radian).mul(focus.r), this.camera.focus.t);
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
        canvas.addEventListener("mousedown", e => {
            if (e.button !== 0) return;
            const obj = this.selectionBuf.select(e.offsetX, e.offsetY, this.canvas.width, this.canvas.height);
            console.log(obj);
        });
    }
    fit() {
        this.camera.fit(this.sceneGraph.boundingSphere());
    }
    render() {
        const rc = this.createContext();
        this.gl.clearColor(0.3, 0.3, 0.3, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.sceneGraph.getDrawer(this.gl).draw(rc);
        this.selectionBuf.clearSession();
        //this.selectionBuf.render(); // for debug
    }
    private createContext(): RenderingContext {
        const [projMatrix, viewMatrix] = this.camera.createMatrix(
            this.sceneGraph.boundingSphere(), this.canvas.width, this.canvas.height);
        return {
            gl: this.gl,
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            camera: this.camera,
            glUniformProjectionMatrix: location => this.gl.uniformMatrix4fv(location, false, projMatrix.array),
            glUniformModelViewMatrix: location => this.gl.uniformMatrix4fv(location, false, viewMatrix.array)
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

export function isWebGL2(gl: WebGLRenderingContext): boolean {
    return (gl.getParameter(gl.VERSION) as string).startsWith("WebGL 2.0");
}

export function buildShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type);
    if (shader == null) throw new Error("shader is null");

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    //console.log(gl.getShaderInfoLog(shader));
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

    //console.log(gl.getProgramInfoLog(program));
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("Link Error");

    return program;
}

export function createCache<Key, T>(factory: (key: Key) => T) {
    /*
    const registry = new Map<Key, T>();
    return (key: Key) => {
        let instance = registry.get(key);
        if (instance === undefined) {
            instance = factory(key);
            registry.set(key, instance);
        }
        return instance;
    };
    */
    // registry の要素数は非常に少ないことを想定しているので、Map を使うよりも配列の線形探索のほうが速いはず
    const cache: { key: Key; value: T; }[] = [];
    return (key: Key) => {
        let item = cache.find(x => x.key === key);
        if (item === undefined) {
            item = { key: key, value: factory(key) };
            cache.push(item);
        }
        return item.value;
    };
}
