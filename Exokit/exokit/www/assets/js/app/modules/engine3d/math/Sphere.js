class Sphere {
    constructor(center = new Vector3(), radius = 0) {
        this.center = center;
        this.radius = radius;
    }

    set(center, radius) {
		this.center.copy( center );
		this.radius = radius;
		return this;
	}

    setFromPoints(points, optionalCenter) {
        let box = this.V1 || new Box3();
        this.V1 = box;

        let center = this.center;
        if (optionalCenter !== undefined) {
            center.copy(optionalCenter);
        } else {
            box.setFromPoints(points).getCenter(center);
        }

        let maxRadiusSq = 0;
        for (let i = 0, il = points.length; i < il; i++) {
            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
        }
        this.radius = Math.sqrt(maxRadiusSq);

        return this;
	}

	clone() {
		return new this.constructor().copy(this);
	}

	copy(sphere) {
		this.center.copy(sphere.center);
		this.radius = sphere.radius;
		return this;
	}

	empty() {
		return (this.radius <= 0);
	}

	containsPoint(point) {
		return (point.distanceToSquared(this.center) <= (this.radius * this.radius));
	}

	distanceToPoint(point) {
       return (point.distanceTo(this.center) - this.radius);
	}

	intersectsSphere(sphere) {
		let radiusSum = this.radius + sphere.radius;
		return sphere.center.distanceToSquared(this.center) <= (radiusSum * radiusSum);
	}

	intersectsBox(box) {
		return box.intersectsSphere(this);
	}

	intersectsPlane(plane) {
		return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
	}

	clampPoint(point, target = new Vector3()) {
		let deltaLengthSq = this.center.distanceToSquared( point );
		target.copy(point);
		if (deltaLengthSq > (this.radius * this.radius)) {
			target.sub( this.center ).normalize();
			target.multiplyScalar( this.radius ).add( this.center );
		}
		return target;
	}

	getBoundingBox(target = new Box3()) {
		target.set(this.center, this.center);
		target.expandByScalar(this.radius);
		return target;
	}

	applyMatrix4(matrix) {
		this.center.applyMatrix4(matrix);
		this.radius = this.radius * matrix.getMaxScaleOnAxis();
		return this;
	}

	translate(offset) {
		this.center.add(offset);
		return this;
	}

	equals(sphere) {
		return sphere.center.equals(this.center) && (sphere.radius === this.radius);
	}
}