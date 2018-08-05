Class(function RenderManager() {
    Inherit(this, Component);
    const _this = this;
    const _evt = {stage: null, camera: null};

    var _dpr = null;

    this.NORMAL = 'normal';
    this.WEBVR = 'webvr';
    this.WEBAR = 'webar';
    this.ARKIT = 'ARKit';
    this.ARCORE = 'ARCore';
    this.AR = 'AR';
    this.DAYDREAM = 'daydream';
    this.GEARVR = 'gearVR';
    this.MAGIC_WINDOW = 'magicwindow';

    this.RENDER = 'RenderManager_render';
    this.POST_RENDER = 'RenderManager_post_render';
    this.READY = 'render_gl_ready';

    //*** Constructor
    (function() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    })();

    //*** Event handlers
    function onRenderEye(stage, camera) {
        _evt.stage = stage;
        _evt.camera = camera;
        _this.events.fire(_this.RENDER, _evt);
    }

    function resizeHandler() {
        _this.renderer && _this.renderer.setSize(Stage.width, Stage.height);
    }

    //*** Public methods
    this.set('DPR', v => {
        _dpr = v;
        if (_this.renderer) _this.renderer.setSize(Stage.width, Stage.height);
    });

    this.get('DPR', v => {
        return _dpr;
    });

    this.initialize = async function(type, params = {}) {
        if (_this.camera) _this.camera.destroy();
        if (_this.renderer) _this.renderer.destroy();

        if (type == _this.AR) {
            if (!Device.mobile.native) type - _this.WEBAR;
            if (Device.system.os == 'ios') type = _this.ARKIT;
            else type = _this.ARCORE;
        }

        if (type == _this.ARKIT) {
            if (!window.ARKit) throw 'RenderManager.ARKIT requires ARKit module';
            ARKit.init();
        }

        if (type == _this.ARCORE) {
            if (!window.ARCore) throw 'RenderManager.ARCORE requires ARCore module';
            ARCore.init();
        }

        if (type == _this.WEBVR) {
            try {
                let session = await XRDeviceManager.getVRSession();
                params.compatibleXRDevice = session.device;
            } catch(e) {
                throw e;
                return;
            }
        }

        if (type == _this.WEBAR) {
            try {
                let canvas = document.createElement('canvas');
                let context = canvas.getContext('xrpresent');
                let session = await XRDeviceManager.getARSession(context);
                canvas.width = Stage.width;
                canvas.height = Stage.height;
                Stage.add(canvas);
                params.compatibleXRDevice = session.device;
            } catch(e) {
                throw e;
                return;
            }
        }

        if (!_this.gl) {
            let camera = window.THREE ? new THREE.PerspectiveCamera(45, Stage.width / Stage.height, 0.01, 200) : new PerspectiveCamera(45, Stage.width / Stage.height, 0.01, 200);

            _this.gl = (function() {
                if (window.ARKit && window.ARKit.renderer) return ARKit.renderer;
                if (window.ARCore && window.ARCore.renderer) return ARCore.renderer;

                if (window._canvas) params.canvas = window._canvas;

                if (!Device.graphics.webgl) return {render: _ => {}, setPixelRatio: _ => {}, setSize: _ => {}, readRenderTargetPixels: _ => {}};

                let renderer = window.THREE ? new THREE.WebGLRenderer(params) : new Renderer(params);
                renderer.setSize(Stage.width, Stage.height);
                renderer.setPixelRatio(Math.max(1.25, Math.max(World.DPR, Device.pixelRatio)));
                return renderer;
            })();

            _this.scene = (function() {
                if (window.ARKit && window.ARKit.scene) return ARKit.scene;
                if (window.ARCore && window.ARCore.scene) return ARCore.scene;
                return window.THREE ? new THREE.Scene() : new Scene();
            })();

            _this.nuke = _this.initClass(Nuke, Stage, Object.assign({renderer: _this.gl, scene: _this.scene, camera: camera, dpr: World.DPR}, params));
        }

        _dpr = _dpr || World.DPR || 1;
        switch (type) {
            case _this.WEBVR:
                _this.renderer = _this.initClass(VRRenderer, _this.gl, _this.nuke);
                _this.camera = _this.initClass(VRCamera);
                break;

            case _this.WEBAR:
                _this.renderer = _this.initClass(ARRenderer, _this.gl, _this.nuke);
                _this.camera = _this.initClass(ARCamera);
                break;

            case _this.MAGIC_WINDOW:
                _this.renderer = _this.initClass(MagicWindowRenderer, _this.gl, _this.nuke);
                _this.camera = _this.initClass(VRCamera);
                break;

            case _this.NORMAL:
                _this.renderer = _this.initClass(RenderManagerRenderer, _this.gl, _this.nuke);
                _this.camera = _this.initClass(RenderManagerCamera);
                break;

            case _this.ARKIT:
                _this.renderer = _this.initClass(RenderManagerRenderer, ARKit.renderer, _this.nuke);
                _this.camera = ARKit;
                break;

            case _this.ARCORE:
                _this.renderer = _this.initClass(RenderManagerRenderer, ARCore.renderer, _this.nuke);
                _this.camera = ARCore;
                break;

            case _this.DAYDREAM:
                _this.renderer = _this.initClass(DaydreamRenderer, _this.gl, _this.nuke);
                _this.camera = _this.initClass(DaydreamCamera);
                break;
        }

        _this.type = type;
        _this.nuke.camera = _this.camera.worldCamera;
        _this.renderer.onRenderEye = onRenderEye;
    }

    this.render = function(scene, camera, renderTarget, forceClear) {
        _this.renderer.render(scene || _this.scene, camera || _this.camera.worldCamera, renderTarget, forceClear);
        _this.events.fire(_this.POST_RENDER);
    }

    this.startRender = function() {
        Render.start(_this.render);
    }

    this.stopRender = function() {
        Render.stop(_this.render);
    }

    this.requestPresent = function(bool) {
        _this.renderer.requestPresent && _this.renderer.requestPresent(bool);
    }

    this.setSize = function(width, height) {
        _this.events.unsub(Events.RESIZE, resizeHandler);
        _this.renderer.setSize(width, height);
    }

    this.set('onRenderEye', callback => {
        _this.renderer.onRenderEye = callback;
    });
}, 'static');
