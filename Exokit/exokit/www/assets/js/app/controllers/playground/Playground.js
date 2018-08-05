Class(function Playground() {
    Inherit(this, Component);
    const _this = this;
    let _view;

    //*** Constructor
    (async function () {
        await UILStorage.ready();
        Global.PLAYGROUND = Utils.query('p');
        initThree();
        initView();

        // Trigger global resize
        defer(window.onresize);
    })();

    function initThree() {
        World.instance();
        Stage.add(World.ELEMENT);
    }

    function initView() {
        let request = Global.PLAYGROUND.split('/')[0];
        let view = window['Playground' + request] || window[request] || null;
        if (!view) throw `No Playground class ${request} found.`;

        _view = !!view.instance ? view.instance() : _this.initClass(view);
        if (_view.element) Stage.add(_view.element);
        World.SCENE.add(_view.group || _view.mesh || _view.object3D || new Group());

        Dev.expose('view', _view);
    }

    //*** Event handlers

    //*** Public methods

}, 'singleton');
