class RayManager {
    constructor(origin, direction, near = 0, far = Infinity) {
        this.ray = new Ray(origin, direction);
        this.near = near;
        this.far = far;

        this.params = {
            Mesh: {},
            Points: {threshold: 1}
        };
    }

    set(origin, direction) {
        this.ray.set(origin, direction);
        return this;
    }

    setFromCamera(coords, camera) {
        if (camera.isPerspective) {
            this.ray.origin.setFromMatrixPosition( camera.matrixWorld );
            this.ray.direction.set( coords.x, coords.y, 0.5 ).unproject( camera ).sub( this.ray.origin ).normalize();
        } else {
            this.ray.origin.set( coords.x, coords.y, ( camera.near + camera.far ) / ( camera.near - camera.far ) ).unproject( camera ); // set origin in plane of camera
            this.ray.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );
        }
    }

    _ascSort(a, b) {
        return a.distance - b.distance;
    }

    _intersectObject(object, raycaster, intersects, recursive) {
        if (object.visible === false) return;
        object.raycast(raycaster, intersects);
        if (recursive === true) {
            let children = object.children;
            for ( let i = 0, l = children.length; i < l; i ++ ) {
                this._intersectObject(children[ i ], raycaster, intersects, true);
            }
        }
    }

    intersectObject(object, recursive, optionalTarget) {
        let intersects = optionalTarget || [];
        this._intersectObject( object, this, intersects, recursive );
        intersects.sort(this._ascSort);
        return intersects;
    }

    intersectObjects(objects, recursive, optionalTarget) {
        let intersects = optionalTarget || [];
        for ( let i = 0, l = objects.length; i < l; i ++ ) {
            this._intersectObject( objects[ i ], this, intersects, recursive );
        }

        intersects.sort(this._ascSort);
        return intersects;
    }
}

class Ray {
    constructor(origin = new Vector3(), direction = new Vector3()) {
        this.origin = origin;
        this.direction = direction;
    }

    set(origin, direction) {
        this.origin.copy(origin);
        this.direction.copy(direction);
        return this;
    }

    clone() {
        return new Ray().copy(this);
    }

    copy(ray) {
        this.origin.copy(ray.origin);
        this.direction.copy(ray.direction);
        return this;
    }

    at(t, target = new Vector3()) {
        return target.copy(this.direction).multiplyScalar(t).add(this.origin);
    }

    lookAt(v) {
        this.direction.copy(v).sub(this.origin).normalize();
        return this;
    }

