class PlaneGeometry extends Geometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
        super();
        let width_half = width / 2;
        let height_half = height / 2;

        let gridX = Math.floor( widthSegments ) || 1;
        let gridY = Math.floor( heightSegments ) || 1;

        let gridX1 = gridX + 1;
        let gridY1 = gridY + 1;

        let segment_width = width / gridX;
        let segment_height = height / gridY;

        let ix, iy;

        // buffers

        let indices = [];
        let vertices = [];
        let normals = [];
        let uvs = [];

        for ( iy = 0; iy < gridY1; iy ++ ) {
            let y = iy * segment_height - height_half;
            for ( ix = 0; ix < gridX1; ix ++ ) {
                let x = ix * segment_width - width_half;
                vertices.push( x, - y, 0 );
                normals.push( 0, 0, 1 );

                uvs.push( ix / gridX );
                uvs.push( 1 - ( iy / gridY ) );
            }
        }

        // indices

        for ( iy = 0; iy < gridY; iy ++ ) {
            for ( ix = 0; ix < gridX; ix ++ ) {
                let a = ix + gridX1 * iy;
                let b = ix + gridX1 * ( iy + 1 );
                let c = ( ix + 1 ) + gridX1 * ( iy + 1 );
                let d = ( ix + 1 ) + gridX1 * iy;

                // faces

                indices.push( a, b, d );
                indices.push( b, c, d );

            }
        }

        this.index = new Uint16Array(indices);
        this.addAttribute('position', new GeometryAttribute(new Float32Array(vertices), 3));
        this.addAttribute('normal', new GeometryAttribute(new Float32Array(normals), 3));
        this.addAttribute('uv', new GeometryAttribute(new Float32Array(uvs), 2));
    }
}