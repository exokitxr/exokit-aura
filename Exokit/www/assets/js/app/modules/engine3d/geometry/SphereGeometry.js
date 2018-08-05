class SphereGeometry extends Geometry {
    constructor(radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
        super();

        widthSegments = Math.max(3, Math.floor(widthSegments));
        heightSegments = Math.max(2, Math.floor(heightSegments));

        let thetaEnd = thetaStart + thetaLength;
        let ix, iy;
        let index = 0;
        let grid = [];

        let vertex = new Vector3();
        let normal = new Vector3();

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        for (iy = 0; iy <= heightSegments; iy ++) {
            let verticesRow = [];
            let v = iy / heightSegments;

            for (ix = 0; ix <= widthSegments; ix ++) {
                let u = ix / widthSegments;
    
                vertex.x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin( thetaStart + v * thetaLength);
                vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
                vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin( thetaStart + v * thetaLength);
                vertices.push(vertex.x, vertex.y, vertex.z);
    
                normal.set(vertex.x, vertex.y, vertex.z).normalize();
                normals.push(normal.x, normal.y, normal.z);
    
                uvs.push(u, 1 - v);
                verticesRow.push(index++);
            }
    
            grid.push(verticesRow);
        }

        for (iy = 0; iy < heightSegments; iy++) {
            for (ix = 0; ix < widthSegments; ix++) {
                let a = grid[ iy ][ ix + 1 ];
                let b = grid[ iy ][ ix ];
                let c = grid[ iy + 1 ][ ix ];
                let d = grid[ iy + 1 ][ ix + 1 ];
    
                if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
                if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
            }
        }

        this.index = new Uint16Array(indices);
        this.addAttribute('position', new GeometryAttribute(new Float32Array(vertices), 3));
        this.addAttribute('normal', new GeometryAttribute(new Float32Array(normals), 3));
        this.addAttribute('uv', new GeometryAttribute(new Float32Array(uvs), 2));
    }
}