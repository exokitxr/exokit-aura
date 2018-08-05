Class(function TweenUILConfig(_name, _version = 1, _store) {
    const _this = this;
    var _tweens;

    var _config = UILStorage.get('TWEEN_'+_name+'_config');

    //*** Constructor
    (function () {
        if (_store) _tweens = [];
        if (_config) {
            if (_config.version != _version) {
                updateConfig();
                UILStorage.clearMatch('TWEEN_'+_name);
            }
        } else {
            _config = {};
            updateConfig();
        }
    })();

    function updateConfig() {
        _config.version = _version;
        UILStorage.setWrite('TWEEN_'+_name+'_config', _config);
    }

    function override(tween, object, props, time, ease, delay) {
        let key = 'TWEEN_'+_name+'_'+tween._id;
        let storage = UILStorage.get(key);

        let obj = {props, time, ease, delay};
        for (let key in storage) obj[key] = storage[key];

        TweenUIL.set(key, obj);

        return obj;
    }

    function edit() {
        TweenUIL.openEditor(_name, _tweens);
    }

    //*** Event handlers

    //*** Public methods
    this.add = function(tween, name) {
        tween._id = name;
        tween.overrideValues = override;
        _tweens && _tweens.push(tween);
        return tween;
    }

    this.appendUILGroup = function(uil) {
        let group = uil.add('group', {name: 'TWEEN_'+_name});
        group.add('button', {name: 'Edit', callback: edit});
    }
});