/**
 * Fullscreen controller.<br />
 * IE 10 and below has no fullscreen API
 * @name Fullscreen
 */

Class(function Fullscreen() {
    Inherit(this, Events);
    const _this = this;

    /**
     * @name Fullscreen.isOpen
     * @memberof Fullscreen
     */
    this.isOpen = false;

    (function() {
        addHandlers();

        // TODO: May not need to check in loop
        // Render.start(check, 2);
    })();

    function addHandlers() {
        [
            'onfullscreenchange',
            'onwebkitfullscreenchange',
            'onmozfullscreenchange',
            'onmsfullscreenchange',

            'onfullscreenerror',
            'onwebkitfullscreenerror',
            'onmozfullscreenerror',
            'onmsfullscreenerror'
        ].forEach(evt => {
            if (typeof document[evt] !== 'undefined') document[evt] = update;
        });
    }

    function update() {
        const isOpen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (isOpen === _this.isOpen) return;
        _this.isOpen = isOpen;

        _this.events.fire(Events.FULLSCREEN, {fullscreen: _this.isOpen});
    }

    //*** Public methods

    /**
     * @name Fullscreen.open
     * @memberof Fullscreen
     *
     * @function
     * @param {DocumentElement} element
     */
    this.open = function(element) {
        if (!Device.system.fullscreen) return console.warn('Fullscreen API not supported');
        element = element || document.body;

        [
            'requestFullscreen',
            'webkitRequestFullscreen',
            'mozRequestFullScreen',
            'msRequestFullscreen'
        ].every(method => {
            if (typeof element[method] == 'undefined') return true;
            element[method]();
        });
    };

    /**
     * @name Fullscreen.close
     * @memberof Fullscreen
     *
     * @function
     */
    this.close = function() {
        if (!Device.system.fullscreen) return console.warn('Fullscreen API not supported');
        [
            'exitFullscreen',
            'webkitExitFullscreen',
            'mozCancelFullScreen',
            'msExitFullscreen'
        ].every(method => {
            if (typeof document[method] == 'undefined') return true;
            document[method]();
        });
    };

}, 'static');