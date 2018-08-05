class PolyhedronGeometry extends Geometry {
    constructor(vertices, indices = [], radius = 1, detail = 0) {
        super();

        let vertexBuffer = [];
        let uvBuffer = [];

        subdivide(detail);
        appplyRadius(radius);
        generateUVs();

        this.addAttribute('position', new GeometryAttribute(new Float32Array(vertexBuffer), 3));
        this.addAttribute('normal', new GeometryAttribute(new Float32Array(vertexBuffer.slice()), 3));
        this.addAttribute('uv', new GeometryAttribute(new Float32Array(uvBuffer), 2));

        // this.index = new Uint16Array(indices);

        if (detail === 0) {
            this.computeVertexNormals(); // flat normals
        } else {
            this.normalizeNormals(); // smooth normals
        }

        function subdivide( detail ) {
            let a = new Vector3();
            let b = new Vector3();
            let c = new Vector3();
            for (let i = 0; i < indices.length; i += 3) {
                getVertexByIndex(indices[i + 0], a);
                getVertexByIndex(indices[i + 1], b);
                getVertexByIndex(indices[i + 2], c);
                subdivideFace(a, b, c, detail);
            }
        }

        function subdivideFace(a, b, c, detail) {
            var cols = Math.pow(2, detail);
            var v = [];
            var i, j;
    
            for (i = 0; i <= cols; i++) {
                v[ i ] = [];
                var aj = a.clone().lerp(c, i / cols);
                var bj = b.clone().lerp(c, i / cols);
                var rows = cols - i;
                for (j = 0; j <= rows; j++) {
                    if (j === 0 && i === cols) {
                        v[i][j] = aj;
                    } else {
                        v[i][j] = aj.clone().lerp(bj, j / rows);
                    }
                }
            }
    
            for (i = 0; i < cols; i++) {
                for (j = 0; j < 2 * (cols - i) - 1; j++) {
                    var k = Math.floor(j / 2);
                    if (j % 2 === 0) {
                        pushVertex(v[i][k+1]);
                        pushVertex(v[i+1][k]);
                        pushVertex(v[i][k]);
                    } else {
                        pushVertex(v[i][k+1]);
                        pushVertex(v[i+1][k+1]);
                        pushVertex(v[i+1][k]);
                    }
                }
            }
        }

        function appplyRadius(radius ) {
            var vertex = new Vector3();
            for ( var i = 0; i < vertexBuffer.length; i += 3 ) {
                vertex.x = vertexBuffer[i + 0];
                vertex.y = vertexBuffer[i + 1];
                vertex.z = vertexBuffer[i + 2];
    
                vertex.normalize().multiplyScalar(radius);
    
                vertexBuffer[i + 0] = vertex.x;
                vertexBuffer[i + 1] = vertex.y;
                vertexBuffer[i + 2] = vertex.z;
            }
        }


        function generateUVs() {
            let vertex = new Vector3();
            for (let i = 0; i < vertexBuffer.length; i += 3) {
                vertex.x = vertexBuffer[i + 0];
                vertex.y = vertexBuffer[i + 1];
                vertex.z = vertexBuffer[i + 2];

                let u = azimuth(vertex) / 2 / Math.PI + 0.5;
                let v = inclination(vertex) / Math.PI + 0.5;
                uvBuffer.push(u, 1 - v);
            }
            correctUVs();
            correctSeam();
        }

        function correctSeam() {
            for (let i = 0; i < uvBuffer.length; i += 6) {
                let x0 = uvBuffer[i + 0];
                let x1 = uvBuffer[i + 2];
                let x2 = uvBuffer[i + 4];
                let max = Math.max(x0, x1, x2);
                let min = Math.min(x0, x1, x2);
                if (max > 0.9 && min < 0.1) {
                    if (x0 < 0.2) uvBuffer[i + 0] += 1;
                    if (x1 < 0.2) uvBuffer[i + 2] += 1;
                    if (x2 < 0.2) uvBuffer[i + 4] += 1;
                }
            }
        }
    
        function pushVertex(vertex) {
            vertexBuffer.push(vertex.x, vertex.y, vertex.z);
        }

        function getVertexByIndex( index, vertex ) {
            let stride = index * 3;
            vertex.x = vertices[stride + 0];
            vertex.y = vertices[stride + 1];
            vertex.z = vertices[stride + 2];
        }

        function correctUVs() {
            let a = new Vector3();
            let b = new Vector3();
            let c = new Vector3();
    
            let centroid = new Vector3();
    
            let uvA = new Vector2();
            let uvB = new Vector2();
            let uvC = new Vector2();
    
            for (let i = 0, j = 0; i < vertexBuffer.length; i += 9, j += 6) {
                a.set(vertexBuffer[i + 0], vertexBuffer[i + 1], vertexBuffer[i + 2]);
                b.set(vertexBuffer[i + 3], vertexBuffer[i + 4], vertexBuffer[i + 5]);
                c.set(vertexBuffer[i + 6], vertexBuffer[i + 7], vertexBuffer[i + 8]);
    
                uvA.set(uvBuffer[j + 0], uvBuffer[j + 1]);
                uvB.set(uvBuffer[j + 2], uvBuffer[j + 3]);
                uvC.set(uvBuffer[j + 4], uvBuffer[j + 5]);
    
                centroid.copy(a).add(b).add(c).divideScalar(3);
    
                let azi = azimuth(centroid);
    
                correctUV(uvA, j + 0, a, azi);
                correctUV(uvB, j + 2, b, azi);
                correctUV(uvC, j + 4, c, azi);
            }
        }

        function correctUV(uv, stride, vector, azimuth) {
            if ((azimuth < 0) && (uv.x === 1)) {
                uvBuffer[stride] = uv.x - 1;
            }
    
            if ((vector.x === 0) && (vector.z === 0)) {
                uvBuffer[stride] = azimuth / 2 / Math.PI + 0.5;
            }
        }

        function azimuth(vector) {
            return Math.atan2(vector.z, - vector.x);
        }

        function inclination(vector) {
            return Math.atan2(- vector.y, Math.sqrt((vector.x * vector.x) + (vector.z * vector.z)));
        }
    }
}

class IcosahedronGeometry extends PolyhedronGeometry {
    constructor(radius, detail) {
        let t = ( 1 + Math.sqrt( 5 ) ) / 2;
        let vertices = [
            - 1, t, 0, 	1, t, 0, 	- 1, - t, 0, 	1, - t, 0,
            0, - 1, t, 	0, 1, t,	0, - 1, - t, 	0, 1, - t,
            t, 0, - 1, 	t, 0, 1, 	- t, 0, - 1, 	- t, 0, 1
        ];
    
        let indices = [
            0, 11, 5, 	0, 5, 1, 	0, 1, 7, 	0, 7, 10, 	0, 10, 11,
            1, 5, 9, 	5, 11, 4,	11, 10, 2,	10, 7, 6,	7, 1, 8,
            3, 9, 4, 	3, 4, 2,	3, 2, 6,	3, 6, 8,	3, 8, 9,
            4, 9, 5, 	2, 4, 11,	6, 2, 10,	8, 6, 7,	9, 8, 1
        ];

        super(vertices, indices, radius, detail);
    }
}