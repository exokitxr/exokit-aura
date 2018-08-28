Class(function GazeCamera() {
    Inherit(this, BaseCamera);
    const _this = this;

    var _strength = {v: 1};
    var _move = new Vector3();
    var _position = new Vector3();

    this.moveXY = new Vector2(4, 4);
    this.position = new Position();
    this.position2 = _position;
    this.lerpSpeed = 0.04;
    this.lerpSpeed2 = 1;
    this.lookAt = new Vector3(0, 0, 0);

    //*** Constructor
    (function () {
        Mobile.Accelerometer.capture();
        _this.startRender(loop);
    })();

    function loop() {
        if (!Device.mobile) {
            _move.x = _this.position.x + (Math.range(Mouse.x, 0, Stage.width, -1, 1, true) * _strength.v * _this.moveXY.x);
            _move.y = _this.position.y + (Math.range(Mouse.y, 0, Stage.height, -1, 1, true) * _strength.v * _this.moveXY.y);
        } else {
            _move.x = _this.position.x + (Math.range(Mobile.Accelerometer.x, -2, 2, -1, 1, true) * _strength.v * _this.moveXY.x);
            _move.y = _this.position.y + (Math.range(Mobile.Accelerometer.y, -2, 2, -1, 1, true) * _strength.v * _this.moveXY.y);
        }

        _move.z = _this.position.z;

        _position.lerp(_move, _this.lerpSpeed2);
        _this.camera.position.lerp(_position, _this.lerpSpeed);
        _this.camera.lookAt(_this.lookAt);
    }

    //*** Event handlers

    //*** Public methods
    this.orbit = function(time = 1000, ease = 'easeInOutSine') {
        return tween(_strength, {v: 1}, time, ease);
    }

    this.still = function(time = 300, ease = 'easeInOutSine') {
        return tween(_strength, {v: 0}, time, ease);
    }

    //*** Internal Class
    function Position() {
        Inherit(this, Component);
        var _x = 0;
        var _y = 0;
        var _z = 0;

        this.get('x', _ => _x);
        this.get('y', _ => _y);
        this.get('z', _ => _z);

        this.set('x', x => {
            _x = x;
        });

        this.set('y', y => {
            _y = y;
        });

        this.set('z', z => {
            _z = z;
            _move.z = _z;
            _this.camera.position.copy(_move);
        });

        this.set = function(x, y, z) {
            _x = x;
            _y = y;
            _z = z;
            _move.z = z;
            _this.camera.position.copy(_move);
        }

    }
});