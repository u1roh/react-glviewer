
export class Vec2 {
    constructor(readonly x: number, readonly y: number) { }
    static readonly ZERO = new Vec2(0, 0);
    static readonly EX = new Vec2(1, 0);
    static readonly EY = new Vec2(0, 1);
    to3d() {
        return new Vec3(this.x, this.y, 0);
    }
    clone() {
        return new Vec2(this.x, this.y);
    }
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }
    length(): number {
        return Math.sqrt(this.lengthSquared());
    }
    neg(): Vec2 {
        return new Vec2(-this.x, -this.y);
    }
    add(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y);
    }
    mul(scalar: number): Vec2 {
        return new Vec2(scalar * this.x, scalar * this.y);
    }
}

export class Vec3 {
    constructor(readonly x: number, readonly y: number, readonly z: number) { }
    static readonly ZERO = new Vec3(0, 0, 0);
    static readonly EX = new Vec3(1, 0, 0);
    static readonly EY = new Vec3(0, 1, 0);
    static readonly EZ = new Vec3(0, 0, 1);
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
    lengthSquared(): number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length(): number {
        return Math.sqrt(this.lengthSquared());
    }
    neg(): Vec3 {
        return new Vec3(-this.x, -this.y, -this.z);
    }
    add(v: Vec3): Vec3 {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    sub(v: Vec3): Vec3 {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    mul(scalar: number): Vec3 {
        return new Vec3(scalar * this.x, scalar * this.y, scalar * this.z);
    }
    cross(v: Vec3): Vec3 {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x);
    }
}

export class Matrix4 {
    constructor(private readonly a: number[]) {
        if (a.length !== 16) throw new Error("Matrix4: a.length != 16");
    }
    static get ZERO() {
        return new Matrix4([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
    }
    static get UNIT() {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    get array(): number[] {
        return this.a;
    }
    mul(m: Matrix4): Matrix4 {
        const c = new Array<number>(16);
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 4; ++j) {
                for (let k = 0; k < 4; ++k) {
                    c[i + 4 * j] += this.a[i + 4 * k] * m.a[4 * j + k];
                }
            }
        }
        return new Matrix4(c);
    }
}

export class Sphere {
    constructor(readonly center: Vec3, readonly radius: number) { }
    static readonly UNIT = new Sphere(Vec3.ZERO, 1.0);
    static boundaryOfTwo(sphere1: Sphere, sphere2: Sphere) {
        const vec = sphere2.center.sub(sphere1.center);
        const len = vec.length();
        if (len + sphere2.radius < sphere1.radius) return sphere1;
        if (len + sphere1.radius < sphere2.radius) return sphere2;
        const t = (len + sphere2.radius - sphere1.radius) / 2;
        const center = sphere1.center.add(vec.mul(t / len));
        const radius = len + sphere1.radius + sphere2.radius / 2;
        return new Sphere(center, radius);
    }
    static boundaryOfArray(spheres: Sphere[]) {
        switch (spheres.length) {
            case 0: return new Sphere(Vec3.ZERO, 0.0);
            case 1: return spheres[0];
            case 2: return Sphere.boundaryOfTwo(spheres[0], spheres[1]);
            default:
                const removeAt = (i: number) => {
                    const ret = spheres[i];
                    spheres[i] = spheres[spheres.length - 1];
                    spheres.pop();
                    return ret;
                }
                const idx = spheres.reduce((acc, item, idx) => spheres[acc].radius > item.radius ? acc : idx, 0);
                let sphere = removeAt(idx);
                while (spheres.length > 0) {
                    let idx = 0;
                    let len = sphere.center.sub(spheres[0].center).length() + spheres[0].radius;
                    for (let i = 1; i < spheres.length; ++i) {
                        const l = sphere.center.sub(spheres[i].center).length() + spheres[i].radius;
                        if (l > len) {
                            len = l;
                            idx = i;
                        }
                    }
                    sphere = Sphere.boundaryOfTwo(sphere, removeAt(idx));
                }
                return sphere;
        }
    }
}

export class Interval {
    static new(lower: number, upper: number): Interval | undefined {
        return lower <= upper ? new Interval(lower, upper) : undefined;
    }
    constructor(readonly lower: number, readonly upper: number) {
        if (lower > upper) throw new Error("invalid interval");
    }
    get width(): number {
        return this.upper - this.lower;
    }
    get center(): number {
        return (this.lower + this.upper) / 2;
    }
    static readonly UNIT = new Interval(0, 1);
    static readonly INFINITY = new Interval(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
}

export class IntervalBuilder {
    private lower: number = Number.POSITIVE_INFINITY;
    private upper: number = Number.NEGATIVE_INFINITY;
    add(x: number) {
        if (x < this.lower) this.lower = x;
        if (x > this.upper) this.upper = x;
    }
    build(): Interval | undefined {
        return Interval.new(this.lower, this.upper)
    }
}

export class Box2 {
    constructor(readonly x: Interval, readonly y: Interval) { }
    static new(x?: Interval, y?: Interval): Box2 | undefined {
        return (x && y) ? new Box2(x, y) : undefined;
    }
    get ll(): Vec2 { return new Vec2(this.x.lower, this.y.lower); }
    get ul(): Vec2 { return new Vec2(this.x.upper, this.y.lower); }
    get lu(): Vec2 { return new Vec2(this.x.lower, this.y.upper); }
    get uu(): Vec2 { return new Vec2(this.x.upper, this.y.upper); }
    get lower(): Vec2 {
        return this.ll;
    }
    get upper(): Vec2 {
        return this.uu;
    }
    get center(): Vec2 {
        return new Vec2(this.x.center, this.y.center);
    }
    points(): Vec2[] {
        return [this.ll, this.ul, this.lu, this.uu];
    }
    points_ccw(): Vec2[] {
        return [this.ll, this.ul, this.uu, this.lu];
    }
    static readonly UNIT = new Box2(Interval.UNIT, Interval.UNIT);
}

export class Box3 {
    constructor(readonly x: Interval, readonly y: Interval, readonly z: Interval) { }
    static new(x?: Interval, y?: Interval, z?: Interval): Box3 | undefined {
        return (x && y && z) ? new Box3(x, y, z) : undefined;
    }
    get lower(): Vec3 {
        return new Vec3(this.x.lower, this.y.lower, this.z.lower);
    }
    get upper(): Vec3 {
        return new Vec3(this.x.upper, this.y.upper, this.z.upper);
    }
    get center(): Vec3 {
        return new Vec3(this.x.center, this.y.center, this.z.center);
    }
    boundingSphere(): Sphere {
        const center = this.center;
        const radius = this.upper.sub(center).length();
        return new Sphere(center, radius);
    }
    static boundaryOf(points: Float32Array): Box3 | undefined {
        const builder = new Box3Builder();
        for (let i = 0; i < points.length; i += 3) {
            builder.add(points[i + 0], points[i + 1], points[i + 2]);
        }
        return builder.build();
    }
}

export class Box3Builder {
    private readonly x = new IntervalBuilder();
    private readonly y = new IntervalBuilder();
    private readonly z = new IntervalBuilder();
    add(x: number, y: number, z: number): void;
    add(v: Vec3): void;
    add(x: number | Vec3, y?: number, z?: number) {
        if (typeof x === 'number') {
            this.x.add(x);
            this.y.add(y || 0);
            this.z.add(z || 0);
        } else {
            this.x.add(x.x);
            this.y.add(x.y);
            this.z.add(x.z);
        }
    }
    build(): Box3 | undefined {
        return Box3.new(this.x.build(), this.y.build(), this.z.build());
    }
}

export class Triangle {
    constructor(readonly p1: Vec3, readonly p2: Vec3, readonly p3: Vec3) { }
}

export class Quaternion {
    constructor(readonly w: number, readonly x: number, readonly y: number, readonly z: number) { }
    clone() {
        return new Quaternion(this.w, this.x, this.y, this.z);
    }
    conjugate(): Quaternion {
        return new Quaternion(this.w, -this.x, -this.y, -this.z);
    }
    mul(q: Quaternion): Quaternion {
        return new Quaternion(
            this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
            this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
            this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
            this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w);
    }
    static readonly UNIT = new Quaternion(1, 0, 0, 0);
}

export class Rotation {
    constructor(private readonly q: Quaternion) { }
    static ofAxis(axis: Vec3, radian: number): Rotation {
        let c = Math.cos(0.5 * radian);
        let s = Math.sin(0.5 * radian) / axis.length();
        if (!isFinite(s)) s = 0;
        return new Rotation(new Quaternion(c, s * axis.x, s * axis.y, s * axis.z));
    }
    static readonly UNIT = new Rotation(Quaternion.UNIT);
    get u() { return this.transform(Vec3.EX); }
    get v() { return this.transform(Vec3.EY); }
    get n() { return this.transform(Vec3.EZ); }
    clone() {
        return new Rotation(this.q.clone());
    }
    transform(p: Vec3): Vec3 {
        const q = this.q.mul(new Quaternion(1, p.x, p.y, p.z)).mul(this.q.conjugate());
        return new Vec3(q.x, q.y, q.z);
    }
    inverse(): Rotation {
        return new Rotation(this.q.conjugate());
    }
    mul(r: Rotation): Rotation {
        return new Rotation(this.q.mul(r.q));
    }
    toMatrix(): Matrix4 {
        const q = this.q;

        const ww = q.w * q.w;
        const xx = q.x * q.x;
        const yy = q.y * q.y;
        const zz = q.z * q.z;

        const wx = q.w * q.x;
        const wy = q.w * q.y;
        const wz = q.w * q.z;

        const xy = q.x * q.y;
        const yz = q.y * q.z;
        const zx = q.z * q.x;

        return new Matrix4([
            ww + xx - yy - zz, 2 * (xy + wz), 2 * (zx - wy), 0,
            2 * (xy - wz), ww - xx + yy - zz, 2 * (yz + wx), 0,
            2 * (zx + wy), 2 * (yz - wx), ww - xx - yy + zz, 0,
            0, 0, 0, 1
        ]);
    }
}

export class RigidTrans {
    constructor(readonly r: Rotation, readonly t: Vec3) { }
    static readonly UNIT = new RigidTrans(Rotation.UNIT, Vec3.ZERO);
    clone() {
        return new RigidTrans(this.r.clone(), this.t.clone());
    }
    transform(p: Vec3): Vec3 {
        return this.r.transform(p).add(this.t);
    }
    inverse(): RigidTrans {
        const r = this.r.inverse();
        const v = r.transform(this.t).neg();
        return new RigidTrans(r, v);
    }
    toMatrix(): Matrix4 {
        let mat = this.r.toMatrix();
        mat.array[12] = this.t.x;
        mat.array[13] = this.t.y;
        mat.array[14] = this.t.z;
        return mat;
    }
}
