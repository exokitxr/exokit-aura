Class(function TweenUILEditor(_name, _tweens) {
    Inherit(this, Component);
    const _this = this;

    var _gui = new UIL.Gui({width: 600, css: 'top:0px; left:0px;'});

    this.gui = _gui;

    //*** Constructor
    (function () {
        for (let tween of _tweens) createGroup(tween);
        _gui.add('button', {name: 'Exit', callback: exit});
        if (Global.UIL.invert) _gui.inner.style.filter = 'invert(1)';
    })();

    function createGroup(tween) {
        let obj = TweenUIL.get('TWEEN_'+_name+'_'+tween._id);

        let group = _gui.add('group', {name: tween._id});

        for (let key in obj) {
            createString(obj, key, group, 'TWEEN_'+_name+'_'+tween._id);
        }

        group.open();
    }

    function createString(obj, key, group, lookup) {
        let value = obj[key];
        let height = key == 'props' ? 100 : 20;

        if (key == 'props') {
            value = JSON.stringify(value, null, '\t');
        }

        group.add('string', {name: key, value: value.toString(), fontColor:'#D4B87B', height}).onChange( val => {
            if (key == 'props') val = JSON.parse(val);
            if (key == 'time' || key == 'delay') val = Number(val);
            write(lookup, key, val);
        });
    }

    function write(lookup, key, value) {
        let obj = UILStorage.get(lookup) || {};
        obj[key] = value;
        UILStorage.setWrite(lookup, obj);
    }

    function exit() {
        _this.events.fire(Events.COMPLETE);
    }

    //*** Event handlers

    //*** Public methods
    this.onDestroy = function() {
        __body.div.removeChild(_gui.content);
        _gui.remove();
    }
});