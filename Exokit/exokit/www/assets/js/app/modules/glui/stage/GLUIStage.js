Class(function GLUIStage() {
    Inherit(this, Component);
    const _this = this;

    var _scene = new Scene();
    var _camera = new OrthographicCamera(1, 1, 1, 1, 0.1, 1);

    this.interaction = new GLUIStageInteraction2D(_camera);
    this.alpha = 1;

    //*** Constructor
    (function () {
        _scene.disableAutoSort = true;
        _camera.position.z = 1;
        addListeners();
        resizeHandler();
    })();

    function loop() {
        if (!_scene.children.length) return;
        let clear = World.RENDERER.autoClear;
        World.RENDERER.autoClear = false;
        World.RENDERER.render(_scene, _camera);
        World.RENDERER.autoClear = clear;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(Events.RESIZE, resizeHandler);
    }

    function resizeHandler() {
        _camera.left = Stage.width / -2;
        _camera.right = Stage.width / 2;
        _camera.top = Stage.height / 2;
        _camera.bottom = Stage.height / -2;
        _camera.near = 0.01;
        _camera.far = 1000;
        _camera.updateProjectionMatrix();
        _camera.position.x = Stage.width/2;
        _camera.position.y = -Stage.height/2;
    }

    //*** Public methods
    this.add = function($obj) {
        $obj.parent = _this;
        _scene.add($obj.group || $obj.mesh);
    }

    this.remove = function($obj) {
        $obj.parent = null;
        _scene.remove($obj.group);
    }

    this.render = loop;
});