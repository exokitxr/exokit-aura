Class(function MeshUILGroup(_mesh, _uil) {
    Inherit(this, Component);
    const _this = this;

    if (!_mesh.prefix) throw 'mesh.prefix required when using MeshUIL';

    var prefix = 'MESH_'+_mesh.prefix;
    var _group = _uil && !MeshUIL.exists[prefix] ? _uil.add('group', {name: prefix}) : null;

    this.group = _group;

    //*** Constructor
    (function () {
        MeshUIL.exists[prefix] = true;
        initVec('position');
        initVec('scale');
        initRotation();
    })();

    function initVec(key) {
        if (_group) {
            let val = new UILItem(key, _mesh[key].toArray(), {prefix}, val => {
                _mesh[key].fromArray(val);
                if (key == 'position' && _mesh.physics) _mesh.physics.updatePosition();
            });
            _group.add('number', val.obj);
        }

        _mesh[key].fromArray(UILStorage.get(`${prefix}${key}`) || _mesh[key].toArray());
    }

    function initRotation() {
        let key = 'rotation';
        let toRadians = array => {
            if (!array) return [0, 0, 0];
            array.length = 3;
            return array.map(x => Math.radians(x));
        };

        let toDegrees = array => {
            if (!array) return [0, 0, 0];
            array.length = 3;
            return array.map(x => Math.degrees(x));
        };

        if (_group) {
            let val = new UILItem(key, toDegrees(_mesh[key].toArray()), {prefix}, val => {
                _mesh[key].fromArray(toRadians(val));
                if (_mesh.physics) _mesh.physics.updateRotation();
            });
            _group.add('number', val.obj);
        }

        _mesh[key].fromArray(toRadians(UILStorage.get(`${prefix}${key}`)));
        if (_mesh.physics) _mesh.physics.updateRotation();
    }

    //*** Event handlers

    //*** Public methods
    this.initVec = initVec;
});