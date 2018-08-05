Class(function GLUIStageInteraction3D() {
    Inherit(this, Component);
    const _this = this;

    //*** Event handlers
    function onHover(e) {
        e.mesh.glui._onOver({action: e.action, object: e.mesh.glui});
    }

    function onClick(e) {
        e.mesh.glui._onClick({action: e.action, object: e.mesh.glui});
    }

    //*** Public methods
    this.add = function(obj, camera = World.CAMERA) {
        Interaction3D.find(camera).add(obj.mesh || obj, onHover, onClick);
    }

    this.remove = function(group, camera = World.CAMERA) {
        Interaction3D.find(camera).remove(obj.mesh || obj);
    }
});