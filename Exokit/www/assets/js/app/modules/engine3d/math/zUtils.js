class Face3 {
    constructor(a, b, c, normal = new Vector3()) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
    }
}

Class(function zUtils3D() {
    Math.euclideanModulo = function(n, m) {
        return ( ( n % m ) + m ) % m;
    }

    Math.isPowerOf2 = function(w, h) {
        let test = value => (value & (value - 1)) == 0;
        return test(w) && test(h);
    }

    Math.floorPowerOf2 = function(value) {
        return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
    }

    Geometry.TYPES = {'SphereGeometry': SphereGeometry, 'IcosahedronGeometry': IcosahedronGeometry, 'BoxGeometry': BoxGeometry, 'PlaneGeometry': PlaneGeometry, 'CylinderGeometry': CylinderGeometry};

    Vector3.prototype.isVector3 = true;
    Vector2.prototype.isVector2 = true;
    CameraBase3D.prototype.isCamera = true;
    PerspectiveCamera.prototype.isPerspective = true;

    Ray.prototype.intersectTriangle = (function() {
        // Compute the offset origin, edges, and normal.
        var diff = new Vector3();
        var edge1 = new Vector3();
        var edge2 = new Vector3();
        var normal = new Vector3();

        return function intersectTriangle( a, b, c, backfaceCulling, target ) {

            // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

            edge1.subVectors( b, a );
            edge2.subVectors( c, a );
            normal.crossVectors( edge1, edge2 );

            // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
            // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
            //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
            //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
            //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
            var DdN = this.direction.dot( normal );
            var sign;

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
            var DdQxE2 = sign * this.direction.dot( edge2.crossVectors( diff, edge2 ) );

            // b1 < 0, no intersection
            if ( DdQxE2 < 0 ) {

                return null;

            }

            var DdE1xQ = sign * this.direction.dot( edge1.cross( diff ) );

            // b2 < 0, no intersection
            if ( DdE1xQ < 0 ) {

                return null;

            }

            // b1+b2 > 1, no intersection
            if ( DdQxE2 + DdE1xQ > DdN ) {

                return null;

            }

            // Line intersects triangle, check if ray does.
            var QdN = - sign * diff.dot( normal );

            // t < 0, no intersection
            if ( QdN < 0 ) {

                return null;

            }

            // Ray intersects triangle.
            return this.at( QdN / DdN, target );

        };

    })();

    Mesh.prototype.raycast = (function() {
        let inverseMatrix = new Matrix4();
        let ray = new Ray();
        let sphere = new Sphere();

        let vA = new Vector3();
        let vB = new Vector3();
        let vC = new Vector3();

        let tempA = new Vector3();
        let tempB = new Vector3();
        let tempC = new Vector3();
        let tempD = new Vector3();

        let uvA = new Vector2();
        let uvB = new Vector2();
        let uvC = new Vector2();

        let barycoord = new Vector3();

        let intersectionPoint = new Vector3();
        let intersectionPointWorld = new Vector3();

        function uvIntersection( point, p1, p2, p3, uv1, uv2, uv3 ) {

            Triangle.getBarycoord( point, p1, p2, p3, barycoord );

            uv1.multiplyScalar( barycoord.x );
            uv2.multiplyScalar( barycoord.y );
            uv3.multiplyScalar( barycoord.z );

            uv1.add( uv2 ).add( uv3 );

            return uv1.clone();

        }

        function checkIntersection( object, shader, raycaster, ray, pA, pB, pC, point ) {

            let intersect;

            if ( shader.side === Shader.BACK_SIDE ) {

                intersect = ray.intersectTriangle( pC, pB, pA, true, point );

            } else {

                intersect = ray.intersectTriangle( pA, pB, pC, shader.side !== Shader.DOUBLE_SIDE, point );

            }

            if ( intersect === null ) return null;

            intersectionPointWorld.copy( point );
            intersectionPointWorld.applyMatrix4( object.matrixWorld );

            let distance = raycaster.ray.origin.distanceTo( intersectionPointWorld );

            if ( distance < raycaster.near || distance > raycaster.far ) return null;

            return {
                distance: distance,
                point: intersectionPointWorld.clone(),
                object: object
            };

        }

        function checkBufferGeometryIntersection( object, raycaster, ray, position, uv, a, b, c ) {

            vA.fromBufferAttribute( position, a );
            vB.fromBufferAttribute( position, b );
            vC.fromBufferAttribute( position, c );

            let intersection = checkIntersection( object, object.shader, raycaster, ray, vA, vB, vC, intersectionPoint );

            if ( intersection ) {

                if ( uv ) {

                    uvA.fromBufferAttribute( uv, a );
                    uvB.fromBufferAttribute( uv, b );
                    uvC.fromBufferAttribute( uv, c );

                    intersection.uv = uvIntersection( intersectionPoint, vA, vB, vC, uvA, uvB, uvC );

                }

                let face = new Face3( a, b, c );
                Triangle.getNormal( vA, vB, vC, tempD );

                intersection.face = face;

            }

            return intersection;

        }

        return function raycast( raycaster, intersects ) {

            let geometry = this.geometry;
            let shader = this.shader;
            let matrixWorld = this.matrixWorld;

            if ( shader === undefined ) return;

            // Checking boundingSphere distance to ray

            if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();

            sphere.copy( geometry.boundingSphere );
            sphere.applyMatrix4( matrixWorld );

            if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

            //

            inverseMatrix.getInverse( matrixWorld );
            ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

            // Check boundingBox before continuing

            if ( geometry.boundingBox !== null ) {

                if ( ray.intersectsBox( geometry.boundingBox ) === false ) return;

            }

            let intersection;


            let a, b, c;
            let index = geometry.index;
            let position = geometry.attributes.position;
            let uv = geometry.attributes.uv;
            let i, l;

            if ( index !== null ) {

                // indexed buffer geometry

                for ( i = 0, l = index.length; i < l; i += 3 ) {

                    a = index[i];
                    b = index[i+1];
                    c = index[i+2];

                    intersection = checkBufferGeometryIntersection( this, raycaster, ray, position, uv, a, b, c );

                    if ( intersection ) {

                        intersection.faceIndex = Math.floor( i / 3 ); // triangle number in indexed buffer semantics
                        intersects.push( intersection );

                    }

                }

            } else if ( position !== undefined ) {

                // non-indexed buffer geometry

                for ( i = 0, l = position.count; i < l; i += 3 ) {

                    a = i;
                    b = i + 1;
                    c = i + 2;

                    intersection = checkBufferGeometryIntersection( this, raycaster, ray, position, uv, a, b, c );

                    if ( intersection ) {

                        intersection.faceIndex = Math.floor( i / 3 ); // triangle number in non-indexed buffer semantics
                        intersects.push( intersection );

                    }

                }

            }

        };

    })();

    Triangle.prototype.closestPointToPoint = (function() {
        let plane = new Plane();
        let edgeList = [ new Line3(), new Line3(), new Line3() ];
        let projectedPoint = new Vector3();
        let closestPoint = new Vector3();

        return function closestPointToPoint( point, target = new Vector3() ) {

            let minDistance = Infinity;

            // project the point onto the plane of the triangle

            plane.setFromCoplanarPoints( this.a, this.b, this.c );
            plane.projectPoint( point, projectedPoint );

            // check if the projection lies within the triangle

            if ( this.containsPoint( projectedPoint ) === true ) {

                // if so, this is the closest point

                target.copy( projectedPoint );

            } else {

                // if not, the point falls outside the triangle. the target is the closest point to the triangle's edges or vertices

                edgeList[ 0 ].set( this.a, this.b );
                edgeList[ 1 ].set( this.b, this.c );
                edgeList[ 2 ].set( this.c, this.a );

                for ( let i = 0; i < edgeList.length; i ++ ) {

                    edgeList[ i ].closestPointToPoint( projectedPoint, true, closestPoint );

                    let distance = projectedPoint.distanceToSquared( closestPoint );

                    if ( distance < minDistance ) {

                        minDistance = distance;

                        target.copy( closestPoint );

                    }

                }

            }

            return target;

        };
    })();
    
    Points.prototype.raycast = (function() {

        let inverseMatrix = new Matrix4();
        let ray = new Ray();
        let sphere = new Sphere();

        return function raycast(raycaster, intersects) {
            let object = this;
            let geometry = this.geometry;
            let matrixWorld = this.matrixWorld;
            let threshold = raycaster.params.Points.threshold;

            // Checking boundingSphere distance to ray

            if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

            sphere.copy( geometry.boundingSphere );
            sphere.applyMatrix4( matrixWorld );
            sphere.radius += threshold;

            if ( raycaster.ray.intersectsSphere( sphere ) === false ) return;

            //

            inverseMatrix.getInverse( matrixWorld );
            ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );

            let localThreshold = threshold / ( ( this.scale.x + this.scale.y + this.scale.z ) / 3 );
            let localThresholdSq = localThreshold * localThreshold;
            let position = new Vector3();
            let intersectPoint = new Vector3();

            function testPoint( point, index ) {

                let rayPointDistanceSq = ray.distanceSqToPoint( point );

                if ( rayPointDistanceSq < localThresholdSq ) {

                    ray.closestPointToPoint( point, intersectPoint );
                    intersectPoint.applyMatrix4( matrixWorld );

                    let distance = raycaster.ray.origin.distanceTo( intersectPoint );

                    if ( distance < raycaster.near || distance > raycaster.far ) return;

                    intersects.push( {

                        distance: distance,
                        distanceToRay: Math.sqrt( rayPointDistanceSq ),
                        point: intersectPoint.clone(),
                        index: index,
                        face: null,
                        object: object

                    } );

                }

            }
            
            let index = geometry.index;
            let attributes = geometry.attributes;
            let positions = attributes.position.array;

            if ( index !== null ) {

                let indices = index.array;

                for ( let i = 0, il = indices.length; i < il; i ++ ) {

                    let a = indices[ i ];

                    position.fromArray( positions, a * 3 );

                    testPoint( position, a );

                }

            } else {

                for ( let i = 0, l = positions.length / 3; i < l; i ++ ) {

                    position.fromArray( positions, i * 3 );

                    testPoint( position, i );

                }

            }
        };
    })();

    Object.assign(Triangle, {
        getNormal: function() {
            var v0 = new Vector3();

            return function getNormal( a, b, c, target = new Vector3() ) {
                target.subVectors( c, b );
                v0.subVectors( a, b );
                target.cross( v0 );

                var targetLengthSq = target.lengthSq();
                if ( targetLengthSq > 0 ) return target.multiplyScalar( 1 / Math.sqrt( targetLengthSq ) );

                return target.set( 0, 0, 0 );
            };

        }(),

        getBarycoord: function () {
            var v0 = new Vector3();
            var v1 = new Vector3();
            var v2 = new Vector3();

            return function getBarycoord(point, a, b, c, target = new Vector3()) {
                v0.subVectors( c, a );
                v1.subVectors( b, a );
                v2.subVectors( point, a );

                var dot00 = v0.dot( v0 );
                var dot01 = v0.dot( v1 );
                var dot02 = v0.dot( v2 );
                var dot11 = v1.dot( v1 );
                var dot12 = v1.dot( v2 );
                var denom = ( dot00 * dot11 - dot01 * dot01 );


                if (denom === 0) return target.set( - 2, - 1, - 1 );

                var invDenom = 1 / denom;
                var u = ( dot11 * dot02 - dot01 * dot12 ) * invDenom;
                var v = ( dot00 * dot12 - dot01 * dot02 ) * invDenom;

                return target.set( 1 - u - v, v, u );
            };

        }(),

        containsPoint: function () {
            var v1 = new Vector3();
            return function containsPoint( point, a, b, c ) {
                Triangle.getBarycoord( point, a, b, c, v1 );
                return ( v1.x >= 0 ) && ( v1.y >= 0 ) && ( ( v1.x + v1.y ) <= 1 );
            };
        }()
    });
}, 'static');