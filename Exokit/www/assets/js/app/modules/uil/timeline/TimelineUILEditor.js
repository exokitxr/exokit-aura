Class(function TimelineUILEditor(_name, _callbacks) {
    Inherit(this, Component);
    const _this = this;

    var _gui = new UIL.Gui({width: 300, css: 'top:0px; left:0px;'});

    //*** Constructor
    (function () {
        for (let cb of _callbacks) create(cb);
        _gui.add('button', {name: 'Exit', callback: exit});
        if (Global.UIL.invert) _gui.inner.style.filter = 'invert(1)';
    })();

    function exit() {
        _this.events.fire(Events.COMPLETE);
    }

    function create({name, time}) {
        _gui.add('string', {name, value: time.toString(), fontColor:'#D4B87B', height: 20}).onChange( val => {
            UILStorage.setWrite('TIMELINE_'+_name+'_'+name, Number(val));
        });
    }

    //*** Event handlers

    //*** Public methods
    this.onDestroy = function() {
        __body.div.removeChild(_gui.content);
        _gui.remove();
    }
});