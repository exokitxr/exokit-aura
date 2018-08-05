/**
 * Mouse input controller class
 * @name Interaction
 * @example
 * const input = new Interaction(Stage);
 * _this.events.sub(input, Interaction.START, e => console.log(e, input.hold));
 * @example
 * // Events include
 * // Interaction.START - cursor down
 * // Interaction.MOVE - cursor move
 * // Interaction.DRAG - cursor move while down
 * // Interaction.END - cursor up
 * // Interaction.CLICK - cursor up within time and movement limits
 */

Class(function Interaction(_object) {
    Inherit(this, Events);
    const _this = this;

    function Vec2() {
        this.x = 0;
        this.y = 0;
        this.length = function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };
    }

    /**
     * Current mouse x position
     * @name x
     * @memberof Interaction
     */
    this.x = 0;

    /**
     * Current mouse y position
     * @name y
     * @memberof Interaction
     */
    this.y = 0;

    /**
     * Value of last cursor down event position.
     * Object with x, y properties, and length method.
     * @name hold
     * @memberof Interaction
     */
    this.hold = new Vec2();

    /**
     * Value of cursor position from last event.
     * Object with x, y properties, and length method.
     * @name last
     * @memberof Interaction
     */
    this.last = new Vec2();

    /**
     * Movement since last cursor event position.
     * Object with x, y properties, and length method.
     * @name delta
     * @memberof Interaction
     */
    this.delta = new Vec2();

    /**
     * Movement since last down event position.
     * Object with x, y properties, and length method.
     * @name move
     * @memberof Interaction
     */
    this.move = new Vec2();

    /**
     * Movement delta divided by time delta.
     * Object with x, y properties, and length method.
     * @name velocity
     * @memberof Interaction
     */
    this.velocity = new Vec2();

    let _distance, _timeDown, _timeMove;

    //*** Constructor
    (function () {
        if (!_object instanceof HydraObject) throw `Interaction.Input requires a HydraObject`;
        addHandlers();
    })();

    function addHandlers() {
        if (_object == Stage || _object == __window) Interaction.bind('touchstart', down);
        else _object.bind('touchstart', down);

        Interaction.bind('touchmove', move);
        Interaction.bind('touchend', up);
    }

    //*** Event handlers
    function down(e) {
        _this.isTouching = true;

        if (e.touches && typeof e.touches[0].force === 'number') e.force = e.touches[0].force;

        _this.x = e.x;
        _this.y = e.y;

        _this.hold.x = _this.last.x = e.x;
        _this.hold.y = _this.last.y = e.y;

        _this.delta.x = _this.move.x = _this.velocity.x = 0;
        _this.delta.y = _this.move.y = _this.velocity.y = 0;
        _distance = 0;

        _this.events.fire(Interaction.START, e, true);
        _timeDown = _timeMove = Render.TIME;
    }

    function move(e) {
        if (_this.isTouching) {
            _this.move.x = e.x - _this.hold.x;
            _this.move.y = e.y - _this.hold.y;
        }

        if (e.touches && typeof e.touches[0].force === 'number') e.force = e.touches[0].force;

        _this.x = e.x;
        _this.y = e.y;

        _this.delta.x = e.x - _this.last.x;
        _this.delta.y = e.y - _this.last.y;

        _this.last.x = e.x;
        _this.last.y = e.y;

        _distance += _this.delta.length();

        let delta = Math.max(0.001, Render.TIME - (_timeMove || Render.TIME));
        _timeMove = Render.TIME;

        _this.velocity.x = Math.abs(_this.delta.x) / delta;
        _this.velocity.y = Math.abs(_this.delta.y) / delta;

        _this.events.fire(Interaction.MOVE, e, true);
        if (_this.isTouching) _this.events.fire(Interaction.DRAG, e, true);
    }

    function up(e) {
        if (!_this.isTouching) return;
        _this.isTouching = false;

        _this.move.x = 0;
        _this.move.y = 0;

        // If user waited without moving before releasing, clear delta movement for correct inertia calculation
        let delta = Math.max(0.001, Render.TIME - (_timeMove || Render.TIME));
        if (delta > 100) {
            _this.delta.x = 0;
            _this.delta.y = 0;
        }

        // If moved less than 20 pixels and quicker than 2000 milliseconds
        if (_distance < 20 && Render.TIME - _timeDown < 2000) {
            _this.events.fire(Interaction.CLICK, e, true);
        }

        _this.events.fire(Interaction.END, e, true);
    }

    //*** Public methods
    this.destroy = function() {
        Interaction.unbind('touchstart', down);
        Interaction.unbind('touchmove', move);
        Interaction.unbind('touchend', up);
        _object && _object.unbind && _object.unbind('touchstart', down);
        return this._destroy && this._destroy();
    }
}, () => {
    Namespace(Interaction);

    Interaction.CLICK = 'interaction_click';
    Interaction.START = 'interaction_start';
    Interaction.MOVE = 'interaction_move';
    Interaction.DRAG = 'interaction_drag';
    Interaction.END = 'interaction_end';

    const _events = {touchstart: [], touchmove: [], touchend: []};

    Hydra.ready(() => {
        __window.bind('touchstart', touchStart);
        __window.bind('touchmove', touchMove);
        __window.bind('touchend', touchEnd);
        __window.bind('touchcancel', touchEnd);
        __window.bind('contextmenu', touchEnd);
    });

    function touchMove(e) {
        _events.touchmove.forEach(c => c(e));
    }

    function touchStart(e) {
        _events.touchstart.forEach(c => c(e));
    }

    function touchEnd(e) {
        _events.touchend.forEach(c => c(e));
    }

    Interaction.bind = function(evt, callback) {
        _events[evt].push(callback);
    };

    Interaction.unbind = function(evt, callback) {
        _events[evt].remove(callback);
    };
});
/**
 * Mouse global position
 * @name Mouse
 */

