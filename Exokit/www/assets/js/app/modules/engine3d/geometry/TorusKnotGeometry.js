class TorusKnotGeometry extends Geometry {
    constructor(radius = 1, tube = 0.4, tubularSegments = 64, radialSegments = 8, p = 2, q = 3) {
        super();

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        let i, j;

        let vertex = new Vector3();
        let normal = new Vector3();

        let P1 = new Vector3();
        let P2 = new Vector3();

        let B = new Vector3();
        let T = new Vector3();
        let N = new Vector3();

        for (i = 0; i <= tubularSegments; ++i) {
            let u = i / tubularSegments * p * Math.PI * 2;
            calculatePositionOnCurve(u, p, q, radius, P1);
            calculatePositionOnCurve(u + 0.01, p, q, radius, P2);

            T.subVectors(P2, P1);
            N.addVectors(P2, P1);
            B.crossVectors(T, N);
            N.crossVectors(B, T);

            B.normalize();
            N.normalize();

            for (j = 0; j <= radialSegments; ++j) {
                let v = j / radialSegments * Math.PI * 2;
                let cx = -tube * Math.cos(v);
                let cy = tube * Math.sin(v);

                vertex.x = P1.x + (cx * N.x + cy * B.x);
                vertex.y = P1.y + (cx * N.y + cy * B.y);
                vertex.z = P1.z + (cx * N.z + cy * B.z);

                vertices.push(vertex.x, vertex.y, vertex.z);

                normal.subVectors(vertex, P1).normalize();

                normals.push(normal.x, normal.y, normal.z);

                uvs.push(i / tubularSegments);
                uvs.push(j / radialSegments);

            }

        }

        for (j = 1; j <= tubularSegments; j++) {

            for (i = 1; i <= radialSegments; i++) {

                let a = (radialSegments + 1) * (j - 1) + (i - 1);
                let b = (radialSegments + 1) * j + (i - 1);
                let c = (radialSegments + 1) * j + i;
                let d = (radialSegments + 1) * (j - 1) + i;

                indices.push(a, b, d);
                indices.push(b, c, d);

            }

        }

        this.index = new Uint16Array(indices);
        this.addAttribute('position', new GeometryAttribute(new Float32Array(vertices), 3));
        this.addAttribute('normal', new GeometryAttribute(new Float32Array(normals), 3));
        this.addAttribute('uv', new GeometryAttribute(new Float32Array(uvs), 2));

        function calculatePositionOnCurve(u, p, q, radius, position) {

            let cu = Math.cos(u);
            let su = Math.sin(u);
            let quOverP = q / p * u;
            let cs = Math.cos(quOverP);

            position.x = radius * (2 + cs) * 0.5 * cu;
            position.y = radius * (2 + cs) * su * 0.5;
            position.z = radius * Math.sin(quOverP) * 0.5;

        }
    }
}