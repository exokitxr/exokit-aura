Class(function PhysicsUIL() {
    Inherit(this, Component);
    const _this = this;

    this.UPDATE = 'physics_uil_update';

    this.exists = {};

    //*** Public methods
    this.add = function(group) {
        return new PhysicsUILGroup(group, Global.UIL);
    }
}, 'static');