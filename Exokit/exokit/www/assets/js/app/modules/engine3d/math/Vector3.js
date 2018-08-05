/**
 * @name Vector3
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */

class Vector3 {
    constructor(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    /**
     * @name x
     * @memberof Vector3
     * @property
     */

    /**
     * @name y
     * @memberof Vector3
     * @property
     */

    /**
     * @name z
     * @memberof Vector3
     * @property
     */

    /**
     * @name set
     * @memberof Vector3
     *
     * @function
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     * @return {Vector3}
     */
    set(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;

        return this;
    }

    /**
     * @name setScalar
     * @memberof Vector3
     *
     * @function
     * @param {Number} s
     * @return {Vector3}
     */
    setScalar(scalar) {
        this.x = scalar;
        this.y = scalar;
        this.z = scalar;

        return this;
    }

    /**
     * @name clone
     * @memberof Vector3
     *
     * @function
     * @return {Vector3}
     */
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;
    }

    /**
     * @name add
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Vector3}
     */
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;
    }

    /**
     * @name addScalar
     * @memberof Vector3
     *
     * @function
     * @param {Number} s
     * @return {Vector3}
     */
    addScalar(s) {
        this.x += s;
        this.y += s;
        this.z += s;

        return this;
    }

    /**
     * @name addVectors
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;

        return this;
    }

    /**
     * @name addScaledVector
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @param {Number} s
     * @return {Vector3}
     */
    addScaledVector(v) {
        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;

        return this;
    }

    /**
     * @name sub
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Vector3}
     */
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;
    }

    /**
     * @name subScalar
     * @memberof Vector3
     *
     * @function
     * @param {Number} s
     * @return {Vector3}
     */
    subScalar(s) {
        this.x -= s;
        this.y -= s;
        this.z -= s;

        return this;
    }

    /**
     * @name subVectors
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;
    }

    /**
     * @name multiply
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Vector3}
     */
    multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;

        return this;
    }

    /**
     * @name multiplyScalar
     * @memberof Vector3
     *
     * @function
     * @param {Number} s
     * @return {Vector3}
     */
    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }

    /**
     * @name multiplyVectors
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    multiplyVectors(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;

        return this;
    }

    /**
     * @name applyEuler
     * @memberof Vector3
     *
     * @function
     * @param {Euler} euler
     * @return {Vector3}
     */
    applyEuler(euler) {
        let quaternion = this.Q1 || new Quaternion();
        this.Q1 = quaternion;

        return this.applyQuaternion( quaternion.setFromEuler( euler ) );
    }

    /**
     * @name applyAxisAngle
     * @memberof Vector3
     *
     * @function
     * @param {Number} axis
     * @param {Number} angle
     * @return {Vector3}
     */
    applyAxisAngle(axis, angle) {
        let quaternion = this.Q1 || new Quaternion();
        this.Q1 = quaternion;

        return this.applyQuaternion( quaternion.setFromAxisAngle( axis, angle ) );
    }

    /**
     * @name applyMatrix3
     * @memberof Vector3
     *
     * @function
     * @param {Matrix3} matrix
     * @return {Vector3}
     */
    applyMatrix3(m) {
        let x = this.x, y = this.y, z = this.z;
        let e = m.elements;

        this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
        this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
        this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

        return this;
    }

    /**
     * @name applyMatrix4
     * @memberof Vector3
     *
     * @function
     * @param {Matrix4} matrix
     * @return {Vector3}
     */
    applyMatrix4(m) {
        let x = this.x, y = this.y, z = this.z;
        let e = m.elements;

        let w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

        this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
        this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
        this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

        return this;
    }

    /**
     * @name applyQuaternion
     * @memberof Vector3
     *
     * @function
     * @param {Quaternion} q
     * @return {Vector3}
     */
    applyQuaternion(q) {
        let x = this.x, y = this.y, z = this.z;
        let qx = q.x, qy = q.y, qz = q.z, qw = q.w;

        // calculate quat * vector

        let ix = qw * x + qy * z - qz * y;
        let iy = qw * y + qz * x - qx * z;
        let iz = qw * z + qx * y - qy * x;
        let iw = - qx * x - qy * y - qz * z;

        // calculate result * inverse quat

        this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
        this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
        this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

        return this;
    }

    project(camera) {
        let matrix = this.M1 || new Matrix4();
        this.M1 = matrix;

        matrix.multiplyMatrices( camera.projectionMatrix, matrix.getInverse( camera.matrixWorld ) );
        return this.applyMatrix4( matrix );
    }

    unproject(camera) {
        let matrix = this.M1 || new Matrix4();
        this.M1 = matrix;

        matrix.multiplyMatrices( camera.matrixWorld, matrix.getInverse( camera.projectionMatrix ) );
        return this.applyMatrix4( matrix );
    }

    transformDirection(m) {
        let x = this.x, y = this.y, z = this.z;
        let e = m.elements;

        this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
        this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
        this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

        return this.normalize();
    }

    /**
     * @name divide
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Vector3}
     */
    divide(v) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;

        return this;
    }

    /**
     * @name divideScalar
     * @memberof Vector3
     *
     * @function
     * @param {Number} s
     * @return {Vector3}
     */
    divideScalar(scalar) {
        return this.multiplyScalar( 1 / scalar );
    }

    min(v) {
        this.x = Math.min( this.x, v.x );
        this.y = Math.min( this.y, v.y );
        this.z = Math.min( this.z, v.z );

        return this;
    }

    max(v) {
        this.x = Math.max( this.x, v.x );
        this.y = Math.max( this.y, v.y );
        this.z = Math.max( this.z, v.z );

        return this;
    }

    clamp(min, max) {
        this.x = Math.max( min.x, Math.min( max.x, this.x ) );
        this.y = Math.max( min.y, Math.min( max.y, this.y ) );
        this.z = Math.max( min.z, Math.min( max.z, this.z ) );

        return this;
    }

    clampScalar(minVal, maxVal) {
        let min = new Vector3();
        let max = new Vector3();

        min.set( minVal, minVal, minVal );
        max.set( maxVal, maxVal, maxVal );

        return this.clamp( min, max );
    }

    clampLength(min, max) {
        let length = this.length();
        return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );
    }

    floor() {
        this.x = Math.floor( this.x );
        this.y = Math.floor( this.y );
        this.z = Math.floor( this.z );

        return this;
    }

    ceil() {
        this.x = Math.ceil( this.x );
        this.y = Math.ceil( this.y );
        this.z = Math.ceil( this.z );

        return this;
    }

    round() {
        this.x = Math.round( this.x );
        this.y = Math.round( this.y );
        this.z = Math.round( this.z );

        return this;
    }

    roundToZero() {
        this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
        this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
        this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

        return this;
    }

    negate() {
        this.x = - this.x;
        this.y = - this.y;
        this.z = - this.z;

        return this;
    }

    /**
     * @name dot
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Number}
     */
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * @name lengthSq
     * @memberof Vector3
     *
     * @function
     * @return {Number}
     */
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    /**
     * @name length
     * @memberof Vector3
     *
     * @function
     * @return {Number}
     */
    length() {
        return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );
    }

    manhattanLength() {
        return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );
    }

    /**
     * @name normalize
     * @memberof Vector3
     *
     * @function
     * @return {Vector3}
     */
    normalize() {
        return this.divideScalar( this.length() || 1 );
    }

    setLength(length) {
        return this.normalize().multiplyScalar( length );
    }

    /**
     * @name length
     * @memberof Vector3
     *
     * @function
     * @return {Number}
     */
    lerp(v, alpha) {
        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;
        this.z += ( v.z - this.z ) * alpha;

        return this;
    }

    lerpVectors(v1, v2, alpha) {
        return this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );
    }

    /**
     * @name cross
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Vector3}
     */
    cross(v) {
        return this.crossVectors( this, v );
    }

    /**
     * @name crossVectors
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {Vector3}
     */
    crossVectors(a, b) {
        let ax = a.x, ay = a.y, az = a.z;
        let bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;
    }

    projectOnVector(vector) {
        let scalar = vector.dot( this ) / vector.lengthSq();
        return this.copy( vector ).multiplyScalar( scalar );
    }

    projectOnPlane(planeNormal) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        v1.copy( this ).projectOnVector( planeNormal );
        return this.sub( v1 );
    }

    reflect(normal) {
        let v1 = this.V1 || new Vector3();
        this.V1 = v1;

        return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );
    }

    /**
     * @name angleTo
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Number}
     */
    angleTo(v) {
        let theta = this.dot( v ) / ( Math.sqrt( this.lengthSq() * v.lengthSq() ) );
        return Math.acos( Math.clamp( theta, - 1, 1 ) );
    }

    /**
     * @name distanceTo
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Number}
     */
    distanceTo(v) {
        return Math.sqrt( this.distanceToSquared( v ) );
    }

    /**
     * @name distanceToSquared
     * @memberof Vector3
     *
     * @function
     * @param {Vector3} v
     * @return {Number}
     */
    distanceToSquared(v) {
        let dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }

    manhattanDistanceTo(v) {
        return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );
    }

    setFromSpherical(s) {
        let sinPhiRadius = Math.sin( s.phi ) * s.radius;

        this.x = sinPhiRadius * Math.sin( s.theta );
        this.y = Math.cos( s.phi ) * s.radius;
        this.z = sinPhiRadius * Math.cos( s.theta );

        return this;
    }

    setFromCylindrical(c) {
        this.x = c.radius * Math.sin( c.theta );
        this.y = c.y;
        this.z = c.radius * Math.cos( c.theta );

        return this;
    }

    /**
     * @name setFromMatrixPosition
     * @memberof Vector3
     *
     * @function
     * @param {Matrix4} m
     * @return {Vector3}
     */
    setFromMatrixPosition(m) {
        let e = m.elements;

        this.x = e[ 12 ];
        this.y = e[ 13 ];
        this.z = e[ 14 ];

        return this;
    }

    /**
     * @name setFromMatrixScale
     * @memberof Vector3
     *
     * @function
     * @param {Matrix4} m
     * @return {Vector3}
     */
    setFromMatrixScale(m) {
        let sx = this.setFromMatrixColumn( m, 0 ).length();
        let sy = this.setFromMatrixColumn( m, 1 ).length();
        let sz = this.setFromMatrixColumn( m, 2 ).length();

        this.x = sx;
        this.y = sy;
        this.z = sz;

        return this;
    }

    setFromMatrixColumn(m, index) {
        return this.fromArray( m.elements, index * 4 );
    }

    equals(v) {
        return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );
    }

    fromArray(array, offset) {
        if ( offset === undefined ) offset = 0;

        this.x = array[ offset ];
        this.y = array[ offset + 1 ];
        this.z = array[ offset + 2 ];

        return this;
    }

    toArray(array, offset) {
        if ( array === undefined ) array = [];
        if ( offset === undefined ) offset = 0;

        array[ offset ] = this.x;
        array[ offset + 1 ] = this.y;
        array[ offset + 2 ] = this.z;

        return array;
    }

    fromBufferAttribute(attribute, index) {
        this.x = attribute.array[index * 3 + 0];
        this.y = attribute.array[index * 3 + 1];
        this.z = attribute.array[index * 3 + 2];
    }
}