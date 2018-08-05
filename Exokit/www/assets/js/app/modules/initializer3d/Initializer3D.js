Class(function Initializer3D() {
    Inherit(this, Component);
    const _this = this;

    var _promises = [];

    this.READY = 'initializer_ready';

    async function resolve() {
        await Promise.all(_promises);
        _this.events.fire(_this.READY);
        _this.resolved = true;
    }

    async function workQueue() {
        await defer();
        _working = true;
        let promise = _queue.shift();
        if (!promise) return _working = false;
        promise.resolve(workQueue);
    }

    //*** Event handlers

    //*** Public methods
    this.promise = function(promise) {
        _promises.push(promise);
        clearTimeout(_this.timer);
        _this.timer = _this.delayedCall(resolve, 100);
        return promise;
    }

    this.ready = function() {
        return _this.wait(_this, 'resolved');
    }

    this.createWorld = async function() {
        await Promise.all([
            AssetLoader.waitForLib('zUtils3D'),
            Shaders.ready(),
            UILStorage.ready()
        ]);
        World.instance();
        await defer();
    }

    this.parseTextures = function(shader) {
        for (let key in shader.uniforms) {
            if (shader.uniforms[key] instanceof Texture) {
                if (!!shader.uniforms[key].promise) _this.promise(_shader.uniforms[key].promise);
            }
        }
    }

    this.queue = function() {
        let promise = Promise.create();
        _queue.push(promise);
        if (!_working) workQueue();
        return promise;
    }

}, 'static');