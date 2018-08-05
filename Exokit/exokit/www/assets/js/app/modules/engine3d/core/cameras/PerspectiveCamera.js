/**
 * @name PerspectiveCamera
 * @example
 * new PerspectiveCamera(40, Stage.width / Stage.height, 0.1, 200);
 */

class PerspectiveCamera extends CameraBase3D {
    constructor(fov, aspect, near, far) {
        super();
        this.type = 'PerspectiveCamera';

        this.fov = fov || 50;
        this.zoom = 1;

        this.near = near || 0.1;
        this.far = far || 2000;
        this.focus = 10;

        this.aspect = aspect || 1;
        this.filmGauge = 35;
        this.filmOffset = 0;

        this.updateProjectionMatrix();
    }

    clone() {
        return new PerspectiveCamera().copy(this);
    }

    copy(source, recursive) {
        CameraBase3D.prototype.copy.call( this, source, recursive );

        this.fov = source.fov;
        this.zoom = source.zoom;

        this.near = source.near;
        this.far = source.far;
        this.focus = source.focus;

        this.aspect = source.aspect;

        this.filmGauge = source.filmGauge;
        this.filmOffset = source.filmOffset;

        return this;
    }

    /**
     * @name setFocalLength
     * @memberof PerspectiveCamera
     *
     * @function
     * @param {Number} focalLength
     */
    setFocalLength(focalLength) {
        let vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;

        this.fov = Math.degrees(2 * Math.atan( vExtentSlope ));
        this.updateProjectionMatrix();
    }

    /**
     * @name getFocalLength
     * @memberof PerspectiveCamera
     *
     * @function
     * @returns {Number}
     */
    getFocalLength() {
        let vExtentSlope = Math.tan( Math.radians(0.5 * this.fov) );
        return 0.5 * this.getFilmHeight() / vExtentSlope;
    }

    /**
     * @name getEffectiveFOV
     * @memberof PerspectiveCamera
     *
     * @function
     * @returns {Number}
     */
    getEffectiveFOV() {
        return Math.degrees(2 * Math.atan( Math.tan( Math.radians(0.5 * this.fov) ) / this.zoom ));
    }

    /**
     * @name getFilmWidth
     * @memberof PerspectiveCamera
     *
     * @function
     * @returns {Number}
     */
    getFilmWidth() {
        return this.filmGauge * Math.min( this.aspect, 1 );
    }

    /**
     * @name getFilmHeight
     * @memberof PerspectiveCamera
     *
     * @function
     * @returns {Number}
     */
    getFilmHeight() {
        return this.filmGauge / Math.max( this.aspect, 1 );
    }

    /**
     * @name updateProjectionMatrix()
     * @memberof PerspectiveCamera
     *
     * @function
     */
    updateProjectionMatrix() {
        let near = this.near,
            top = near * Math.tan(Math.radians(0.5 * this.fov) ) / this.zoom,
            height = 2 * top,
            width = this.aspect * height,
            left = - 0.5 * width,
            view = this.view;

        let skew = this.filmOffset;
        if ( skew !== 0 ) left += near * skew / this.getFilmWidth();

        this.projectionMatrix.makePerspective( left, left + width, top, top - height, near, this.far );
    }
}