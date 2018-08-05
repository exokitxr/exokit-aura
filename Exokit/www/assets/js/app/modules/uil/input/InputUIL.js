Class(function InputUIL() {

    //*** Public methods
    this.create = function(name, group) {
        return new InputUILConfig(name, group === null ? null : group || Global.UIL);
    }
}, 'static');