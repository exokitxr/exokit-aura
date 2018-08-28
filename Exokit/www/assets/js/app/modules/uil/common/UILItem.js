Class(function UILItem(_name, _value, _params = {}, _callback) {
    Inherit(this, Component);
    var _this = this;

    _params.prefix = _params.prefix ? _params.prefix.slice(0, 100) : '';
    _value = UILStorage.get( _params.prefix + _name) || _value;

    if (typeof _params === 'function') {
        _callback = _params;
        _params = null;
    }

    //*** Constructor
    (async function () {
        _callback && _callback(_value);
        initUIL();
    })();

    function initUIL() {
        _this.obj = {
            name: _name,
            type: 'html',
            value: _value,
            callback: callback
        };

        if (_params) {
            for (var key in _params) {
                _this.obj[key] = _params[key];
            }
        }
    }

    function callback(v) {
        _value = v;
        if (Array.isArray(v) && v.length == 1 && v[0] == 0) v = 0;
        UILStorage.set( _params.prefix + _name, v);
        _callback && _callback(v);
    }

    //*** Event handlers

    //*** Public methods
    this.clear = function() {
        UILStorage.set( _params.prefix + _name, null);
    }

    this.get('value', function() {
        return _value;
    });
});