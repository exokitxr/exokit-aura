Class(function ShaderUILGroup(_shader, _uil) {
    Inherit(this, Component);
    var _this = this;

    var _group = _uil && !ShaderUIL.exists[_shader.UILPrefix] ? _uil.add('group', {name: 'SHADER_'+getName()}) : null;
    var _objects = [];
    var _items = [];

    //*** Constructor
    (function () {
        ShaderUIL.exists[_shader.UILPrefix] = true;
        initItems();
        if (Global.UIL) addListeners();
    })();

    function getName() {
        let split = _shader.UILPrefix.split('/');
        if (split.length > 2) return split[0] + '_' + split[2];
        return split[0];
    }

    function initItems() {
        for (var key in _shader.uniforms) {
            let obj = _shader.uniforms[key];
            if (obj.ignoreUIL) continue;

            if (_shader.UILPrefix.includes('_am_')) {
                if (key.includes('time')) continue;
                if (key.includes('fSize')) continue;
                if (key.includes('fTotalNum')) continue;
            }

            const ColorClass = window.THREE ? THREE.Color : Color;
            if (obj.value instanceof ColorClass) createColor(obj, key);
            if (typeof obj.value === 'number') createNumber(obj, key);
            if (obj.value === null || obj.value instanceof Texture) createTexture(obj, key);
            if (obj.value instanceof Vector3) createVector(obj, key);
        }
    }

    function createVector(obj, key) {
        if (_group) {
            let val = new UILItem(key, obj.value.toArray(), {prefix: _shader.UILPrefix}, val => {
                obj.value.fromArray(val);
                if (_group) _this.events.fire(ShaderUIL.UPDATE, {prefix: _shader.UILPrefix, key, val, vector: true});
            });
            _group.add('number', val.obj);
        }

        obj.value.fromArray(UILStorage.get(`${_shader.UILPrefix}${key}`) || obj.value.toArray());
    }

    function createTexture(obj, key) {
        const getTexture = obj.getTexture || ShaderUIL.getTexture || Utils3D.getTexture;
        const set = _shader.parent && _shader.parent.setOverride ? _shader.parent.setOverride : _shader.set;

        let prefix = _shader.UILPrefix + '_tx';
        let value = UILStorage.get(`${prefix}_${key}`);

        let change = val => {
            UILStorage.set(`${prefix}_${key}`, val);
            set(key, getTexture(val, {premultiplyAlpha: obj.premultiplyAlpha, scale: obj.scale}), val);
            if (_group) _this.events.fire(ShaderUIL.UPDATE, {prefix: _shader.UILPrefix, key, val, texture: _shader.get(key), group: _this});
        };

        if (value && value.length) change(value);

        if (_group) _group.add('string', {name: key, value, callback: change});
    }

    function createNumber(obj, key) {
        let val = new UILItem(key, obj.value, {prefix: _shader.UILPrefix}, val => {
            obj.value = val;
            if (_shader.ubo) _shader.ubo.needsUpdate = true;
            if (_group) _this.events.fire(ShaderUIL.UPDATE, {prefix: _shader.UILPrefix, key, val});
        });
        if (_group) _group.add('number', val.obj);
        _objects.push({key, obj});
        _items.push(val);
    }

    function createColor(obj, key) {
        let val = new UILItem(key, obj.value.getHex(), {prefix: _shader.UILPrefix}, val => {
            if (Array.isArray(val)) obj.value.setRGB(val[0], val[1], val[2]);
            else obj.value.set(val);
            if (_shader.ubo) _shader.ubo.needsUpdate = true;
            if (_group) _this.events.fire(ShaderUIL.UPDATE, {prefix: _shader.UILPrefix, key, val, color: true});
        });
        if (_group) {
            let uil = _group.add('color', val.obj);
            _objects.push({key, obj});
            _items.push(val);


            for (let i = 2; i < uil.c.length; i++) {
                uil.c[i].className = 'noInvert';
            }
        }
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(ShaderUIL.UPDATE, update);
    }

    function update(e) {
        if (e.prefix != _shader.UILPrefix || e.group == _this) return;
        if (e.color) {
            let val = e.val;
            let obj = _shader.uniforms[e.key];
            if (Array.isArray(val)) obj.value.setRGB(val[0], val[1], val[2]);
            else obj.value.set(val);
        } else if (e.texture) {
            _shader.set(e.key, e.texture);
        } else if (e.vector) {
            _shader.get(e.key).fromArray(e.val);
        } else {
            _shader.uniforms[e.key].value = e.val;
        }
    }

    //*** Public methods
    this.console = function() {
        console.log(_shader.UILPrefix);
        _objects.forEach(obj => {
            if (obj.obj.type == 'c') console.log(obj.key, '#' + obj.obj.value.getHexString());
            else console.log(obj.key, obj.obj.value);
        });
        console.log('----');
    }

    this.clear = function() {
        _items.forEach(item => item.clear());
    }
});