Class(function UILBase() {
    Inherit(this, Component);
    const _this = this;
    var _uil, _context;

    function initUIL() {
        if (!Global.UIL) {
            _uil = new UIL.Gui({css:'top: 0; right: 50px;', size: 300, center: true});
            Stage.add(_uil);
            Global.UIL = _uil;
        } else {
            _uil = Global.UIL;
        }

        if (_this.flag('invert')) {
            invert();
        }

        addListeners();
    }

    function invert() {
        _uil.inner.style.filter = 'invert(1)';
        Global.UIL.invert = true;

        if (window.CSS) {
            let css = CSS._read();
            css += `.noInvert {filter: invert(1);}`;
            CSS._write(css);
        }
    }

    Hydra.ready(() => {
        if (Hydra.LOCAL && !Device.mobile && (location.search.includes('uil') || Device.detect('hydra'))) {
            Global.UIL_ACTIVE = true;
            new AssetLoader(['assets/js/app/modules/uil/_uil.min.js']);
            AssetLoader.waitForLib('UIL', initUIL);
        }
    });

    //*** Event handlers
    function addListeners() {
        window.addEventListener('contextmenu', openContext);
        Stage.bind('click', closeContext);
    }

    function openContext() {
        if (_context) _context.destroy();
        _context = new UILContextMenu();
    }

    function closeContext() {
        if (_context) _context = _context.destroy();
    }

    //*** Public methods
    this.invert = async function() {
        _this.flag('invert', true);
        await defer();
        if (_uil) {
            invert();
        }
    }

    this.createButton = function(name, callback) {
        Global.UIL && Global.UIL.add('button', {name, callback});
    }
}, 'static');