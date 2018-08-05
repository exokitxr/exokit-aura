Class(function LightUIL() {
    Inherit(this, Component);
    const _this = this;

    this.exists = {};

    //*** Public methods
    this.add = function(light, group) {
        return new LightUILGroup(light, group || Global.UIL);
    }
}, 'static');