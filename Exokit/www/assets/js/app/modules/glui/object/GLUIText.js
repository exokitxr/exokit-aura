Class(function GLUIText(_text, _fontName, _fontSize, _options = {}) {
    const _this = this;
    const prototype = GLUIText.prototype;

    let options = {};
    options.font = _fontName;
    options.text = _text;
    options.width = _options.width;
    options.align = _options.align || 'left';
    options.size = _fontSize;
    options.lineHeight = _options.lineHeight;
    options.letterSpacing = _options.letterSpacing;
    options.wordSpacing = _options.wordSpacing;
    options.wordBreak = _options.wordBreak;
    options.color = new Color(_options.color);

    this.text = new GLText(options);

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

    this.text.ready().then(_ => {
        let mesh = _this.text.mesh;
        mesh.glui = _this;

        _this.mesh = mesh;

        _this.group.add(mesh);

        if (_this._3d && !_this._style2d) _this.text.centerY();
        if (!_this._3d) _this.text.mesh.shader.depthTest = false;

        mesh.onBeforeRender = _ => {
            if (!_this._3d && !_this.parent) return;

            _this.group.position.x = _this.x;
            _this.group.position.y = _this._3d ? _this.y : -_this.y;
            _this.group.position.z = _this.z;

            _this.group.scale.set(_this.scaleX * _this.scale, _this.scaleY * _this.scale, 1);

            if (mesh.shader.uniforms.uAlpha) mesh.shader.uniforms.uAlpha.value = getAlpha();

            if (!_this._3d) _this.group.rotation.z = Math.radians(_this.rotation);
            else {
                if (_this.anchor) {
                    _this.anchor.position.copy(_this.group.position);
                    _this.anchor.scale.copy(_this.group.scale);
                    _this.anchor.quaternion.setFromEuler(_this.rotation);
                } else {
                    _this.group.quaternion.setFromEuler(_this.rotation);
                }
            }
        };
    });

    function getAlpha() {
        let alpha = _this.alpha;
        let $parent = _this.parent;
        while ($parent) {
            alpha *= $parent.alpha;
            $parent = $parent.parent;
        }
        return alpha;
    }

    //*** Prototype
    if (typeof prototype.add !== 'undefined') return;
    prototype.interact = function(over, click) {
        this._onOver = over;
        this._onClick = click;
        let stage = this._3d ? GLUI.Scene : GLUI.Stage;

        const _this = this;
        _this.text.ready().then(_ => {
            if (over) {
                if (!_this.text.geometry.boundingBox) _this.text.geometry.computeBoundingBox();

                if (!_this.hitArea) {
                    let bb = _this.text.geometry.boundingBox;
                    let shader = Utils3D.getTestShader();
                    shader.visible = false;
                    _this.hitArea = new Mesh(World.PLANE, shader);
                    _this.hitArea.glui = _this;
                    _this.hitArea.scale.set(Math.abs(bb.min.x) + Math.abs(bb.max.x), Math.abs(bb.min.y) + Math.abs(bb.max.y), 1);
                    if (!_this._3d || _this._style2d) _this.hitArea.position.x = (bb.max.x - bb.min.x)/2;
                    _this.hitArea.position.y = (bb.min.y - bb.max.y)/2;
                    _this.text.mesh.add(_this.hitArea);
                }

                stage.interaction.add(_this.hitArea);
            } else {
                stage.interaction.remove(_this.hitArea);
            }
        });

        return this;
    }

    prototype.remove = function() {
        if (this.mesh && this.mesh.parent) {
            this.group.parent.remove(this.group);
        } else {
            if (!this._3d) GLUI.Stage.remove(this);
            else GLUI.Scene.remove(this);
        }

        this.text.destroy();
    }

    prototype.tween = function(obj, time, ease, delay) {
        return tween(this, obj, time, ease, delay);
    }

    prototype.enable3D = function(style2d) {
        this._3d = true;
        this._style2d = style2d;
        this.rotation = new Euler();

        const _this = this;
        _this.text.ready().then(_ => {
            _this.text.mesh.shader.depthTest = true;
        });

        return this;
    }

    prototype.depthTest = function(bool) {
        const _this = this;
        _this.text.ready().then(_ => {
            _this.text.mesh.shader.depthTest = bool;
        });

        return this;
    }

    prototype.setZ = function(z) {
        const _this = this;
        _this.text.ready().then(_ => {
            _this.text.mesh.renderOrder = z;
        });

        return this;
    }

    prototype.height = function() {
        if (!this.mesh) return 0;
        return this.text.height;
    }

    prototype.setText = function(text) {
        const _this = this;
        _this.text.ready().then(_ => _this.text.setText(text));
        return this;
    }

    prototype.setColor = function(color) {
        const _this = this;
        _this.text.ready().then(_ => _this.text.setColor(color));
        return this;
    }

    prototype.resize = function(options) {
        const _this = this;
        _this.text.ready().then(_ => _this.text.resize(options));
    }

    prototype.show = function() {
        this.text.group.visible = true;
        return this;
    }

    prototype.hide = function() {
        this.text.group.visible = false;
        return this;
    }

    prototype.loaded = function() {
        return this.text.ready();
    }

    prototype.length = function() {
        return this.text.charLength;
    }

    prototype.deferRender = function(parent) {
        this.deferred = true;
        if (!parent) {
            this.anchor = new Group();
            GLUI.Scene.addDeferred(this);
        }
    }

    prototype.useShader = async function(shader) {
        await this.text.ready();
        shader.uniforms.tMap = this.text.shader.uniforms.tMap;
        shader.uniforms.uAlpha = this.text.shader.uniforms.uAlpha;
        shader.uniforms.uColor = this.text.shader.uniforms.uColor;

        if (!_this._3d || !(!_this._3d && !_this.parent)) shader.depthTest = false;

        this.text.mesh.shader = shader;
    }
});