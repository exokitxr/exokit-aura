Class(function LightUILGroup(_light, _uil) {
    Inherit(this, Component);
    const _this = this;

    if (!_light.prefix) throw 'light.prefix required when using MeshUIL';

    var prefix = 'LIGHT_'+_light.prefix;
    var _group = _uil && !MeshUIL.exists[prefix] ? _uil.add('group', {name: prefix}) : null;

    //*** Constructor
    (function () {
        LightUIL.exists[prefix] = true;
        initVec('position');
        initVec('scale');
        initRotation();
        initColor('color');
        initNumber('intensity');
        initNumber('distance');
    })();

    function initNumber(key, def) {
        if (_group) {
            let val = new UILItem(key, _light[key], {prefix}, val => {
                _light[key] = val;
            });
            _group.add('number', val.obj);
        }

        _light[key] = UILStorage.get(`${prefix}${key}`) || _light[key] || 9999;
    }

    function initColor(key) {
        if (_group) {
            let val = new UILItem(key, _light[key].getHex(), {prefix}, val => {
                if (Array.isArray(val)) _light[key].setRGB(val[0], val[1], val[2]);
                else _light[key].set(val);
            });
            let uil = _group.add('color', val.obj);

            for (let i = 2; i < uil.c.length; i++) {
                uil.c[i].className = 'noInvert';
            }
        }

        _light[key].fromArray(UILStorage.get(`${prefix}${key}`) || [1, 1, 1]);
    }

    function initVec(key) {
        if (_group) {
            let val = new UILItem(key, _light[key].toArray(), {prefix}, val => {
                _light[key].fromArray(val);
                if (key == 'position' && _light.physics) _light.physics.updatePosition();
            });
            _group.add('number', val.obj);
        }

        _light[key].fromArray(UILStorage.get(`${prefix}${key}`) || _light[key].toArray());
    }

    function initRotation() {
        let key = 'rotation';
        let toRadians = array => {
            if (!array) return [0, 0, 0];
            array.length = 3;
            return array.map(x => Math.radians(x));
        };

        let toDegrees = array => {
            if (!array) return [0, 0, 0];
            array.length = 3;
            return array.map(x => Math.degrees(x));
        };

        if (_group) {
            let val = new UILItem(key, toDegrees(_light[key].toArray()), {prefix}, val => {
                _light[key].fromArray(toRadians(val));
            });
            _group.add('number', val.obj);
        }

        _light[key].fromArray(toRadians(UILStorage.get(`${prefix}${key}`)));
    }

    //*** Event handlers

    //*** Public methods
    this.initNumber = initNumber;
    this.initColor = initColor;
    this.initVec = initVec;
});