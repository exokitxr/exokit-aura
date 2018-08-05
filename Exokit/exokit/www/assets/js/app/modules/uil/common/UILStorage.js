Class(function UILStorage() {
    Inherit(this, Component);
    const _this = this;

    var _data = {};
    var _dataSession = {};

    var _fs;

    this.SAVE = 'uil_save';

    Hydra.ready(async _ => {
        init();
        if (!Hydra.LOCAL || Device.mobile || window._BUILT_ || !(location.search.includes('uil') || Device.detect('hydra'))) return;
        __window.bind('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.keyCode == 83) {
                e.preventDefault();
                write();
            }
        });
    });

    async function init() {
        _fs = _this.initClass(uilFile() ? UILFile : UILRemote);
        _data = await _fs.load();
        _this.loaded = true;
    }

    async function write(direct, silent) {
        let prevent = false;
        let e = {};
        e.prevent = _ => prevent = true;
        _this.events.fire(_this.SAVE, e);

        if (!direct) {
            if (e.wait) await e.wait();
            if (prevent) return;
        }

        _fs.save(_dataSession, _data);
        _dataSession = {};

        if (!silent) {
            __body.css({display: 'none'});
            _this.delayedCall(() => {
                __body.css({display: 'block'});
            }, 100);
        }
    }

    function uilFile() {
        if (!Hydra.LOCAL) return true;
        if (Device.mobile) return true;
        if (window._BUILT_) return true;
        if (!window._FIREBASE_UIL_) return true;
        if (Device.detect('hydra')) return false;
        if (!location.search.includes('uil')) return true;
        return false;
    }

    this.set = function(key, value) {
        if (value === null) {
            delete _data[key];
            delete _dataSession[key];
        } else {
            _data[key] = value;
            _dataSession[key] = value;
        }
    };

    this.setWrite = function(key, value) {
        this.set(key, value);
        write(true);
    };

    this.clearMatch = function(string) {
        for (let key in _data) {
            if (key.includes(string)) delete _data[key];
        }

        write(true);
    };

    this.write = function(silent) {
        write(true, silent);
    };

    this.get = function(key) {
        return _data[key];
    };

    this.ready = function() {
        return _this.wait(_this, 'loaded');
    };

    this.parse = function(key, hint) {
        let data = _data[key];
        if (typeof data === 'undefined') return null;

        if (Array.isArray(data)) {
            let ColorClass = window.THREE ? THREE.Color : Color;
            let V2 = window.THREE ? THREE.Vector2 : Vector2;
            let V3 = window.THREE ? THREE.Vector3 : Vector3;
            let V4 = window.THREE ? THREE.Vector4 : Vector4;

            if (hint instanceof ColorClass) {
                let color = new ColorClass().setRGB(data[0], data[1], data[2]);
                return {value: color};
            }

            if (hint instanceof V2) return {value: new V2().fromArray(data)};
            if (hint instanceof V3) return {value: new V3().fromArray(data)};
            if (hint instanceof V4) return {value: new V4().fromArray(data)};
        }

        return {value: data};
    };
}, 'static');