/**
 * @name NukePass
 * @param {String} fragmentShader
 * @param {Object} uniforms
 */
Class(function NukePass(_fs, _uniforms, _pass) {
    Inherit(this, Component);
    var _this = this;

    this.UILPrefix = typeof _fs == 'string' ? _fs : Utils.getConstructorName(_fs);

    function prefix(code) {
        if (!code) throw `No shader ${_fs} found`;
        let pre = '';

        if (!code.includes('uniform sampler2D tDiffuse')) {
            pre += 'uniform sampler2D tDiffuse;\n';
            pre += 'varying vec2 vUv;\n';
        }

        code = pre + code;

        return code;
    }

    //*** Public methods
    this.init = function(fs, vs) {
        if (_this.pass) return;
        _this = this;

        let name = fs || this.constructor.toString().match(/function ([^\(]+)/)[1];
        let fragmentShader = Array.isArray(fs) ? fs.join('') : null;

        _this.uniforms = _uniforms || _this.uniforms || {};
        _this.uniforms.tDiffuse = {type: 't', value: null};

        if (_this.uniforms.unique) _this.UILPrefix += '_' + _this.uniforms.unique + '_';

        if (window.UILStorage) {
            for (let key in _this.uniforms) {
                if (key === 'unique') continue;
                _this.uniforms[key] = UILStorage.parse(_this.UILPrefix + key) || _this.uniforms[key];
            }
        }

        _this.pass = _this.initClass(Shader, vs || 'NukePass', fs, Utils.mergeObject(_this.uniforms, {precision: 'high'}), (code, type) => type == 'fs' ? prefix(code) : code);

        _this.uniforms = _this.pass.uniforms;
    };

    /**
     * @name set
     * @memberof NukePass
     *
     * @function
     * @param {String} key
     * @param {*} [value]
     * @returns {*} value of uniform
     */
    this.set = function(key, value) {
        TweenManager.clearTween(_this.uniforms[key]);
        _this.uniforms[key].value = value;
    };

    /**
     * @name get
     * @memberof NukePass
     *
     * @function
     * @param {String} key
     * @returns {*} value of uniform
     */
    this.get = function(key) {
        if (typeof _this.uniforms[key] === 'undefined') return null;
        return _this.uniforms[key].value;
    }

    /**
     * @name tween
     * @memberof NukePass
     *
     * @function
     * @param {String} key
     * @param {*} value
     * @param {Number} time
     * @param {String} ease
     * @param {Number} [delay]
     * @returns {Tween}
     */
    this.tween = function(key, value, time, ease, delay, callback, update) {
        return tween(_this.uniforms[key], {value: value}, time, ease, delay, callback, update);
    };

    this.clone = function() {
        if (!_this.pass) _this.init(_fs);
        return new NukePass(null, null, _this.pass.clone());
    }

    if (typeof _fs === 'string') {
        _this.init(_fs);
    } else if (_pass) {
        _this.pass = _pass;
        _this.uniforms = _pass.uniforms;
    }
});