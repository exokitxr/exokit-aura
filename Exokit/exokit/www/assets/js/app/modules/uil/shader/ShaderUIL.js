Class(function ShaderUIL() {
    Inherit(this, Component);
    var _this = this;
    var _active;

    var _groups = [];

    this.exists = {};
    this.UPDATE = 'update';

    //*** Public methods
    this.add = async function(shader, group) {
        let g = new ShaderUILGroup(shader.shader || shader, group || Global.UIL);
        _groups.push(g);
    }

    this.list = function() {
        _groups.forEach(group => group.console());
    }

    this.clear = function() {
        _groups.forEach(group => group.clear());
    }
}, 'static');