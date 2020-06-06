
export class Vec2 {
    x: number; y: number;
    constructor(x: number, y: number) {
        this.x = x; this.y = y;
    }
    static zero() { return new Vec2(0, 0); }
    static ex() { return new Vec2(1, 0); }
    static ey() { return new Vec2(0, 1); }
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
    x: number; y: number; z: number;
    constructor(x: number, y: number, z: number) {
        this.x = x; this.y = y; this.z = z;
    }
    static zero() { return new Vec3(0, 0, 0); }
    static ex() { return new Vec3(1, 0, 0); }
    static ey() { return new Vec3(0, 1, 0); }
    static ez() { return new Vec3(0, 0, 1); }
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
    private a: number[];
    constructor(a: number[]) {
        if (a.length !== 16) throw new Error("Matrix4: a.length != 16");
        this.a = a;
    }
    static zero() {
        return new Matrix4([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);
    }
    static unit() {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }
    array(): number[] {
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
    center: Vec3;
    radius: number;
    constructor(center: Vec3, radius: number) {
        this.center = center;
        this.radius = radius;
    }
    static unit() {
        return new Sphere(Vec3.zero(), 1.0);
    }
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
            case 0: return new Sphere(Vec3.zero(), 0.0);
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
    lower: number;
    upper: number;
    constructor(lower: number, upper: number) {
        this.lower = lower;
        this.upper = upper;
    }
    width(): number {
        return this.upper - this.lower;
    }
    center(): number {
        return (this.lower + this.upper) / 2;
    }
}

export class Box2 {
    x: Interval;
    y: Interval;
    constructor(x: Interval, y: Interval) {
        this.x = x;
        this.y = y;
    }
    lower(): Vec2 {
        return new Vec2(this.x.lower, this.y.lower);
    }
    upper(): Vec2 {
        return new Vec2(this.x.upper, this.y.upper);
    }
    center(): Vec2 {
        return new Vec2(this.x.center(), this.y.center());
    }
    points_ccw(): Vec2[] {
        return [
            new Vec2(this.x.lower, this.y.lower),
            new Vec2(this.x.upper, this.y.lower),
            new Vec2(this.x.upper, this.y.upper),
            new Vec2(this.x.lower, this.y.upper),
        ];
    }
}

export class Box3 {
    x: Interval;
    y: Interval;
    z: Interval;
    constructor(x: Interval, y: Interval, z: Interval) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    lower(): Vec3 {
        return new Vec3(this.x.lower, this.y.lower, this.z.lower);
    }
    upper(): Vec3 {
        return new Vec3(this.x.upper, this.y.upper, this.z.upper);
    }
    center(): Vec3 {
        return new Vec3(this.x.center(), this.y.center(), this.z.center());
    }
    boundingSphere(): Sphere {
        const center = this.center();
        const radius = this.upper().sub(center).length();
        return new Sphere(center, radius);
    }
    static boundaryOf(points: Float32Array): Box3 {
        let box = new Box3(
            new Interval(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
            new Interval(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY),
            new Interval(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY));
        for (let i = 0; i < points.length; ++i) {
            let r: Interval | null = null;
            switch (i % 3) {
                case 0: r = box.x; break;
                case 1: r = box.y; break;
                case 2: r = box.z; break;
            }
            if (r != null) {
                if (points[i] < r.lower) r.lower = points[i];
                if (points[i] > r.upper) r.upper = points[i];
            }
        }
        return box;
    }
}

export class Triangle {
    p1: Vec3;
    p2: Vec3;
    p3: Vec3;
    constructor(p1: Vec3, p2: Vec3, p3: Vec3) {
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }
}

export class Quaternion {
    w: number;
    x: number;
    y: number;
    z: number;
    constructor(w: number, x: number, y: number, z: number) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }
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
}

export class Rotation {
    private q: Quaternion;
    constructor(q: Quaternion) {
        this.q = q;
    }
    static ofAxis(axis: Vec3, radian: number): Rotation {
        let c = Math.cos(0.5 * radian);
        let s = Math.sin(0.5 * radian) / axis.length();
        if (!isFinite(s)) s = 0;
        return new Rotation(new Quaternion(c, s * axis.x, s * axis.y, s * axis.z));
    }
    static unit() {
        return new Rotation(new Quaternion(1, 0, 0, 0));
    }
    u() { return this.transform(Vec3.ex()); }
    v() { return this.transform(Vec3.ey()); }
    n() { return this.transform(Vec3.ez()); }
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
    r: Rotation;
    t: Vec3; // translation
    constructor(r: Rotation, t: Vec3) {
        this.r = r;
        this.t = t;
    }
    static unit() {
        return new RigidTrans(Rotation.unit(), Vec3.zero());
    }
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
        mat.array()[12] = this.t.x;
        mat.array()[13] = this.t.y;
        mat.array()[14] = this.t.z;
        return mat;
    }
}
