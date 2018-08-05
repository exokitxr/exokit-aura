Class(function GLUIStageInteraction2D(_camera) {
    Inherit(this, Component);
    const _this = this;
    var _ray, _over, _click;

    var _test = [];
    var _objects = [];
    var _hold = new Vector2();
    var _calc = new Vector2();

    //*** Constructor
    (function () {
        addListeners();
    })();

    function canTest(obj) {
        if (obj.visible == false) return false;
        let parent = obj.parent;
        while (parent) {
            if (parent.visible == false) return false;
            parent = parent.parent;
        }
        return true;
    }

    function testObjects() {
        _test.length = 0;
        for (let i = _objects.length-1; i > -1; i--) {
            let obj = _objects[i];
            if (canTest(obj)) _test.push(obj);
        }
        return _test;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(Mouse.input, Interaction.MOVE, move);
        _this.events.sub(Mouse.input, Interaction.START, start);
        _this.events.sub(Mouse.input, Interaction.END, end);
    }

    function move(e) {
        if (GLUI.PREVENT_INTERACTION) return;
        if (!_ray) {
            _ray = new Raycaster(_camera);
            _ray.testVisibility = false;
        }

        let hit = _ray.checkHit(testObjects(), e);
        if (hit[0]) {
            GLUI.HIT = true;
            let obj = hit[0].object.glui;
            if (!_over) {
                _over = obj;
                _over._onOver({action: 'over', object: obj});
                Stage.css('cursor', 'pointer');
            }

            if (_over != obj) {
                _over._onOver({action: 'out', object: _over});
                _over = obj;
                _over._onOver({action: 'over', object: obj});
                Stage.css('cursor', 'pointer');
            }
        } else {
            GLUI.HIT = false;
            if (_over) {
                _over._onOver({action: 'out', object: _over});
                _over = null;
                Stage.css('cursor', 'auto');
            }
        }
    }

    function start(e) {
        if (GLUI.PREVENT_INTERACTION) return;
        if (Device.mobile) move(e);
        if (_over) {
            _click = _over;
            _hold.copy(e);
            _hold.time = Date.now();
        }
    }

    function end(e) {
        if (GLUI.PREVENT_INTERACTION) return;
        GLUI.HIT = false;
        if (_click) {
            if (Date.now() - _hold.time > 750 || _calc.subVectors(e, _hold).length() > 50) return _click = null;
            if (_click == _over) {
                _click._onClick({action: 'click', object: _click});
            }
        }

        _click = null;
    }

    //*** Public methods
    this.add = function(obj) {
        _objects.push(obj.mesh || obj);
    }

    this.remove = function(obj) {
        _objects.remove(obj.mesh || obj);
    }
});