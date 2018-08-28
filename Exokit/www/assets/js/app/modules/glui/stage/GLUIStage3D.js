Class(function GLUIStage3D() {
    Inherit(this, Object3D);
    const _this = this;

    var _scene = new Scene();
    var _list = new LinkedList();

    this.alpha = 1;

    this.interaction = new GLUIStageInteraction3D();

    (function() {
    })();

    function loop() {
        if (!_list.length) return;

        let obj = _list.start();
        while (obj) {
            Utils3D.decompose(obj.anchor, obj.group);
            obj = _list.next();
        }

        let clear = World.RENDERER.autoClear;
        Renderer.context.clear(Renderer.context.DEPTH_BUFFER_BIT);
        World.RENDERER.autoClear = false;
        World.RENDERER.render(_scene, World.CAMERA);
        World.RENDERER.autoClear = clear;
    }

    //*** Public methods
    this.add = function(obj) {
        obj.parent = _this;
        if (!obj._3d) obj.enable3D();
        obj.deferRender();
    }

    this.addDeferred = function(obj) {
        _list.push(obj);
        _scene.add(obj.group || obj.mesh);
    }

    this.remove = function(obj) {
        this.interaction.remove(obj.group);
        _scene.remove(obj.group || obj.mesh);
        _list.remove(obj);
    }

    this.render = loop;

});