/**
 * @name ScreenProjection
 * @param {CameraBase3D} camera
 */
Class(function ScreenProjection(_camera) {
    Inherit(this, Component);
    var _this = this;

    var _v3 = new Vector3();
    var _v32 = new Vector3();
    var _value = new Vector3();

    //*** Constructor
    (function () {

    })();

    //*** Event handlers

    //*** Public methods

    /**
     * @name camera
     * @memberof ScreenProjection
     * @property
     */
    this.set('camera', function(v) {
        _camera = v;
    });

    /**
     * @name unproject
     * @memberof ScreenProjection
     *
     * @function
     * @param {Vector2} point
     * @param {Number} distance
     */
    this.unproject = function(mouse, distance) {
        let rect = _this.rect || Stage;
        _v3.set((mouse.x / rect.width) * 2 - 1, -(mouse.y / rect.height) * 2 + 1, 0.5);
        _v3.unproject(_camera);

        let pos = _camera.position;
        _v3.sub(pos).normalize();
        let dist = distance || -pos.z / _v3.z;
        _value.copy(pos).add(_v3.multiplyScalar(dist));

        return _value;
    }

    /**
     * @name project
     * @memberof ScreenProjection
     *
     * @function
     * @param {Vector3} point
     * @param {Vector2} resolution
     */
    this.project = function(pos, screen) {
        screen = screen || Stage;

        if (pos instanceof Base3D) {
            pos.updateMatrixWorld();
            _v32.set(0, 0, 0).setFromMatrixPosition(pos.matrixWorld);
        } else {
            _v32.copy(pos);
        }

        _v32.project(_camera);
        _v32.x = (_v32.x + 1) / 2 * screen.width;
        _v32.y = -(_v32.y - 1) / 2 * screen.height;

        return _v32;
    }
}, _ => {
    var _screen;
    ScreenProjection.unproject = function(mouse, distance) {
        if (!_screen) _screen = new ScreenProjection(World.CAMERA);
        return _screen.unproject(mouse, distance);
    }

    ScreenProjection.project = function(pos, screen) {
        if (!_screen) _screen = new ScreenProjection(World.CAMERA);
        return _screen.project(pos, screen);
    }

    /**
     * @name ScreenProjection.unproject
     * @memberof ScreenProjection
     *
     * @function
     * @param {Vector2} point
     * @param {Number} distance
     */

    /**
     * @name ScreenProjection.project
     * @memberof ScreenProjection
     *
     * @function
     * @param {Vector3} point
     * @param {Vector2} resolution
     */
});