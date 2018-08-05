Class(function MeshUIL() {
    Inherit(this, Component);
    const _this = this;

    this.exists = {};

    //*** Public methods
    this.add = function(mesh, group) {
        return new MeshUILGroup(mesh, group || Global.UIL);
    }
}, 'static');