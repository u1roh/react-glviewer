import Triangles from './tris';
import * as points from './points';

class ArrayBuf {
    public static readFile(file: File): Promise<ArrayBuffer> {
        return new Promise<ArrayBuffer>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.readAsArrayBuffer(file);
        });
    }
}

export class STLFormat {
    /*
    public static readBuf(data: ArrayBuffer): Triangles {
        const isLittleEndian = true;
        const view = new DataView(data);
        const ntris = view.getUint32(80, true); // little endian を指定する必要あり
        const points = new Float32Array(3 * 3 * ntris);
        const normals = new Float32Array(3 * 3 * ntris);
        for (let i = 0; i < ntris; ++i) {
            let pos = 84 + i * 50;
            const read = function () { pos += 4; return view.getFloat32(pos - 4, isLittleEndian); }
            const nx = read();
            const ny = read();
            const nz = read();
            for (let k = 0; k < 3; ++k) {
                const idx = 3 * (3 * i + k);
                normals[idx + 0] = nx;
                normals[idx + 1] = ny;
                normals[idx + 2] = nz;
                points[idx + 0] = read();
                points[idx + 1] = read();
                points[idx + 2] = read();
            }
        }
        return new Triangles(points, normals);
    }
    */
    public static readBuf(data: ArrayBuffer): Triangles {
        const isLittleEndian = true;
        const view = new DataView(data);
        const ntris = view.getUint32(80, true); // little endian を指定する必要あり
        const pointNormals = new Float32Array((3 + 3) * 3 * ntris);
        for (let i = 0; i < ntris; ++i) {
            let pos = 84 + i * 50;
            const read = function () { pos += 4; return view.getFloat32(pos - 4, isLittleEndian); }
            const nx = read();
            const ny = read();
            const nz = read();
            for (let k = 0; k < 3; ++k) {
                const idx = 6 * (3 * i + k);
                pointNormals[idx + 0] = read();
                pointNormals[idx + 1] = read();
                pointNormals[idx + 2] = read();
                pointNormals[idx + 3] = nx;
                pointNormals[idx + 4] = ny;
                pointNormals[idx + 5] = nz;
            }
        }
        return new Triangles(points.createInterleavedPointNormals(pointNormals));
    }

    public static async readFile(file: File): Promise<Triangles> {
        const buf = await ArrayBuf.readFile(file);
        return STLFormat.readBuf(buf);
    }

    public static async readURL(url: string) {
        const response = await fetch(url);
        const buf = await response.arrayBuffer();
        return STLFormat.readBuf(buf);
    }
}
