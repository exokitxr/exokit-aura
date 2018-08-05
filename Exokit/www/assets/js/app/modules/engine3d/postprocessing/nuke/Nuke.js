/**
 * @name Nuke
 * @param {Object} stage
 * @param {Object} params
 */

Class(function Nuke(_stage, _params) {
    Inherit(this, Component);
    var _this = this;
    var _width, _height;

    if (!_params.renderer) console.error('Nuke :: Must define renderer');

    _this.stage = _stage;
    _this.renderer = _params.renderer;
    _this.camera = _params.camera;
    _this.scene = _params.scene;
    _this.rtt = _params.rtt; // optional, if available, renders finally to this and not canvas
    _this.enabled = _params.enabled == false ? false : true;
    _this.passes = _params.passes || [];
    _this.useDrawBuffers = (_ => {
        if (typeof _params.useDrawBuffers !== 'undefined') return _params.useDrawBuffers;
        if (Renderer.type == Renderer.WEBGL2) return true;
        if (Utils.query('noDrawBuffers') || Nuke.NO_DRAWBUFFERS) return false;
        return Device.graphics.webgl && Device.graphics.webgl.detect('draw_buffers');
    })();

    var _dpr = _params.dpr || 1;
    var _rts = {};
    var _rtStack = [];
    var _rttPing, _rttPong, _nukeScene, _nukeMesh, _rttCamera, _rttBuffer;
    var _drawBuffers = [];

    //*** Constructor
    (function () {
        initNuke();
        addListeners();
    })();

    function initNuke() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;
        _rttPing = Nuke.getRT(width, height, false);
        _rttPong = Nuke.getRT(width, height, false);
        _rttBuffer = Nuke.getRT(width, height, _this.useDrawBuffers);

        _rttCamera = new OrthographicCamera( _this.stage.width / - 2, _this.stage.width / 2, _this.stage.height / 2, _this.stage.height / - 2, 1, 1000 );

        _nukeScene = new Scene();
        _nukeMesh = new Mesh(World.QUAD, null);
        _nukeScene.add(_nukeMesh);

        _width = width;
        _height = height;
    }

    function finalRender(scene, camera) {
        _this.renderer.render(scene, camera || _this.camera, _this.rtt);
        _this.postRender && _this.postRender();
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;

        _rttPing.setSize(width, height);
        _rttPong.setSize(width, height);
        _rttBuffer.setSize(width, height);

        _rttCamera.left = _this.stage.width / - 2;
        _rttCamera.right = _this.stage.width / 2;
        _rttCamera.top = _this.stage.height / 2;
        _rttCamera.bottom = _this.stage.height / - 2;
        _rttCamera.updateProjectionMatrix();
    }

    //*** Public methods
    /**
     * @name add()
     * @memberof Nuke
     *
     * @function
     * @param {NukePass} pass
     */
    _this.add = function(pass, index) {
        if (typeof index == 'number') {
            _this.passes.splice(index, 0, pass);
            return;
        }
        _this.passes.push(pass);
    };

    /**
     * @name remove()
     * @memberof Nuke
     *
     * @function
     * @param {NukePass} pass
     */
    _this.remove = function(pass) {
        if (typeof pass == 'number') {
            _this.passes.splice(pass);
        } else {
            _this.passes.remove(pass);
        }
    }

    _this.render = function() {
        if (!_this.enabled || !_this.passes.length) {
            finalRender(_this.scene);
            return;
        }

        _this.hasRendered = true;

        _this.renderer.render(_this.scene, _this.camera, _rttBuffer, true);

        let usedBuffer = false;
        let pingPong = true;
        let count = _this.passes.length - 1;
        for (var i = 0; i < count; i++) {
            _nukeMesh.shader = _this.passes[i].pass;
            _nukeMesh.shader.depthTest = false;
            _nukeMesh.shader.frustumCulled = false;

            usedBuffer = true;

            _nukeMesh.shader.uniforms.tDiffuse.value = i == 0 ? _rttBuffer.texture : (pingPong ? _rttPing.texture : _rttPong.texture);
            _this.renderer.render(_nukeScene, _rttCamera, pingPong ? _rttPong : _rttPing);

            pingPong = !pingPong;
        }

        _nukeMesh.shader = _this.passes[_this.passes.length - 1].pass;
        _nukeMesh.shader.uniforms.tDiffuse.value = !usedBuffer ? _rttBuffer.texture : (pingPong ? _rttPing.texture : _rttPong.texture);
        finalRender(_nukeScene, _rttCamera);
    }

    _this.setSize = function(width, height) {
        if (width == _width && height == _height) return;

        _width = width;
        _height = height;

        _rttPing.setSize(width, height);
        _rttPong.setSize(width, height);
        _rttBuffer.setSize(width, height);
    }

    _this.attachDrawBuffer = function(texture) {
        if (_this.hasRendered) console.warn('Attempt to attach draw buffer after first render! Create FXLayer instance before first render.');
        _drawBuffers.push(texture);

        if (_rttBuffer && _rttBuffer.attachments) {
            _rttBuffer.attachments = [_rttBuffer.attachments[0]];
            for (let i = 0; i < _drawBuffers.length; i++) _rttBuffer.attachments.push(_drawBuffers[i]);
        }

        return _drawBuffers.length;
    }

    _this.set('dpr', function(v) {
        _dpr = v || Device.pixelRatio;
        resizeHandler();
    });

    _this.get('dpr', function() {
        return _dpr;
    });

    _this.get('output', function() {
        return _nukeMesh.shader && _nukeMesh.shader.uniforms ? _nukeMesh.shader.uniforms.tDiffuse.value : null;
    });

    _this.get('rttBuffer', function() {
        return _rttBuffer;
    });

    _this.get('prevFrameRT', function() {
        return _rttBuffer && _rttBuffer.texture ? _rttBuffer.texture : null;
    });

    _this.get('nukeScene', function() {
        return _nukeScene;
    });

    _this.get('ping', function() {
        return _rttPing;
    });

    _this.get('pong', function() {
        return _rttPong;
    });

}, function() {
    var _plane;
    var _rts = {};
    Nuke.getRT = function(width, height, multi) {
        if (!multi) {
            return Utils3D.createRT(width, height);
        } else {
            return Utils3D.createMultiRT(width, height);
        }
    }
});