Class(function Mouse() {
    Inherit(this, Events);
    const _this = this;
    /**
     * Current mouse x position
     * @name Mouse.x
     * @memberof Mouse
     */
    this.x = 0;

    /**
     * Current mouse y position
     * @name Mouse.y
     * @memberof Mouse
     */
    this.y = 0;

    /**
     * Current mouse x position in window from 0 > 1
     * @name Mouse.normal
     * @memberof Mouse
     */
    this.normal = {
        x: 0,
        y: 0,
    };

    /**
     * Current mouse x position in window from -1 > 1
     * @name Mouse.tilt
     * @memberof Mouse
     */
    this.tilt = {
        x: 0,
        y: 0,
    };

    /**
     * Current mouse x position in window from 0 > 1 where y is flipped for use in WebGL
     * @name Mouse.inverseNormal
     * @memberof Mouse
     */
    this.inverseNormal = {
        x: 0,
        y: 0,
    };

    /**
     * Have the Mouse x and y values reset to 0,0 when interaction stops on mobile
     * @name Mouse.resetOnRelease
     * @memberof Mouse
     */
    this.resetOnRelease = false;

    const _offset = {
        x: 0,
        y: 0,
    };

    (function() {
        Hydra.ready(init);
    })();

    function init() {

        /**
         * Interaction instance attached to window.
         * @name Mouse.input
         * @memberof Mouse
         * @example
         * _this.events.sub(Mouse.input, Interaction.MOVE, move);
         */
        _this.input = new Interaction(__window);
        _this.events.sub(_this.input, Interaction.START, update);
        _this.events.sub(_this.input, Interaction.MOVE, update);
        _this.events.sub(_this.input, Interaction.END, end);

        _this.hold = _this.input.hold;
        _this.last = _this.input.last;
        _this.delta = _this.input.delta;
        _this.move = _this.input.move;
        _this.velocity = _this.input.velocity;

        // Defer to be called after Stage is possibly manipulated
        defer(() => {
            _this.events.sub(Events.RESIZE, resize);
            resize();
        });
    }

    function update(e) {
        _this.x = e.x;
        _this.y = e.y;

        if (!Stage.width || !Stage.height) return;

        _this.normal.x = e.x / Stage.width - _offset.x;
        _this.normal.y = e.y / Stage.height - _offset.y;
        _this.tilt.x = _this.normal.x * 2.0 - 1.0;
        _this.tilt.y = 1.0 - _this.normal.y * 2.0;
        _this.inverseNormal.x = _this.normal.x;
        _this.inverseNormal.y = 1.0 - _this.normal.y;
    }

    function end(e) {
        if (Device.mobile && _this.resetOnRelease) update(_this.resetOnRelease);
    }

    function resize() {
        if (Stage.css('top')) _offset.y = Stage.css('top') / Stage.height;
        if (Stage.css('left')) _offset.x = Stage.css('left') / Stage.width;
    }

}, 'Static');
