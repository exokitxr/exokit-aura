/**
 * Attaches to Mobile namespace. Use as Mobile.Accelerometer
 * @name Accelerometer
 */

Mobile.Class(function Accelerometer() {
    var _this = this;

    this.x = 0;
    this.y = 0;
    this.z = 0;

    this.alpha = 0;
    this.beta = 0;
    this.gamma = 0;

    this.heading = 0;

    this.rotationRate = {};
    this.rotationRate.alpha = 0;
    this.rotationRate.beta = 0;
    this.rotationRate.gamma = 0;

    this.toRadians = Device.system.os == 'ios' ? Math.PI / 180 : 1;

    //*** Event Handlers
    function updateAccel(e) {
        switch (window.orientation) {
            case 0:
                _this.x = -e.accelerationIncludingGravity.x;
                _this.y = e.accelerationIncludingGravity.y;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.rotationRate.alpha = e.rotationRate.beta * _this.toRadians;
                    _this.rotationRate.beta = -e.rotationRate.alpha * _this.toRadians;
                    _this.rotationRate.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;

            case 180:
                _this.x = e.accelerationIncludingGravity.x;
                _this.y = -e.accelerationIncludingGravity.y;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.rotationRate.alpha = -e.rotationRate.beta * _this.toRadians;
                    _this.rotationRate.beta = e.rotationRate.alpha * _this.toRadians;
                    _this.rotationRate.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;

            case 90:
                _this.x = e.accelerationIncludingGravity.y;
                _this.y = e.accelerationIncludingGravity.x;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.rotationRate.alpha = e.rotationRate.alpha * _this.toRadians;
                    _this.rotationRate.beta = e.rotationRate.beta * _this.toRadians;
                    _this.rotationRate.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;

            case -90:
                _this.x = -e.accelerationIncludingGravity.y;
                _this.y = -e.accelerationIncludingGravity.x;
                _this.z = e.accelerationIncludingGravity.z;

                if (e.rotationRate) {
                    _this.rotationRate.alpha = -e.rotationRate.alpha * _this.toRadians;
                    _this.rotationRate.beta = -e.rotationRate.beta * _this.toRadians;
                    _this.rotationRate.gamma = e.rotationRate.gamma * _this.toRadians;
                }
            break;
        }

        if (Device.system.os == 'android') {
            _this.x *= -1;
            _this.y *= -1;
            _this.z *= -1;
        }
    }

    function updateOrientation(e) {
        for (var key in e) {
            if (key.toLowerCase().includes('heading')) _this.heading = e[key];
        }

        switch (window.orientation) {
            case 0:
                _this.alpha = e.beta * _this.toRadians;
                _this.beta = -e.alpha * _this.toRadians;
                _this.gamma = e.gamma * _this.toRadians;
                break;

            case 180:
                _this.alpha = -e.beta * _this.toRadians;
                _this.beta = e.alpha * _this.toRadians;
                _this.gamma = e.gamma * _this.toRadians;
                break;

            case 90:
                _this.alpha = e.alpha * _this.toRadians;
                _this.beta = e.beta * _this.toRadians;
                _this.gamma = e.gamma * _this.toRadians;
                break;

            case -90:
                _this.alpha = -e.alpha * _this.toRadians;
                _this.beta = -e.beta * _this.toRadians;
                _this.gamma = e.gamma * _this.toRadians;
                break;
        }

        _this.tilt = e.beta * _this.toRadians;
        _this.yaw = e.alpha * _this.toRadians;
        _this.roll = -e.gamma * _this.toRadians;

        if (Device.system.os == 'android') _this.heading = compassHeading(e.alpha, e.beta, e.gamma);
    }

    function compassHeading(alpha, beta, gamma) {
        var degtorad = Math.PI / 180;

        var _x = beta  ? beta  * degtorad : 0; // beta value
        var _y = gamma ? gamma * degtorad : 0; // gamma value
        var _z = alpha ? alpha * degtorad : 0; // alpha value

        var cX = Math.cos( _x );
        var cY = Math.cos( _y );
        var cZ = Math.cos( _z );
        var sX = Math.sin( _x );
        var sY = Math.sin( _y );
        var sZ = Math.sin( _z );

        // Calculate Vx and Vy components
        var Vx = - cZ * sY - sZ * sX * cY;
        var Vy = - sZ * sY + cZ * sX * cY;

        // Calculate compass heading
        var compassHeading = Math.atan( Vx / Vy );

        // Convert compass heading to use whole unit circle
        if( Vy < 0 ) {
            compassHeading += Math.PI;
        } else if( Vx < 0 ) {
            compassHeading += 2 * Math.PI;
        }

        return compassHeading * ( 180 / Math.PI ); // Compass Heading (in degrees)

    }

    //*** Public methods
    this.capture = function() {
        if (!this.active) {
            this.active = true;
            window.ondevicemotion = updateAccel;
            window.addEventListener('deviceorientation', updateOrientation);
        }
    }

    this.stop = function() {
        this.active = false;
        window.ondevicemotion = null;
        _this.x = _this.y = _this.z = 0;
        window.removeEventListener('deviceorientation', updateOrientation);
    }
}, 'Static');