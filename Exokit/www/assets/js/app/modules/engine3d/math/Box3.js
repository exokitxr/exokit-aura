class Box3 {
    constructor(min, max) {
        this.min = ( min !== undefined ) ? min : new Vector3( + Infinity, + Infinity, + Infinity );
        this.max = ( max !== undefined ) ? max : new Vector3( - Infinity, - Infinity, - Infinity );
    }

    set(min, max) {
        this.min.copy( min );
        this.max.copy( max );

        return this;
    }

    setFromArray(array) {
        let minX = + Infinity;
        let minY = + Infinity;
        let minZ = + Infinity;

        let maxX = - Infinity;
        let maxY = - Infinity;
        let maxZ = - Infinity;

        for ( let i = 0, l = array.length; i < l; i += 3 ) {

            let x = array[ i ];
            let y = array[ i + 1 ];
            let z = array[ i + 2 ];

            if ( x < minX ) minX = x;
            if ( y < minY ) minY = y;
            if ( z < minZ ) minZ = z;

            if ( x > maxX ) maxX = x;
            if ( y > maxY ) maxY = y;
            if ( z > maxZ ) maxZ = z;

        }

        this.min.set( minX, minY, minZ );
        this.max.set( maxX, maxY, maxZ );

        return this;
    }

    setFromBufferAttribute(attribute) {
        let minX = +Infinity;
        let minY = +Infinity;
        let minZ = +Infinity;

        let maxX = -Infinity;
        let maxY = -Infinity;
        let maxZ = -Infinity;

        for (let i = 0, l = attribute.count; i < l; i++) {

            let x = attribute.array[i * 3 + 0];
            let y = attribute.array[i * 3 + 1];
            let z = attribute.array[i * 3 + 2];

            if ( x < minX ) minX = x;
            if ( y < minY ) minY = y;
            if ( z < minZ ) minZ = z;

            if ( x > maxX ) maxX = x;
            if ( y > maxY ) maxY = y;
            if ( z > maxZ ) maxZ = z;

        }

        this.min.set( minX, minY, minZ );
        this.max.set( maxX, maxY, maxZ );

        return this;

    }

    setFromPoints(points) {
        this.makeEmpty();

        for ( let i = 0, il = points.length; i < il; i ++ ) {

            this.expandByPoint( points[ i ] );

        }

        return this;
    }

    setFromCenterAndSize(center, size) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        let halfSize = v1.copy( size ).multiplyScalar( 0.5 );

        this.min.copy( center ).sub( halfSize );
        this.max.copy( center ).add( halfSize );

        return this;
    }

    setFromObject(object) {
        this.makeEmpty();

        return this.expandByObject( object );
    }

    clone() {
        return new Box3().copy(this);
    }

    copy(box) {
        this.min.copy( box.min );
        this.max.copy( box.max );

        return this;
    }

    makeEmpty() {
        this.min.x = this.min.y = this.min.z = + Infinity;
        this.max.x = this.max.y = this.max.z = - Infinity;

        return this;
    }

    isEmpty() {
        return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );
    }

    getCenter(target) {
        return this.isEmpty() ? target.set( 0, 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );
    }

    getSize(target) {
        return this.isEmpty() ? target.set( 0, 0, 0 ) : target.subVectors( this.max, this.min );
    }

    expandByPoint(point) {
        this.min.min( point );
        this.max.max( point );

        return this;
    }

    expandByVector(vector) {
        this.min.sub( vector );
        this.max.add( vector );

        return this;
    }

    expandByScalar(scalar) {
        this.min.addScalar( - scalar );
        this.max.addScalar( scalar );

        return this;
    }

    expandByObject(object) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        let scope, i, l;

        scope = this;
        object.updateMatrixWorld(true);
        object.traverse(node => {
            let geometry = node.geometry;
            let attribute = geometry.attributes.position;
            if ( attribute !== undefined ) {
                for ( i = 0, l = attribute.count; i < l; i ++ ) {
                    v1.fromBufferAttribute( attribute, i ).applyMatrix4( node.matrixWorld );
                    scope.expandByPoint( v1 );
                }
            }
        });

        return this;
    }

    containsPoint(point) {
        return point.x < this.min.x || point.x > this.max.x ||
        point.y < this.min.y || point.y > this.max.y ||
        point.z < this.min.z || point.z > this.max.z ? false : true;
    }

    containsBox(box) {
        return this.min.x <= box.min.x && box.max.x <= this.max.x &&
            this.min.y <= box.min.y && box.max.y <= this.max.y &&
            this.min.z <= box.min.z && box.max.z <= this.max.z;
    }

    getParameter(point, target) {
        return target.set(
            ( point.x - this.min.x ) / ( this.max.x - this.min.x ),
            ( point.y - this.min.y ) / ( this.max.y - this.min.y ),
            ( point.z - this.min.z ) / ( this.max.z - this.min.z )
        );
    }

    intersectsBox(box) {
        return box.max.x < this.min.x || box.min.x > this.max.x ||
        box.max.y < this.min.y || box.min.y > this.max.y ||
        box.max.z < this.min.z || box.min.z > this.max.z ? false : true;
    }

    intersectsSphere(sphere) {
        let closestPoint = this.V1 || new Vector3();
        this.V1 = closestPoint;

        this.clampPoint( sphere.center, closestPoint );
        return closestPoint.distanceToSquared( sphere.center ) <= ( sphere.radius * sphere.radius );
    }

    intersectsPlane(plane) {
        let min, max;

        if ( plane.normal.x > 0 ) {
            min = plane.normal.x * this.min.x;
            max = plane.normal.x * this.max.x;
        } else {
            min = plane.normal.x * this.max.x;
            max = plane.normal.x * this.min.x;
        }

        if ( plane.normal.y > 0 ) {
            min += plane.normal.y * this.min.y;
            max += plane.normal.y * this.max.y;
        } else {
            min += plane.normal.y * this.max.y;
            max += plane.normal.y * this.min.y;
        }

        if ( plane.normal.z > 0 ) {
            min += plane.normal.z * this.min.z;
            max += plane.normal.z * this.max.z;
        } else {
            min += plane.normal.z * this.max.z;
            max += plane.normal.z * this.min.z;
        }

        return ( min <= plane.constant && max >= plane.constant );
    }

    intersectsTriangle(triangle) {
        let v0 = this.V0 || new Vector3();
        this.V0 = v0;

        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        let v2 = this.V2 || new Vector3();
        this.V2 = v2;

        let f0 = this.F0 || new Vector3();
        this.F0 = f0;

        let f1 = this.F1 || new Vector3();
        this.F1 = f1;

        let f2 = this.F2 || new Vector3();
        this.F2 = f2;

        let testAxis = this.V3 || new Vector3();
        this.V3 = testAxis;

        let center = this.V4 || new Vector3();
        this.V4 = center;

        let extents = this.V5 || new Vector3();
        this.V5 = extents;

        let triangleNormal = this.V6 || new Vector3();
        this.V6 = triangleNormal;

        function satForAxes( axes ) {

            let i, j;

            for ( i = 0, j = axes.length - 3; i <= j; i += 3 ) {

                testAxis.fromArray( axes, i );
                // project the aabb onto the seperating axis
                let r = extents.x * Math.abs( testAxis.x ) + extents.y * Math.abs( testAxis.y ) + extents.z * Math.abs( testAxis.z );
                // project all 3 vertices of the triangle onto the seperating axis
                let p0 = v0.dot( testAxis );
                let p1 = v1.dot( testAxis );
                let p2 = v2.dot( testAxis );
                // actual test, basically see if either of the most extreme of the triangle points intersects r
                if ( Math.max( - Math.max( p0, p1, p2 ), Math.min( p0, p1, p2 ) ) > r ) {

                    // points of the projected triangle are outside the projected half-length of the aabb
                    // the axis is seperating and we can exit
                    return false;

                }

            }

            return true;

        }


        if ( this.isEmpty() ) {

            return false;

        }

        // compute box center and extents
        this.getCenter( center );
        extents.subVectors( this.max, center );

        // translate triangle to aabb origin
        v0.subVectors( triangle.a, center );
        v1.subVectors( triangle.b, center );
        v2.subVectors( triangle.c, center );

        // compute edge vectors for triangle
        f0.subVectors( v1, v0 );
        f1.subVectors( v2, v1 );
        f2.subVectors( v0, v2 );

        // test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
        // make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
        // axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
        let axes = [
            0, - f0.z, f0.y, 0, - f1.z, f1.y, 0, - f2.z, f2.y,
            f0.z, 0, - f0.x, f1.z, 0, - f1.x, f2.z, 0, - f2.x,
            - f0.y, f0.x, 0, - f1.y, f1.x, 0, - f2.y, f2.x, 0
        ];
        if ( ! satForAxes( axes ) ) {

            return false;

        }

        // test 3 face normals from the aabb
        axes = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
        if ( ! satForAxes( axes ) ) {

            return false;

        }

        // finally testing the face normal of the triangle
        // use already existing triangle edge vectors here
        triangleNormal.crossVectors( f0, f1 );
        axes = [ triangleNormal.x, triangleNormal.y, triangleNormal.z ];
        return satForAxes( axes );
    }

    clampPoint(point, target) {
        return target.copy( point ).clamp( this.min, this.max );
    }

    distanceToPoint(point) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        let clampedPoint = v1.copy( point ).clamp( this.min, this.max );
        return clampedPoint.sub( point ).length();
    }

    getBoundingSphere(target) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        this.getCenter( target.center );
        target.radius = this.getSize( v1 ).length() * 0.5;
        return target;
    }

    intersect(box) {
        this.min.max( box.min );
        this.max.min( box.max );
        // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
        if ( this.isEmpty() ) this.makeEmpty();
        return this;
    }

    union(box) {
        this.min.min( box.min );
        this.max.max( box.max );
        return this;
    }

    applyMatrix4(matrix) {
        if ( this.isEmpty() ) return this;

        let m = matrix.elements;

        let xax = m[ 0 ] * this.min.x, xay = m[ 1 ] * this.min.x, xaz = m[ 2 ] * this.min.x;
        let xbx = m[ 0 ] * this.max.x, xby = m[ 1 ] * this.max.x, xbz = m[ 2 ] * this.max.x;
        let yax = m[ 4 ] * this.min.y, yay = m[ 5 ] * this.min.y, yaz = m[ 6 ] * this.min.y;
        let ybx = m[ 4 ] * this.max.y, yby = m[ 5 ] * this.max.y, ybz = m[ 6 ] * this.max.y;
        let zax = m[ 8 ] * this.min.z, zay = m[ 9 ] * this.min.z, zaz = m[ 10 ] * this.min.z;
        let zbx = m[ 8 ] * this.max.z, zby = m[ 9 ] * this.max.z, zbz = m[ 10 ] * this.max.z;

        this.min.x = Math.min( xax, xbx ) + Math.min( yax, ybx ) + Math.min( zax, zbx ) + m[ 12 ];
        this.min.y = Math.min( xay, xby ) + Math.min( yay, yby ) + Math.min( zay, zby ) + m[ 13 ];
        this.min.z = Math.min( xaz, xbz ) + Math.min( yaz, ybz ) + Math.min( zaz, zbz ) + m[ 14 ];
        this.max.x = Math.max( xax, xbx ) + Math.max( yax, ybx ) + Math.max( zax, zbx ) + m[ 12 ];
        this.max.y = Math.max( xay, xby ) + Math.max( yay, yby ) + Math.max( zay, zby ) + m[ 13 ];
        this.max.z = Math.max( xaz, xbz ) + Math.max( yaz, ybz ) + Math.max( zaz, zbz ) + m[ 14 ];

        return this;
    }

    translate(offset) {
        this.min.add( offset );
        this.max.add( offset );

        return this;
    }

    equals(box) {
        return box.min.equals( this.min ) && box.max.equals( this.max );
    }

    setFromBufferAttribute(attribute) {
        let minX = +Infinity;
        let minY = +Infinity;
        let minZ = +Infinity;

        let maxX = -Infinity;
        let maxY = -Infinity;
        let maxZ = -Infinity;

        for ( let i = 0, l = attribute.count; i < l; i ++ ) {
            let x = attribute.array[i * 3 + 0];
            let y = attribute.array[i * 3 + 1];
            let z = attribute.array[i * 3 + 2];

            if ( x < minX ) minX = x;
            if ( y < minY ) minY = y;
            if ( z < minZ ) minZ = z;

            if ( x > maxX ) maxX = x;
            if ( y > maxY ) maxY = y;
            if ( z > maxZ ) maxZ = z;
        }

        this.min.set( minX, minY, minZ );
        this.max.set( maxX, maxY, maxZ );

        return this;
    }
}
