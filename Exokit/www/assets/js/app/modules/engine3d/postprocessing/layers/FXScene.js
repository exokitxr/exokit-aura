/**
 * @name FXScene
 * @param {Nuke} parentNuke
 * @param {String} type
 */

Class(function FXScene(_parentNuke, _type) {
    Inherit(this, Component);
    var _this = this;
    var _nuke, _rt;

    var _scene = new Scene();
    var _id = Utils.timestamp();
    var _objects = [];

    this.resolution = 1;
    this.autoVisible = true;
    this.enabled = true;
    this.scene = _scene;
    this.renderShadows = false;

    function initRT(rt) {
        _rt = rt || Utils3D.createRT(_nuke.stage.width * _this.resolution * _nuke.dpr, _nuke.stage.height * _this.resolution * _nuke.dpr, _this.rtType);
        _this.rt = _rt;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _rt.setSize && _rt.setSize(_nuke.stage.width * _this.resolution * _nuke.dpr, _nuke.stage.height * _this.resolution * _nuke.dpr);
    }

    //*** Public methods

    /**
     * @name create()
     * @memberof FXScene
     *
     * @function
     * @param {Nuke} nuke
     * @param {String} type
     * @param {RenderTarget} rt
     */
    this.create = function(nuke = World.NUKE, type, rt) {
        let format;
        if (type && typeof type === 'object') {
            format = type.format;
            type = type.type;
        }

        if (!!type) _this.rtType = type;
        if (!!format) _this.rtFormat = format;

        _this = this;
        _this.scene = _scene;
        _this.nuke = _nuke = _this.initClass(Nuke, nuke.stage, {renderer: nuke.renderer, camera: nuke.camera, scene: _scene, dpr: nuke.dpr});
        initRT(rt);
        if (rt) _this.flag('recycle_rt', true);
        else addListeners();
    }

    this.onDestroy = function() {
        if (!_this.flag('recycle_rt')) _rt.dispose();
    }

    /**
     * @name setSize()
     * @memberof FXScene
     *
     * @function
     * @param {Number} width
     * @param {Number} height
     */
    this.setSize = function(width, height) {
        if (!_nuke) return;
        if (_rt.width == width && _rt.height == height) return;
        _this.events.unsub(Events.RESIZE, resizeHandler);
        _rt && _rt.setSize(width * _this.resolution * _nuke.dpr, height * _this.resolution * _nuke.dpr);
        _nuke.setSize(width * _this.resolution * _nuke.dpr, height * _this.resolution * _nuke.dpr);
    }

    /**
     * @name addObject()
     * @name add()
     * @memberof FXScene
     *
     * @function
     * @param {Base3D} object
     */
    this.add = this.addObject = function(object) {
        let clone = object.clone();
        object['clone_' + _id] = clone;
        _scene.add(clone);
        _objects.push(object);
        while (clone.children.length) clone.remove(clone.children[0]);
        return clone;
    }

    /**
     * @name removeObject()
     * @memberof FXScene
     *
     * @function
     * @param {Base3D} object
     */
    this.removeObject = function(object) {
        _scene.remove(object['clone_' + _id]);
        _objects.remove(object);
        delete object['clone_' + _id];
    }

    /**
     * @name render()
     * @name draw()
     * @memberof FXScene
     *
     * @function
     * @param {Object} stage
     * @param {CameraBase3D} camera
     */
    this.render = this.draw = function(stage, camera) {
        if (stage) {
            _this.events.unsub(Events.RESIZE, resizeHandler);
            _this.nuke.setSize(stage.width, stage.height);
            _this.nuke.stage = stage;
        }

        if (camera) _this.nuke.camera = camera;

        let clearColor = null;
        let alpha = 1;
        if (_this.clearColor) {
            clearColor = _nuke.renderer.getClearColor().getHex();
            _nuke.renderer.setClearColor(_this.clearColor);
        }

        if (_this.clearAlpha > -1) {
            alpha = _nuke.renderer.getClearAlpha();
            _nuke.renderer.setClearAlpha(_this.clearAlpha);
        }

        if (!_this.renderShadows) _nuke.renderer.overridePreventShadows = true;

        for (let i = _objects.length-1; i > -1; i--) {
            let obj = _objects[i];
            let clone = obj['clone_' + _id];

            if (_this.forceVisible) clone.visible = true;
            else clone.visible = obj.determineVisible();

            if (clone.visible) {
                obj.updateMatrixWorld();
                if (!obj.ignoreMatrix) {
                    Utils3D.decompose(obj, clone);
                    if (clone.overrideScale) clone.scale.setScalar(clone.overrideScale);
                }
            }
        }

        if (!_this.preventRTDraw) {
            _nuke.rtt = _rt;
            _nuke.render();
        }

        _nuke.renderer.overridePreventShadows = false;

        if (_this.clearColor) {
            _nuke.renderer.setClearColor(clearColor);
        }

        if (_this.clearAlpha > -1) {
            _nuke.renderer.setClearAlpha(_this.clearAlpha);
        }
    }

    /**
     * @name setDPR()
     * @memberof FXScene
     *
     * @function
     * @param {Number} dpr
     */
    this.setDPR = function(dpr) {
        if (!_nuke) return _this;
        _nuke.dpr = dpr;
        resizeHandler();
        return _this;
    }

    /**
     * @name addPass()
     * @memberof FXScene
     *
     * @function
     * @param {NukePass} pass
     */
    this.addPass = function(pass) {
        if (!_nuke) return;
        _nuke.add(pass);
    }

    /**
     * @name removePass()
     * @memberof FXScene
     *
     * @function
     * @param {NukePass} pass
     */
    this.removePass = function(pass) {
        if (!_nuke) return;
        _nuke.remove(pass);
    }

    /**
     * @name setResolution()
     * @memberof FXScene
     *
     * @function
     * @param {Number} res
     */
    this.setResolution = function(res) {
        _this.resolution = res;
        resizeHandler();
        return this;
    }

    this.useRT = function(rt) {
        _rt = _this.rt = rt;
    }

    /**
     * @name useCamera()
     * @memberof FXScene
     *
     * @function
     * @param {PerspectiveCamera} camera
     */
    this.useCamera = function(camera) {
        _this.nuke.camera = camera.camera || camera;
    }

    /**
     * @name useScene()
     * @memberof FXScene
     *
     * @function
     * @param {Scene} scene
     */
    this.useScene = function(scene) {
        _this.nuke.scene = scene;
    }

    if (_parentNuke instanceof Nuke) this.create(_parentNuke, _type);
});