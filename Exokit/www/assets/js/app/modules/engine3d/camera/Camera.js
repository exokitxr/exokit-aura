Class(function Camera(_worldCamera) {
    Inherit(this, Component);
    const _this = this;
    var _debug, _prevCamera, _lockCamera;

    var _anim = {weight: 0};
    var _center = new Vector3();

    this.tweenFOV = false;

    //*** Constructor
    (function () {
        // if (Utils.query('orbit')) initDebug();
        // else World.CONTROLS.enabled = false;
        _this.startRender(loop);
    })();

    function initDebug() {
        _debug = new Mesh(new BoxGeometry(0.25, 0.25, 0.5), new Shader('DebugCamera'));
        World.SCENE.add(_debug);
        _worldCamera = new PerspectiveCamera();
    }

    function loop() {
        if (_debug) _debug.visible = !_debug.position.equals(_center);

        if (_prevCamera) {
            _worldCamera.position.copy(_prevCamera.getWorldPosition()).lerp(_lockCamera.getWorldPosition(), _anim.weight);
            _worldCamera.quaternion.copy(_prevCamera.getWorldQuaternion()).slerp(_lockCamera.getWorldQuaternion(), _anim.weight);

            if (_this.tweenFOV) {
                _worldCamera.fov += (_lockCamera.fov - _worldCamera.fov) * _anim.weight;
                _worldCamera.updateProjectionMatrix();
            }
        } else {
            if (_lockCamera) Utils3D.decompose(_lockCamera, _worldCamera);
        }

        if (_debug) {
            _debug.position.copy(_worldCamera.position);
            _debug.quaternion.copy(_worldCamera.quaternion);
        }
    }

    //*** Event handlers

    //*** Public methods
    this.lock = function(camera) {
        _lockCamera = camera;
        _worldCamera.fov = _lockCamera.fov;
        _worldCamera.updateProjectionMatrix();
    };

    this.transition = function(camera, duration = 1000, ease = 'easeInOutCubic') {

        // If transitioning back to the same camera, don't reset values
        if (_prevCamera === camera) {

            // If previous transition cut short, shorten return transition. minimum of 0.5;
            duration *= Math.smoothStep(0.5, 1, _anim.weight) * 0.5 + 0.5;
            _anim.weight = 1 - _anim.weight;
        } else {
            _anim.weight = 0;
        }

        _prevCamera = _lockCamera;
        _lockCamera = camera;
        return tween(_anim, {weight: 1}, duration, ease);
    };

    this.get('worldCamera', _ => {
        return _worldCamera;
    });

    this.set('debugScale', s => {
        if (_debug) _debug.scale.setScalar(s);
    });

}, 'singleton');
