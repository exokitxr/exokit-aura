class CylinderGeometry extends Geometry {
    constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI*2) {
        super();

        radialSegments = Math.floor(radialSegments);
        heightSegments = Math.floor(heightSegments);

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        let index = 0;
        let indexArray = [];
        let halfHeight = height / 2;

        generateTorso();

        if (openEnded === false) {
            if (radiusTop > 0) generateCap(true);
            if (radiusBottom > 0) generateCap(false);
        }

        this.index = new Uint16Array(indices);
        this.addAttribute('position', new GeometryAttribute(new Float32Array(vertices), 3));
        this.addAttribute('normal', new GeometryAttribute(new Float32Array(normals), 3));
        this.addAttribute('uv', new GeometryAttribute(new Float32Array(uvs), 2));

        function generateTorso() {
            let x, y;
            let normal = new Vector3();
            let vertex = new Vector3();
            let slope = (radiusBottom - radiusTop) / height;

            for (y = 0; y <= heightSegments; y++) {
                let indexRow = [];
                let v = y / heightSegments;
                let radius = v * (radiusBottom - radiusTop) + radiusTop;

                for (x = 0; x <= radialSegments; x++) {
                    let u = x / radialSegments;
                    let theta = u * thetaLength + thetaStart;
                    let sinTheta = Math.sin(theta);
                    let cosTheta = Math.cos(theta);

                    vertex.x = radius * sinTheta;
                    vertex.y = - v * height + halfHeight;
                    vertex.z = radius * cosTheta;
                    vertices.push(vertex.x, vertex.y, vertex.z);

                    normal.set(sinTheta, slope, cosTheta).normalize();
                    normals.push(normal.x, normal.y, normal.z);

                    uvs.push(u, 1 - v);

                    indexRow.push(index++);
                }

                indexArray.push(indexRow);
            }

            for (x = 0; x < radialSegments; x++) {
                for (y = 0; y < heightSegments; y++) {
                    let a = indexArray[y][x];
                    let b = indexArray[y + 1][x];
                    let c = indexArray[y + 1][x + 1];
                    let d = indexArray[y][x + 1];

                    indices.push(a, b, d);
                    indices.push(b, c, d);
                }
            }
        }

        function generateCap(top) {
            let x, centerIndexStart, centerIndexEnd;
            let uv = new Vector2();
            let vertex = new Vector3();
            let radius = (top === true) ? radiusTop : radiusBottom;
            let sign = (top === true) ? 1 : - 1;

            centerIndexStart = index;

            for (x = 1; x <= radialSegments; x++) {
                vertices.push(0, halfHeight * sign, 0);
                normals.push(0, sign, 0);
                uvs.push(0.5, 0.5);
                index++;
            }

            centerIndexEnd = index;

            for (x = 0; x <= radialSegments; x++) {
                let u = x / radialSegments;
                let theta = u * thetaLength + thetaStart;
                let cosTheta = Math.cos(theta);
                let sinTheta = Math.sin(theta);

                vertex.x = radius * sinTheta;
                vertex.y = halfHeight * sign;
                vertex.z = radius * cosTheta;
                vertices.push(vertex.x, vertex.y, vertex.z);

                normals.push(0, sign, 0);

                uv.x = (cosTheta * 0.5) + 0.5;
                uv.y = (sinTheta * 0.5 * sign) + 0.5;
                uvs.push(uv.x, uv.y);

                index++;
            }

            for (x = 0; x < radialSegments; x++) {
                let c = centerIndexStart + x;
                let i = centerIndexEnd + x;

                if (top === true) {
                    indices.push(i, i + 1, c);
                } else {
                    indices.push(i + 1, i, c);
                }
            }
        }
    }
}

class ConeGeometry extends CylinderGeometry {
    constructor(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength) {
        super(0, radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
    }
}