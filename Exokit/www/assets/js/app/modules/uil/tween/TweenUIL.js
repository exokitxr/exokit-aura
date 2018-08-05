Class(function TweenUIL() {
    Inherit(this, Component);
    const _this = this;
    var _editor;

    var _data = {};
    var _created = {};

    //*** Event handlers
    function removeEditor() {
        _editor = _editor.destroy();
    }

    //*** Public methods
    this.create = function(name, version = 1, group) {
        if (typeof version != 'number') {
            group = version;
            version = 1;
        }

        let config = new TweenUILConfig(name, version, Global.UIL && !_created[name]);

        if (Global.UIL) {
            if (!_created[name]) {
                _created[name] = config;
                config.appendUILGroup(group || Global.UIL);
            }
        }

        return config;
    }

    this.openEditor = function(name, tweens) {
        if (_editor) _editor.destroy();
        _editor = new TweenUILEditor(name, tweens);
        _this.events.sub(_editor, Events.COMPLETE, removeEditor);
    }

    this.set = function(key, value) {
        _data[key] = value;
    }

    this.get = function(key) {
        return _data[key];
    }
}, 'static');