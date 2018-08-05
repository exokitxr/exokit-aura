Class(function TimelineUIL() {
    Inherit(this, Component);
    const _this = this;
    var _editor;

    var _created = {};

    //*** Constructor
    (function () {

    })();

    //*** Event handlers
    function removeEditor() {
        _editor = _editor.destroy();
    }

    //*** Public methods
    this.create = function(name, version) {
        let config = new TimelineUILConfig(name, version, Global.UIL && !_created[name]);

        if (Global.UIL) {
            if (!_created[name]) {
                _created[name] = config;
                config.appendUILGroup();
            }
        }

        return config;
    }

    this.openEditor = function(name, callbacks) {
        if (_editor) _editor.destroy();
        _editor = new TimelineUILEditor(name, callbacks);
        _this.events.sub(_editor, Events.COMPLETE, removeEditor);
    }
}, 'static');