    recast(t) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        this.origin.copy( this.at( t, v1 ) );
    }

    closestPointToPoint(point, target = new Vector3()) {
        target.subVectors(point, this.origin);

        let directionDistance = target.dot(this.direction);
        if (directionDistance < 0) return target.copy(this.origin);

        return target.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
    }

    distanceToPoint(point) {
        return Math.sqrt(this.distanceSqToPoint(point));
    }

    distanceSqToPoint(point) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        let directionDistance = v1.subVectors( point, this.origin ).dot( this.direction );
        if ( directionDistance < 0 ) return this.origin.distanceToSquared( point );

        v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );
        return v1.distanceToSquared( point );
    }

    distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
        let segCenter = this.V1 || new Vector3();
        let segDir = this.V2 || new Vector3();
        let diff = this.V3 || new Vector3();
        this.V1 = segCenter;
        this.V2 = segDir;
        this.V3 = diff;

        segCenter.copy( v0 ).add( v1 ).multiplyScalar( 0.5 );
        segDir.copy( v1 ).sub( v0 ).normalize();
        diff.copy( this.origin ).sub( segCenter );

        let segExtent = v0.distanceTo( v1 ) * 0.5;
        let a01 = - this.direction.dot( segDir );
        let b0 = diff.dot( this.direction );
        let b1 = - diff.dot( segDir );
        let c = diff.lengthSq();
        let det = Math.abs( 1 - a01 * a01 );
        let s0, s1, sqrDist, extDet;

        if ( det > 0 ) {

            // The ray and segment are not parallel.

            s0 = a01 * b1 - b0;
            s1 = a01 * b0 - b1;
            extDet = segExtent * det;

            if ( s0 >= 0 ) {

                if ( s1 >= - extDet ) {

                    if ( s1 <= extDet ) {

                        // region 0
                        // Minimum at interior points of ray and segment.

                        let invDet = 1 / det;
                        s0 *= invDet;
                        s1 *= invDet;
                        sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

                    } else {

                        // region 1

                        s1 = segExtent;
                        s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
                        sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

                    }

                } else {

                    // region 5

                    s1 = - segExtent;
                    s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
                    sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

                }

            } else {

                if ( s1 <= - extDet ) {

                    // region 4

                    s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
                    s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
                    sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

                } else if ( s1 <= extDet ) {

                    // region 3

                    s0 = 0;
                    s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
                    sqrDist = s1 * ( s1 + 2 * b1 ) + c;

                } else {

                    // region 2

                    s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
                    s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
                    sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

                }

            }

        } else {

            // Ray and segment are parallel.

            s1 = ( a01 > 0 ) ? - segExtent : segExtent;
            s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
            sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

        }

        if ( optionalPointOnRay ) {

            optionalPointOnRay.copy( this.direction ).multiplyScalar( s0 ).add( this.origin );

        }

        if ( optionalPointOnSegment ) {

            optionalPointOnSegment.copy( segDir ).multiplyScalar( s1 ).add( segCenter );

        }

        return sqrDist;
    }

    intersectSphere(sphere, target) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        v1.subVectors( sphere.center, this.origin );
        let tca = v1.dot( this.direction );
        let d2 = v1.dot( v1 ) - tca * tca;
        let radius2 = sphere.radius * sphere.radius;

        if ( d2 > radius2 ) return null;

        let thc = Math.sqrt( radius2 - d2 );

        // t0 = first intersect point - entrance on front of sphere
        let t0 = tca - thc;

        // t1 = second intersect point - exit point on back of sphere
        let t1 = tca + thc;

        // test to see if both t0 and t1 are behind the ray - if so, return null
        if ( t0 < 0 && t1 < 0 ) return null;

        // test to see if t0 is behind the ray:
        // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
        // in order to always return an intersect point that is in front of the ray.
        if ( t0 < 0 ) return this.at( t1, target );

        // else t0 is in front of the ray, so return the first collision point scaled by t0
        return this.at( t0, target );
    }

    intersectsSphere(sphere) {
        return this.distanceToPoint( sphere.center ) <= sphere.radius;
    }

    distanceToPlane(plane) {
        let denominator = plane.normal.dot( this.direction );

        if ( denominator === 0 ) {
            if ( plane.distanceToPoint( this.origin ) === 0 ) {
                return 0;
            }

            return null;
        }

        let t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;
        return t >= 0 ? t : null;
    }

    intersectPlane(plane, target) {
        let t = this.distanceToPlane( plane );
        if (t === null) {
            return null;
        }
        return this.at( t, target );
    }

    intersectsPlane(plane) {
        let distToPoint = plane.distanceToPoint( this.origin );
        if ( distToPoint === 0 ) return true;
        let denominator = plane.normal.dot( this.direction );
        if ( denominator * distToPoint < 0 ) return true;
        return false;
    }

    intersectBox(box, target) {
        let tmin, tmax, tymin, tymax, tzmin, tzmax;

        let invdirx = 1 / this.direction.x,
            invdiry = 1 / this.direction.y,
            invdirz = 1 / this.direction.z;

        let origin = this.origin;

        if ( invdirx >= 0 ) {

            tmin = ( box.min.x - origin.x ) * invdirx;
            tmax = ( box.max.x - origin.x ) * invdirx;

        } else {

            tmin = ( box.max.x - origin.x ) * invdirx;
            tmax = ( box.min.x - origin.x ) * invdirx;

        }

        if ( invdiry >= 0 ) {

            tymin = ( box.min.y - origin.y ) * invdiry;
            tymax = ( box.max.y - origin.y ) * invdiry;

        } else {

            tymin = ( box.max.y - origin.y ) * invdiry;
            tymax = ( box.min.y - origin.y ) * invdiry;

        }

        if ( ( tmin > tymax ) || ( tymin > tmax ) ) return null;

        // These lines also handle the case where tmin or tmax is NaN
        // (result of 0 * Infinity). x !== x returns true if x is NaN

        if ( tymin > tmin || tmin !== tmin ) tmin = tymin;

        if ( tymax < tmax || tmax !== tmax ) tmax = tymax;

        if ( invdirz >= 0 ) {

            tzmin = ( box.min.z - origin.z ) * invdirz;
            tzmax = ( box.max.z - origin.z ) * invdirz;

        } else {

            tzmin = ( box.max.z - origin.z ) * invdirz;
            tzmax = ( box.min.z - origin.z ) * invdirz;

        }

        if ( ( tmin > tzmax ) || ( tzmin > tmax ) ) return null;

        if ( tzmin > tmin || tmin !== tmin ) tmin = tzmin;

        if ( tzmax < tmax || tmax !== tmax ) tmax = tzmax;

        //return point closest to the ray (positive side)

        if ( tmax < 0 ) return null;

        return this.at( tmin >= 0 ? tmin : tmax, target );
    }

    intersectsBox(box) {
        let v = this.V1 || new Vector3();
        this.V1 = v;
        return this.intersectBox( box, v ) !== null;
    }

    intersectsTriangle(a, b, c, backfaceCulling, target) {
        let diff = this.V1 || new Vector3();
        let edge1 = this.V2 || new Vector3();
        let edge2 = this.V3 || new Vector3();
        let normal = this.V4 || new Vector3();
        this.V1 = diff;
        this.V2 = edge1;
        this.V3 = edge2;
        this.V4 = normal;

        edge1.subVectors( b, a );
        edge2.subVectors( c, a );
        normal.crossVectors( edge1, edge2 );

        // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
        // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
        //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
        //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
        //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
        let DdN = this.direction.dot( normal );
        let sign;

        if ( DdN > 0 ) {

            if ( backfaceCulling ) return null;
            sign = 1;

        } else if ( DdN < 0 ) {

            sign = - 1;
            DdN = - DdN;

        } else {

            return null;

        }

        diff.subVectors( this.origin, a );
        let DdQxE2 = sign * this.direction.dot( edge2.crossVectors( diff, edge2 ) );

        // b1 < 0, no intersection
        if ( DdQxE2 < 0 ) {

            return null;

        }

        let DdE1xQ = sign * this.direction.dot( edge1.cross( diff ) );

        // b2 < 0, no intersection
        if ( DdE1xQ < 0 ) {

            return null;

        }

        // b1+b2 > 1, no intersection
        if ( DdQxE2 + DdE1xQ > DdN ) {

            return null;

        }

        // Line intersects triangle, check if ray does.
        let QdN = - sign * diff.dot( normal );

        // t < 0, no intersection
        if ( QdN < 0 ) {

            return null;

        }

        // Ray intersects triangle.
        return this.at( QdN / DdN, target );
    }

    applyMatrix4(matrix4) {
        this.origin.applyMatrix4( matrix4 );
        this.direction.transformDirection( matrix4 );
        return this;
    }

    equals(ray) {
        return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );
    }

}
