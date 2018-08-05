class Cylindrical {
    constructor(radius = 1.0, theta = 0, y = 0) {
        this.radius = radius;
        this.theta = theta;
        this.y = y;
    }

    set(radius, theta, y) {
		this.radius = radius;
		this.theta = theta;
		this.y = y;
		return this;
	}

	clone() {
		return new this.constructor().copy(this);
	}

	copy(other) {
		this.radius = other.radius;
		this.theta = other.theta;
		this.y = other.y;
		return this;
	}

	setFromVector3(vec3) {
		this.radius = Math.sqrt(vec3.x * vec3.x + vec3.z * vec3.z);
		this.theta = Math.atan2(vec3.x, vec3.z);
		this.y = vec3.y;
		return this;
	}
}