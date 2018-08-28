class BoxGeometry extends Geometry {
    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
        super();

        widthSegments = Math.floor(widthSegments);
        heightSegments = Math.floor(heightSegments);
        depthSegments = Math.floor(depthSegments);

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];
        let numberOfVertices = 0;

        buildPlane('z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0);
        buildPlane('z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1);
        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2);
        buildPlane('x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3);
        buildPlane('x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4);
        buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5); 

        this.index = new Uint16Array(indices);
        this.addAttribute('position', new GeometryAttribute(new Float32Array(vertices), 3));
        this.addAttribute('normal', new GeometryAttribute(new Float32Array(normals), 3));
        this.addAttribute('uv', new GeometryAttribute(new Float32Array(uvs), 2));

        function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {
            let segmentWidth = width / gridX;
            let segmentHeight = height / gridY;
            let widthHalf = width / 2;
            let heightHalf = height / 2;
            let depthHalf = depth / 2;
            let gridX1 = gridX + 1;
            let gridY1 = gridY + 1;
            let vertexCounter = 0;
            let ix, iy;
            let vector = new Vector3();
    
            for (iy = 0; iy < gridY1; iy ++) {
                let y = iy * segmentHeight - heightHalf;
                for (ix = 0; ix < gridX1; ix ++) {
                    let x = ix * segmentWidth - widthHalf;
    
                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;
                    vertices.push(vector.x, vector.y, vector.z);
    
                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : - 1;
                    normals.push(vector.x, vector.y, vector.z);
    
                    uvs.push(ix / gridX);
                    uvs.push(1 - (iy / gridY));
    
                    vertexCounter += 1;
                }
            }
    
            for (iy = 0; iy < gridY; iy ++) {
                for (ix = 0; ix < gridX; ix ++) {
                    let a = numberOfVertices + ix + gridX1 * iy;
                    let b = numberOfVertices + ix + gridX1 * (iy + 1);
                    let c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
                    let d = numberOfVertices + (ix + 1) + gridX1 * iy;

                    indices.push( a, b, d );
                    indices.push( b, c, d );
                }
            }
            numberOfVertices += vertexCounter;
        }
    };
}