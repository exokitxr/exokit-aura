/**
 * @name Frustum
 */
class Frustum {
    constructor(p0, p1, p2, p3, p4, p5) {
        this.planes = [
            ( p0 !== undefined ) ? p0 : new Plane(),
            ( p1 !== undefined ) ? p1 : new Plane(),
            ( p2 !== undefined ) ? p2 : new Plane(),
            ( p3 !== undefined ) ? p3 : new Plane(),
            ( p4 !== undefined ) ? p4 : new Plane(),
            ( p5 !== undefined ) ? p5 : new Plane()
        ];
    }

    set(p0, p1, p2, p3, p4, p5) {
        let planes = this.planes;

        planes[ 0 ].copy( p0 );
        planes[ 1 ].copy( p1 );
        planes[ 2 ].copy( p2 );
        planes[ 3 ].copy( p3 );
        planes[ 4 ].copy( p4 );
        planes[ 5 ].copy( p5 );

        return this;
    }

    clone() {
        return new Frustum().copy(this);
    }

    copy(frustum) {
        let planes = this.planes;
        for ( let i = 0; i < 6; i ++ ) {
            planes[ i ].copy( frustum.planes[ i ] );
        }

        return this;
    }

    /**
     * @name setFromMatrix
     * @memberof Frustum
     *
     * @function
     * @param {Matrix4} m
     * @return {Frustum}
     */
    setFromMatrix(m) {
        let planes = this.planes;
        let me = m.elements;
        let me0 = me[ 0 ], me1 = me[ 1 ], me2 = me[ 2 ], me3 = me[ 3 ];
        let me4 = me[ 4 ], me5 = me[ 5 ], me6 = me[ 6 ], me7 = me[ 7 ];
        let me8 = me[ 8 ], me9 = me[ 9 ], me10 = me[ 10 ], me11 = me[ 11 ];
        let me12 = me[ 12 ], me13 = me[ 13 ], me14 = me[ 14 ], me15 = me[ 15 ];

        planes[ 0 ].setComponents( me3 - me0, me7 - me4, me11 - me8, me15 - me12 ).normalize();
        planes[ 1 ].setComponents( me3 + me0, me7 + me4, me11 + me8, me15 + me12 ).normalize();
        planes[ 2 ].setComponents( me3 + me1, me7 + me5, me11 + me9, me15 + me13 ).normalize();
        planes[ 3 ].setComponents( me3 - me1, me7 - me5, me11 - me9, me15 - me13 ).normalize();
        planes[ 4 ].setComponents( me3 - me2, me7 - me6, me11 - me10, me15 - me14 ).normalize();
        planes[ 5 ].setComponents( me3 + me2, me7 + me6, me11 + me10, me15 + me14 ).normalize();

        return this;
    }

    /**
     * @name setFromCamera
     * @memberof Frustum
     *
     * @function
     * @param {CameraBase3D} camera
     * @return {Frustum}
     */
    setFromCamera(camera) {
        let matrix = this.M1 || new Matrix4();
        this.M1 = matrix;

        matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        return this.setFromMatrix(matrix);
    }

    /**
     * @name intersectsObject
     * @memberof Frustum
     *
     * @function
     * @param {Base3D} object
     * @return {Boolean}
     */
    intersectsObject(object) {
        let sphere = this.S1 || new Sphere();
        this.S1 = sphere;

        let geometry = object.geometry;

        if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

        sphere.copy(geometry.boundingSphere).applyMatrix4(object.matrixWorld);

        return this.intersectsSphere(sphere);
    }

    /**
     * @name intersectsSphere
     * @memberof Frustum
     *
     * @function
     * @param {Sphere} sphere
     * @return {Boolean}
     */
    intersectsSphere(sphere) {
        let planes = this.planes;
        let center = sphere.center;
        let negRadius = - sphere.radius;

        for ( let i = 0; i < 6; i ++ ) {
            let distance = planes[ i ].distanceToPoint( center );
            if ( distance < negRadius ) {
                return false;
            }
        }

        return true;
    }

    /**
     * @name intersectsBox
     * @memberof Frustum
     *
     * @function
     * @param {Box3} box
     * @return {Boolean}
     */
    intersectsBox(box) {
        let p1 = this.V1 || new Vector3();
        let p2 = this.V2 || new Vector3();
        this.V1 = p1;
        this.V2 = p2;

        let planes = this.planes;

        for ( let i = 0; i < 6; i ++ ) {
            let plane = planes[i];

            p1.x = plane.normal.x > 0 ? box.min.x : box.max.x;
            p2.x = plane.normal.x > 0 ? box.max.x : box.min.x;
            p1.y = plane.normal.y > 0 ? box.min.y : box.max.y;
            p2.y = plane.normal.y > 0 ? box.max.y : box.min.y;
            p1.z = plane.normal.z > 0 ? box.min.z : box.max.z;
            p2.z = plane.normal.z > 0 ? box.max.z : box.min.z;

            let d1 = plane.distanceToPoint(p1);
            let d2 = plane.distanceToPoint(p2);


            if (d1 < 0 && d2 < 0) {
                return false;
            }
        }

        return true;
    }

    containsPoint(point) {
        let planes = this.planes;

        for ( let i = 0; i < 6; i ++ ) {
            if ( planes[ i ].distanceToPoint( point ) < 0 ) {
                return false;
            }
        }

        return true;
    }
}