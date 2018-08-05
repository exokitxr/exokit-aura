Class(function World() {
    Inherit(this, Component);
    const _this = this;
    let _renderer, _scene, _camera, _nuke, _controls;

    World.DPR = Tests.getDPR();

    //*** Constructor
    (function () {
        initWorld();
        // initControls();
        addHandlers();
        Render.drawFrame = loop;
        if (RenderManager.type == RenderManager.NORMAL) Camera.instance(_camera);
    })();

    function initWorld() {
        World.PLANE = new PlaneGeometry(1, 1);
        World.QUAD = new PlaneGeometry(2, 2);
        World.BOX = new BoxGeometry(1, 1, 1);

        RenderManager.initialize(RenderManager.NORMAL, {powerPreference: 'high-performance'});
        _renderer = RenderManager.gl;
        _scene = RenderManager.scene;
        _camera = RenderManager.camera.worldCamera;
        _nuke = RenderManager.nuke;

        World.SCENE = _scene;
        World.RENDERER = _renderer;
        World.ELEMENT = $(_renderer.domElement);
        World.CAMERA = _camera;
        World.NUKE = _nuke;

        // _nuke.add(new FXAA());
    }

    function initControls() {
        if (!window.DebugControls) return;
        _controls = new DebugControls(_camera, World.ELEMENT.div);

        if (RenderManager.type == RenderManager.NORMAL) {
            _camera.position.set(0.0, 0.0, 6.0);
            _camera.target = new Vector3(0.0, 0.0, 0.0);
            _camera.lookAt(_camera.target);
            _controls.target = _camera.target;
        } else {
            _controls.enabled = false;
        }

        World.CONTROLS = _controls;
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.sub(Events.RESIZE, resize);
    }

    function resize() {
        _renderer.setSize(Stage.width, Stage.height);
        _camera.aspect = Stage.width / Stage.height;
        _camera.updateProjectionMatrix();
    }

    function loop(t, delta) {
        if (_controls && _controls.enabled) _controls.update();
        RenderManager.render();
    }

    //*** Public methods

}, function() {
    var _instance;

    World.instance = function() {
        if (!_instance) _instance = new World();
        return _instance;
    };

});