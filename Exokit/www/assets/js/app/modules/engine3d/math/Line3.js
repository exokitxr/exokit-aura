class Line3 {
    constructor(start = new Vector3(), end = new Vector3()) {
        this.start = start;
        this.end = end;
    }

    set(start, end) {
		this.start.copy(start);
		this.end.copy(end);
		return this;
	}

	clone() {
		return new this.constructor().copy(this);
	}

	copy(line) {
		this.start.copy(line.start);
		this.end.copy(line.end);
		return this;
	}

	getCenter(target = new Vector3()) {
		return target.addVectors(this.start, this.end).multiplyScalar(0.5);
	}

	delta(target = new Vector3()) {
		return target.subVectors(this.end, this.start);
	}

	distanceSq() {
		return this.start.distanceToSquared(this.end);
	}

	distance() {
		return this.start.distanceTo(this.end);
	}

	at(t, target = new Vector3()) {
		return this.delta(target).multiplyScalar(t).add(this.start);
	}

	closestPointToPointParameter(point, clampToLine) {
		let startP = this.V1 || new Vector3();
        let startEnd = this.V2 || new Vector3();
        this.V1 = startP;
        this.V2 = startEnd;

        startP.subVectors(point, this.start);
        startEnd.subVectors(this.end, this.start);

        let startEnd2 = startEnd.dot(startEnd);
        let startEnd_startP = startEnd.dot(startP);
        let t = startEnd_startP / startEnd2;

        if (clampToLine) {
            t = Math.clamp(t, 0, 1);
        }

        return t;
	}

	closestPointToPoint(point, clampToLine, target = new Vector3()) {
		let t = this.closestPointToPointParameter(point, clampToLine);
		return this.delta( target ).multiplyScalar( t ).add(this.start);
	}

	applyMatrix4(matrix) {
		this.start.applyMatrix4(matrix);
		this.end.applyMatrix4(matrix);
		return this;
	}

	equals(line) {
		return line.start.equals(this.start) && line.end.equals(this.end);
	}
}