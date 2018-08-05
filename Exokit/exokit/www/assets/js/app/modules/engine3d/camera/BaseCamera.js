/**
 * @name BaseCamera
 */
Class(function BaseCamera() {
    Inherit(this, Object3D);
    const _this = this;

    this.camera = new PerspectiveCamera(30, Stage.width / Stage.height, 0.1, 1000);
    this.group.add(this.camera);

    this.startRender(_ => {
        _this.group.updateMatrixWorld();
    });

    /**
     * @name camera
     * @memberof GeometryAttribute
     * @property
     */

    /**
     * @name group
     * @memberof GeometryAttribute
     * @property
     */

    //*** Public methods

    /**
     * @name playgroundLock()
     * @memberof BaseCamera
     *
     * @function
     */
    this.playgroundLock = function() {
        if (!Global.PLAYGROUND) return;

        let parent = Utils.getConstructorName(_this.parent);
        if (parent.includes(Global.PLAYGROUND.split('/')[0])) {
            if (RenderManager.type == RenderManager.NORMAL) Camera.instance().lock(_this.camera);
        }
    };

    /**
     * @name lock()
     * @memberof BaseCamera
     *
     * @function
     */
    this.lock = function() {
        if (RenderManager.type == RenderManager.NORMAL) Camera.instance().lock(_this.camera);
    };

    /**
     * @name transition()
     * @memberof BaseCamera
     *
     * @function
     * @param {Number} time
     * @param {String} ease
     * @param {Number} delay
     */
    this.transition = function(time, ease, delay) {
        return Camera.instance().transition(_this.camera, time, ease, delay);
    };

    /**
     * @name setFOV()
     * @memberof BaseCamera
     *
     * @function
     * @param {Number} fov
     */
    this.setFOV = function(fov) {
        this.camera.fov = fov;    
    };

});
