/**
 * @name Mobile
 */

Class(function Mobile() {
    Inherit(this, Component);
    Namespace(this);
    const _this = this;

    Hydra.ready(() => {
        if (!Device.mobile) return;

        addHandlers();

        // iOS full screen hack
        if (Device.system.browser == 'safari' && !Device.mobile.native) __body.css({height: '100%'}).div.scrollTop = 0;
        if (Device.mobile.native) Stage.css({width: '100vw', height: '100vh'});
    });

    function addHandlers() {
        _this.events.sub(Events.RESIZE, resize);
        if (!Device.mobile.native) window.addEventListener('touchstart', preventNativeScroll, {passive: false});
    }

    function preventNativeScroll(e) {
        if (_this.isAllowNativeScroll) return;

        let target = e.target;

        // Return if element is input type
        if (target.nodeName == 'INPUT' || target.nodeName == 'TEXTAREA' || target.nodeName == 'SELECT' || target.nodeName == 'A') return;

        // Only prevent if none of the elements have requested native scroll using Mobile.overflowScroll()
        let prevent = true;
        while (target.parentNode && prevent) {
            if (target._scrollParent) prevent = false;
            target = target.parentNode;
        }
        if (prevent) e.preventDefault();
    }

    function resize() {
        updateOrientation();
        checkResizeRefresh();

        // Keep page scrolled to the top for iOS fullscreen 101% hack
        if (!_this.isAllowNativeScroll) document.body.scrollTop = 0;
    }

    function updateOrientation() {
        _this.orientation = Stage.width > Stage.height ? 'landscape' : 'portrait';
        if (!_this.orientationSet) return;
        if (!window.Fullscreen.isOpen && !Device.mobile.pwa) return;
        if (window.screen && window.screen.orientation) window.screen.orientation.lock(_this.orientationSet);
    }

    const checkResizeRefresh = (function() {
        let _lastWidth;
        return function() {
            if (_this.isPreventResizeReload) return;
            if (_lastWidth == Stage.width) return;
            _lastWidth = Stage.width;
            if (Device.system.os !== 'ios' && !(Device.system.os == 'android' && Device.system.version >= 7)) return;

            // Need to use stage as screen doesn't reflect when user sets app to half of screen on tablet
            if (Device.mobile.tablet && !(Math.max(Stage.width, Stage.height) > 800)) window.location.reload();
        }
    })();

    //*** Public Methods
    /**
     * @name Mobile.vibrate
     * @memberof Mobile
     *
     * @function
     * @param {Number} duration
     */
    this.vibrate = function(duration) {
        navigator.vibrate && navigator.vibrate(duration);
    };

    /**
     * Add handler on touchend to go to fullscreen. Android-only.
     * @name Mobile.fullscreen
     * @memberof Mobile
     *
     * @function
     */
    this.fullscreen = function() {

        // Return if Native, Progressive Web App, or Emulator
        if (!Device.mobile || Device.mobile.native || Device.mobile.pwa || Dev.emulator) return;

        if (!window.Fullscreen) throw `Mobile.fullscreen requires Fullscreen module`;

        // Fullscreen doesn't work on iOS
        if (Device.system.os !== 'android') return;
        __window.bind('touchend', () => {
             Fullscreen.open();
        });

        if (_this.ScreenLock && _this.ScreenLock.isActive) window.onresize();
    };

    /**
     * Lock orientation if possible.
     * If orientation is utterly important, pass isForce as true - this will force portrait orientation only by rotating stage when necessary.
     * Forced orientation required ScreenLock module.
     * @name Mobile.setOrientation
     * @memberof Mobile
     *
     * @function
     * @param {String} orientation - Either 'portrait' or 'landscape'
     * @param {Boolean} [isForce] Whether to force portrait by rotating stage. For iOS mainly, or Android when not fullscreen.
     */
    this.setOrientation = function(orientation, isForce) {
        // Native orientation lock
        if (_this.System && _this.NativeCore.active) return _this.System.orientation = _this.System[orientation.toUpperCase()];

        _this.orientationSet = orientation;

        updateOrientation();

        if (!isForce) return;
        if (!_this.ScreenLock) throw `Mobile.setOrientation isForce argument requires ScreenLock module`;
        if (orientation === 'any') _this.ScreenLock.unlock();
        else _this.ScreenLock.lock();
    };

    /**
     * Stops preventing default on touch. This will make the body shift on touchmove, which is unwanted in full-screen experiences.
     * @name Mobile.allowNativeScroll
     * @memberof Mobile
     *
     * @function
     */
    this.allowNativeScroll = function() {
        _this.isAllowNativeScroll = true;
    };

    /**
     * Prevent reload when resize is so drastic that re-definition of phone/tablet required
     * @name Mobile.preventResizeReload
     * @memberof Mobile
     *
     * @function
     */
    this.preventResizeReload = function() {
        _this.isPreventResizeReload = true;
    };

    /**
     * @name Mobile.addOverflowScroll
     * @memberof Mobile
     * @private
     *
     * @function
     * @param {HydraObject} $obj
     */
    this._addOverflowScroll = function($obj) {
        $obj.div._scrollParent = true;
        if (Device.mobile.native) return;
        $obj.div._preventEvent = function(e) {
            e.stopPropagation();
        };
        $obj.bind('touchmove', $obj.div._preventEvent);
    };

    /**
     * @name Mobile.removeOverflowScroll
     * @memberof Mobile
     * @private
     *
     * @function
     * @param {HydraObject} $obj
     */
    this._removeOverflowScroll = function($obj) {
        $obj.unbind('touchmove', $obj.div._preventEvent);
    };

    this.get('phone', () => {
        throw 'Mobile.phone is removed. Use Device.mobile.phone';
    });

    this.get('tablet', () => {
        throw 'Mobile.tablet is removed. Use Device.mobile.tablet';
    });

    this.get('os', () => {
        throw 'Mobile.os is removed. Use Device.system.os';
    });

}, 'Static');
