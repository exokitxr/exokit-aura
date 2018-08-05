Class(function UILContextMenu() {
    Inherit(this, Component);
    const _this = this;

    var _playground = Utils.query('p') || '';
    var _query = location.search.includes('p=') ? location.search.split('p='+Global.PLAYGROUND)[1] : '';//location.search.split('&')[1] || '';
    if (_query.charAt(0) == '&') _query = _query.slice(1);
    var _gui = new UIL.Gui({width: 300, css: `top:${Mouse.y}px; left:${Mouse.x}px;`});

    //*** Constructor
    (function () {
        if (Global.UIL.invert) _gui.inner.style.filter = 'invert(1)';
        _gui.add('string', {name: 'Playground', value: _playground}).onChange(changePlayground);
        _gui.add('string', {name: 'Query', value: _query}).onChange(changeQuery);
        _gui.add('button', {name: 'Back to Hydra Root', callback: reset});

        _gui.content.removeChild(_gui.content.children[_gui.content.children.length-1]);
    })();

    //*** Event handlers
    function changePlayground(val) {
        _playground = val;
        load();
    }

    function changeQuery(query) {
        _query = query;
        load();
    }

    function load() {
        let loc = window.location.href.split('?')[0].split('#')[0];
        if (_playground.length) {
            loc += `?p=${_playground}`;
            if (_query.length) loc += '&' + _query;
        } else if (_query.length) {
            loc += '?' + _query;
        }

        window.location = loc;
    }

    function reset() {
        window.location = 'http://localhost:'+window.location.port;
    }

    //*** Public methods
    this.onDestroy = function() {
        __body.div.removeChild(_gui.content);
        _gui.remove();
    }
});