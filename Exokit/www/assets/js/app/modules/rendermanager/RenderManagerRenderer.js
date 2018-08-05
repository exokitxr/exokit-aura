Class(function RenderManagerRenderer(_renderer, _nuke) {
    Inherit(this, Component);
    const _this = this;

    //*** Event handlers

    //*** Public methods
    this.render = function(scene, camera) {
        _nuke.camera = camera;

        if (_nuke) {
            _nuke.render();
        } else {
            _renderer.render(scene, camera);
        }

        _this.onRenderEye && _this.onRenderEye(Stage, camera);
    };

    this.setSize = function(width, height) {
        _renderer.setSize(width, height);
    };
});