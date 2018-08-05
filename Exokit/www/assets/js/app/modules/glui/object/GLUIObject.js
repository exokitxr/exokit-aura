Class(function GLUIObject(_width, _height, _map) {
    const _this = this;
    const prototype = GLUIObject.prototype;

    function getMap() {
        if (typeof _map === 'string') {
            if (_map === 'empty' || _map === '') return null;
            return Utils3D.getTexture(_map, {premultiplyAlpha: false})
        }
        return _map;
    }

    var shader = new Shader('GLUIObject', {
        tMap: {value: getMap()},
        uAlpha: {type: 'f', value: 1},
        transparent: true,
        depthTest: false
    });

    if (!_map) shader.visible = false;

    this.usingMap = _map != undefined;
    this.tMap = shader.uniforms.tMap;
    this.group = new Group();
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scale = 1;
    this.rotation = 0;
    this.multiTween = true;
    this.dimensions = new Vector3(_width, _height, 1);
    this._shader = shader;

    this.mesh = new Mesh(GLUIObject.getGeometry('2d'), shader);
    this.mesh.glui = this;
    this.group.add(this.mesh);

    function getAlpha() {
        let alpha = _this.alpha;
        let $parent = _this.parent;
        while ($parent) {
            alpha *= $parent.alpha;
            $parent = $parent.parent;
        }
        return alpha;
    }

    this.mesh.onBeforeRender = () => {
        _this.group.position.x = _this.x;
        _this.group.position.y = _this._3d ? _this.y : -_this.y;
        _this.group.position.z = _this.z;

        if (_this.scale != 1) {
            _this.group.position.x += (_this.dimensions.x - (_this.dimensions.x * _this.scale))/2;
            _this.group.position.y -= (_this.dimensions.y - (_this.dimensions.y * _this.scale))/2;
        }

        let shader = _this.mesh.shader;

        if (_this.calcMask) {
            let v = _this.isMasked;
            v.copy(v.origin);
            _this.group.localToWorld(v);
            v.z = v.width;
            v.w = v.height;
        }

        if (shader && shader.uniforms && shader.uniforms.uAlpha) shader.uniforms.uAlpha.value = getAlpha();

        if (_map) {
            _this.mesh.scale.set(1, 1, 1).multiply(_this.dimensions);
            _this.group.scale.x = _this.scaleX * _this.scale;
            _this.group.scale.y = _this.scaleY * _this.scale;
        } else {
            _this.group.scale.set(_this.scaleX * _this.scale, _this.scaleY * _this.scale, 1);
        }

        if (!_this._3d) _this.group.rotation.z = Math.radians(_this.rotation);

        if (_this.anchor) {
            _this.anchor.position.copy(_this.group.position);
            _this.anchor.scale.copy(_this.group.scale);
            _this.anchor.quaternion.setFromEuler(_this.rotation);
        }
    };

    //*** Prototype
    if (typeof prototype.add !== 'undefined') return;
    prototype.add = function($obj) {
        $obj.parent = this;
        this.group.add($obj.group);

        if (this.isMasked) $obj.mask(this.isMasked, this.maskShader);
        if (this._3d && !$obj._3d) $obj.enable3D();
        if (this.deferred) {
            $obj.deferRender(true);
            if ($obj.anchor && this.anchor) this.anchor.add($obj.anchor);
        }

        return this;
    }

    prototype.interact = function(over, click) {
        this._onOver = over;
        this._onClick = click;
        let stage = this._3d ? GLUI.Scene : GLUI.Stage;
        if (over) stage.interaction.add(this);
        else stage.interaction.remove(this);
        return this;
    }

    prototype.remove = function() {
        if (this.mesh.parent) {
            this.group.parent.remove(this.group);
        } else {
            if (!this._3d) GLUI.Stage.remove(this);
            else GLUI.Scene.remove(this);
        }

        this.shader.destroy();
    }

    prototype.create = function(width, height, map) {
        let $obj = $gl(width, height, map);
        this.add($obj);
        if (this._3d) $obj.enable3D();
        return $obj;
    }

    prototype.removeChild = function(obj) {
        this.group.remove(obj.group);
        return this;
    }

    prototype.tween = function(obj, time, ease, delay) {
        return tween(this, obj, time, ease, delay);
    }

    prototype.enable3D = function(style2d) {
        this._3d = true;
        this.mesh.geometry = GLUIObject.getGeometry(style2d ? '2d' : '3d');
        this.mesh.shader.depthTest = true;
        this.rotation = new Euler();
        return this;
    }

    prototype.setZ = function(z) {
        this.mesh.renderOrder = z;
        return this;
    }

    prototype.show = function() {
        this.group.visible = true;
        return this;
    }

    prototype.hide = function() {
        this.group.visible = false;
        return this;
    }

    prototype.useShader = function(shader) {
        shader.uniforms.tMap = this.mesh.shader.uniforms.tMap;
        shader.uniforms.uAlpha = this.mesh.shader.uniforms.uAlpha;

        this.mesh.shader = shader;
    }

    prototype.depthTest = function(bool) {
        this.mesh.shader.depthTest = bool;
    }

    prototype.useGeometry = function(geom) {
        this.mesh.geometry = geom;
    }

    prototype.updateMap = function(src) {
        this._shader.uniforms.tMap.value = typeof src === 'string' ? Utils3D.getTexture(src) : src;
    }

    prototype.mask = function(d, shaderName) {
        var v;
        if (!(d instanceof Vector4)) {
            v = new Vector4(d.x, d.y, 0, 1);
            v.origin = new Vector4().copy(v);
            v.width = d.width;
            v.height = d.height;
            this.calcMask = true;
            this.isMasked = v;
        } else {
            this.isMasked = true;
            v = d;
        }

        this.maskShader = shaderName;

        if (this.usingMap) {
            let shader = _this.initClass(Shader, shaderName || 'GLUIObjectMask', {
                tMap: this.tMap,
                uAlpha: {value: 1},
                mask: {type: 'v4', value: v},
                transparent: true,
                depthWrite: false,
                depthTest: false
            });

            this.useShader(shader);
        }

        this.group.traverse(obj => {
            if (!!obj.glui && obj.glui != this) obj.glui.mask(v, shaderName);
        });

        return v;
    }

    prototype.deferRender = function(parent) {
        this.deferred = true;
        if (!parent) {
            this.anchor = new Group();
            GLUI.Scene.addDeferred(this);
        }
    }

    prototype.clearTween = function() {
        if (this._mathTweens) {
            this._mathTweens.forEach(t => {
                t.tween.stop();
            });
        }

        return this;
    }
}, () => {
    var _geom2d, _geom3d;
    GLUIObject.getGeometry = function(type) {
        if (type == '2d') {
            if (!_geom2d) {
                _geom2d = new PlaneGeometry(1, 1);
                _geom2d.applyMatrix(new Matrix4().makeTranslation(0.5, -0.5, 0));
            }
            return _geom2d;
        } else {
            if (!_geom3d) {
                _geom3d = World.PLANE;
            }

            return _geom3d;
        }
    }
});