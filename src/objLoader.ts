export interface ObjMesh {
    vertices: Float32Array;
    indices: Uint16Array;
    uvs: Float32Array;
}

export async function loadOBJ(url: string): Promise<ObjMesh> {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split("\n");

    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const finalVertices: number[] = [];
    const finalUVs: number[] = [];

    const uniqueVertices = new Map<string, number>();
    let index = 0;

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v') {
            positions.push(...parts.slice(1).map(Number));
        } else if (parts[0] === 'vt') {
            uvs.push(...parts.slice(1).map(Number));
        } else if (parts[0] === 'f') {
            for (let i = 1; i <= 3; i++) {
                const key = parts[i];
                if (!uniqueVertices.has(key)) {
                    const [vIndex, vtIndex] = key.split('/').map(idx => parseInt(idx) - 1);
                    finalVertices.push(
                        positions[vIndex * 3],
                        positions[vIndex * 3 + 1],
                        positions[vIndex * 3 + 2]
                    );
                    finalUVs.push(
                        uvs[vtIndex * 2],
                        uvs[vtIndex * 2 + 1]
                    );
                    uniqueVertices.set(key, index++);
                }
                indices.push(uniqueVertices.get(key)!);
            }
        }
    }

    return {
        vertices: new Float32Array(finalVertices),
        uvs: new Float32Array(finalUVs),
        indices: new Uint16Array(indices),
    };
}
