/**
 * @name OrthographicCamera
 */

class OrthographicCamera extends CameraBase3D {
    constructor(left, right, top, bottom, near, far) {
        super();

        this.isOrthographicCamera = true;

        this.zoom = 1;

        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;

        this.near = ( near !== undefined ) ? near : 0.1;
        this.far = ( far !== undefined ) ? far : 2000;

        this.position.z = 1;

        this.updateProjectionMatrix();
    }

    clone() {
        return new OrthographicCamera().copy(this);
    }

    copy(source, recursive) {
        CameraBase3D.prototype.copy.call( this, source, recursive );

        this.left = source.left;
        this.right = source.right;
        this.top = source.top;
        this.bottom = source.bottom;
        this.near = source.near;
        this.far = source.far;

        this.zoom = source.zoom;
        this.view = source.view === null ? null : Object.assign( {}, source.view );

        return this;
    }

    /**
     * @name updateProjectionMatrix()
     * @memberof OrthographicCamera
     *
     * @function
     */
    updateProjectionMatrix() {
        let dx = ( this.right - this.left ) / ( 2 * this.zoom );
        let dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
        let cx = ( this.right + this.left ) / 2;
        let cy = ( this.top + this.bottom ) / 2;

        let left = cx - dx;
        let right = cx + dx;
        let top = cy + dy;
        let bottom = cy - dy;

        this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );
    }

    /**
     * Automatically sets the frustum to the correct width and height
     * @name setViewport()
     * @memberof OrthographicCamera
     *
     * @function
     * @param {Number} width
     * @param {Number} height
     */
    setViewport(width, height) {
        this.left = width/-2;
        this.right = width/2;
        this.top = height/2;
        this.bottom = height/-2;
        this.updateProjectionMatrix();
    }
}