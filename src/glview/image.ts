import * as vec from './vecmath';
import * as glview from './glview';

const vs = `
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

const fs = `
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

class ImageBoardProgram {
    static readonly get = glview.createCache((gl: WebGLRenderingContext) => new ImageBoardProgram(gl));
    readonly gl: WebGLRenderingContext;
    private readonly program: WebGLProgram;
    private readonly atrPosition: number;
    private readonly atrTexCoord: number;
    private readonly uniModelViewMatrix: WebGLUniformLocation;
    private readonly uniProjMatrix: WebGLUniformLocation;
    private readonly uniTexture: WebGLUniformLocation;
    private readonly uniColor: WebGLUniformLocation;
    private readonly uniIsTextureEnabled: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        this.program = glview.createProgram(gl, vs, fs);
        this.atrPosition = gl.getAttribLocation(this.program, "position");
        this.atrTexCoord = gl.getAttribLocation(this.program, "texCoord");
        this.uniModelViewMatrix = gl.getUniformLocation(this.program, "modelViewMatrix")!;
        this.uniProjMatrix = gl.getUniformLocation(this.program, "projMatrix")!;
        this.uniTexture = gl.getUniformLocation(this.program, "texture")!;
        this.uniColor = gl.getUniformLocation(this.program, "color")!;
        this.uniIsTextureEnabled = gl.getUniformLocation(this.program, "isTextureEnabled")!;
    }
    draw(rc: glview.RenderingContext, texOrColor: WebGLTexture | glview.Color3, points: WebGLBuffer, texCoords: WebGLBuffer, count: number) {
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

        gl.bindBuffer(gl.ARRAY_BUFFER, points);
        gl.enableVertexAttribArray(this.atrPosition);
        gl.vertexAttribPointer(this.atrPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoords);
        gl.enableVertexAttribArray(this.atrTexCoord);
        gl.vertexAttribPointer(this.atrTexCoord, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, count);
    }
    createBuffer(data: Float32Array): WebGLBuffer {
        const buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
        return buf!;
    }
    createTexCoordBuffer(): WebGLBuffer {
        const data = new Float32Array(2 * 4);
        data[0] = 0; data[1] = 0;
        data[2] = 1; data[3] = 0;
        data[4] = 1; data[5] = 1;
        data[6] = 0; data[7] = 1;
        return this.createBuffer(data);
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

class ImageBoardDrawer implements glview.Drawable {
    private readonly program: ImageBoardProgram;
    private readonly count: number;
    private readonly points: WebGLBuffer;
    private readonly texCoords: WebGLBuffer;
    private readonly texture: WebGLTexture;
    private readonly entity: object;
    constructor(gl: WebGLRenderingContext, image: TexImageSource, points: Float32Array, entity: object) {
        this.program = ImageBoardProgram.get(gl);
        this.count = points.length / 3;
        this.points = this.program.createBuffer(points);
        this.texCoords = this.program.createTexCoordBuffer();
        this.texture = this.program.createTexture(image);
        this.entity = entity;
    }
    dispose() {
        this.program.gl.deleteBuffer(this.points);
        this.program.gl.deleteTexture(this.texture);
    }
    draw(rc: glview.RenderingContext) {
        this.program.draw(rc, this.texture, this.points, this.texCoords, this.count);
    }
    drawForSelection(rc: glview.RenderingContext, session: glview.SelectionSession) {
        this.program.draw(rc, session.emitColor3f(this.entity), this.points, this.texCoords, this.count);
    }
}

export class ImageBoard implements glview.DrawableSource {
    private readonly image: TexImageSource;
    private readonly pos: vec.RigidTrans;
    private readonly area: vec.Box2;
    private readonly boundary: vec.Sphere;
    private readonly entity: object;
    constructor(
        image: TexImageSource,
        area: vec.Box2 = new vec.Box2(new vec.Interval(0, image.width), new vec.Interval(0, image.height)),
        pos: vec.RigidTrans = vec.RigidTrans.UNIT,
        entity: object | null = null
    ) {
        this.image = image;
        this.pos = pos;
        this.area = area;
        this.boundary = new vec.Sphere(
            pos.transform(area.center.to3d()),
            area.lower.sub(area.center).length()
        );
        this.entity = entity === null ? this : entity;
    }
    readonly getDrawer = glview.createCache((gl: WebGLRenderingContext) => {
        return new ImageBoardDrawer(gl, this.image, this.genRectPoints(), this.entity);
    });
    boundingSphere(): vec.Sphere {
        return this.boundary;
    }
    private genRectPoints() {
        const uvpoints = this.area.points_ccw();
        const points = new Float32Array(3 * uvpoints.length);
        for (let i = 0; i < uvpoints.length; ++i) {
            const p = this.pos.transform(uvpoints[i].to3d());
            points[3 * i + 0] = p.x;
            points[3 * i + 1] = p.y;
            points[3 * i + 2] = p.z;
        }
        return points;
    }
}
