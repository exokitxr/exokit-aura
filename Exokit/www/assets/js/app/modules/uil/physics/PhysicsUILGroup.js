Class(function PhysicsUILGroup(_physics, _uil) {
    Inherit(this, Component);
    const _this = this;

    var prefix = 'PHYSICS_'+_physics.name;
    if (!_physics.name) throw 'PhysicsUIL requires a name property';

    var _group = Global.UIL && !PhysicsUIL.exists[prefix] ? Global.UIL.add('group', {name: prefix}) : null;

    //*** Constructor
    (function () {
        if (!_group && Global.UIL) addListeners();
        PhysicsUIL.exists[prefix] = true;
        initNumber('friction');
        initNumber('density');
        initNumber('restitution');
        // initToggle('move');
    })();

    function initNumber(key) {
        if (_group) {
            let val = new UILItem(key, _physics[key], {prefix}, val => {
                _physics[key] = val;
                _this.events.fire(PhysicsUIL.UPDATE, {prefix, key, val});
            });
            _group.add('number', val.obj);
        }

        let defined = UILStorage.get(`${prefix}${key}`);
        if (defined) _physics[key] = defined;
    }

    function initToggle(key) {
        if (_group) {
            let val = new UILItem(key, _physics[key], {prefix}, val => {
                _physics[key] = val;
            });
            _group.add('bool', val.obj);
        }

        let defined = UILStorage.get(`${prefix}${key}`);
        if (defined) _physics[key] = defined;
    }

    //*** Event handlers
    function addListeners() {
        _this.events.sub(PhysicsUIL.UPDATE, updateFromUIL);
    }

    function updateFromUIL(e) {
        if (e.prefix == prefix) _physics[e.key] = e.val;
    }

    //*** Public methods

});