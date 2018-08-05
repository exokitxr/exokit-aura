class Box2 {
    constructor(min, max) {
        this.min = ( min !== undefined ) ? min : new Vector2( + Infinity, + Infinity );
        this.max = ( max !== undefined ) ? max : new Vector2( - Infinity, - Infinity );
    }

    set(min, max) {
        this.min.copy( min );
        this.max.copy( max );

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
        let v1 = this.V1 || new Vector2();
        this.V1 = v1;

        let halfSize = v1.copy( size ).multiplyScalar( 0.5 );
        this.min.copy( center ).sub( halfSize );
        this.max.copy( center ).add( halfSize );

        return this;
    }

    clone() {
        return new Box2().copy(this);
    }

    copy(box) {
        this.min.copy( box.min );
        this.max.copy( box.max );

        return this;
    }

    makeEmpty() {
        this.min.x = this.min.y = + Infinity;
        this.max.x = this.max.y = - Infinity;

        return this;
    }

    isEmpty() {
        return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y );
    }

    getCenter(target) {
        return this.isEmpty() ? target.set( 0, 0 ) : target.addVectors( this.min, this.max ).multiplyScalar( 0.5 );
    }

    getSize(target) {
        return this.isEmpty() ? target.set( 0, 0 ) : target.subVectors( this.max, this.min );
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

    containsPoint(point) {
        return point.x < this.min.x || point.x > this.max.x || point.y < this.min.y || point.y > this.max.y ? false : true;
    }

    containsBox(box) {
        return this.min.x <= box.min.x && box.max.x <= this.max.x &&
            this.min.y <= box.min.y && box.max.y <= this.max.y;
    }

    getParameter(point, target) {
        return target.set(
            ( point.x - this.min.x ) / ( this.max.x - this.min.x ),
            ( point.y - this.min.y ) / ( this.max.y - this.min.y )
        );
    }

    intersectsBox(box) {
        return box.max.x < this.min.x || box.min.x > this.max.x ||
        box.max.y < this.min.y || box.min.y > this.max.y ? false : true;
    }

    clampPoint(point, target) {
        return target.copy( point ).clamp( this.min, this.max );
    }

    distanceToPoint(point) {
        let v1 = this.V1 || new Vector2();
        this.V1 = v1;

        let clampedPoint = v1.copy( point ).clamp( this.min, this.max );
        return clampedPoint.sub( point ).length();
    }

    intersect(box) {
        this.min.max( box.min );
        this.max.min( box.max );

        return this;
    }

    union(box) {
        this.min.min( box.min );
        this.max.max( box.max );

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
}