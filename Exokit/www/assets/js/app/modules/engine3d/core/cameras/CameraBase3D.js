class CameraBase3D extends Base3D {
    constructor() {
        super();

        this.matrixWorldInverse = new Matrix4();
        this.projectionMatrix = new Matrix4();
    }

    copy(source, recursive) {
        Base3D.prototype.copy.call(this, source, recursive);
        this.matrixWorldInverse.copy( source.matrixWorldInverse );
        this.projectionMatrix.copy( source.projectionMatrix );

        return this;
    }

    updateMatrixWorld(force) {
        Base3D.prototype.updateMatrixWorld.call( this, force );
        this.matrixWorldInverse.getInverse(this.matrixWorld);
    }

    clone() {
        return new this.constructor().copy(this);
    }
}