Class(function TimelineUILConfig(_name, _version = 1, _store) {
    Inherit(this, Component);
    const _this = this;
    var _callbacks;

    var _config = UILStorage.get('TIMELINE_'+_name+'_config');

    //*** Constructor
    (function () {
        if (_store) _callbacks = [];
        if (_config) {
            if (_config.version != _version) {
                updateConfig();
                UILStorage.clearMatch('TIMELINE_'+_name);
            }
        } else {
            _config = {};
            updateConfig();
        }
    })();

    function updateConfig() {
        _config.version = _version;
        UILStorage.setWrite('TIMELINE_'+_name+'_config', _config);
    }

    function edit() {
        TimelineUIL.openEditor(_name, _callbacks);
    }

    function replay() {
        _callbacks.forEach(obj => {
            _this.delayedCall(obj.callback, UILStorage.get('TIMELINE_'+_name+'_'+obj.name) || obj.time);
        });
    }

    //*** Event handlers

    //*** Public methods
    this.add = function(callback, time, name) {
        if (!name) name = callback.toString().match(/function ([^\(]+)/)[1];
        time = UILStorage.get('TIMELINE_'+_name+'_'+name) || time;
        _this.delayedCall(callback, time);

        if (_store) _callbacks.push({name, time, callback});
    }

    this.appendUILGroup = function() {
        let group = Global.UIL.add('group', {name: 'TIMELINE_'+_name});
        group.add('button', {name: 'Edit', callback: edit});
        group.add('button', {name: 'Replay', callback: replay});
    }
});