Class(function GLUI() {
    Inherit(this, Component);
    const _this = this;

    function loop() {
        if (_this.Scene) _this.Scene.render();
        if (_this.Stage) _this.Stage.render();
    }

    //*** Event handlers

    //*** Public methods
    window.$gl = function(width, height, map) {
        return new GLUIObject(width, height, map);
    }

    window.$glText = function(text, fontName, fontSize, options) {
        return new GLUIText(text, fontName, fontSize, options);
    }

    this.init = async function(is2D, is3D) {
        if (is2D === undefined) {
            is2D = true;
            is3D = true;
        }

        await AssetLoader.waitForLib('zUtils3D');
        _this.initialized = true;
        if (is2D) _this.Stage = new GLUIStage();
        if (is3D) {
            _this.Scene = new GLUIStage3D();
            _this.Scene.interaction.input = Mouse;
        }

        _this.wait(World, 'NUKE', _ => World.NUKE.postRender = loop);
    }

    this.ready = function() {
        return _this.wait(_this, 'initialized');
    }
}, 'static');