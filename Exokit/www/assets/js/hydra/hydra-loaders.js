/**
 * @name Assets
 */

Class(function Assets() {
    const _this = this;
    const _fetchCors = {mode: 'cors'};

    this.__loaded = [];

    /**
     * Flip bitmap images when decoding.
     * @name Assets.FLIPY
     * @memberof Assets
     * @example
     * Assets.FLIPY = false // do not flip when decoding
     */
    this.FLIPY = true;

    /**
     * Path for Content Distribution Network (eg. Amazon bucket)
     * @name Assets.CDN
     * @memberof Assets
     * @example
     * Assets.CDN = '//amazonbucket.com/project/';
     */
    this.CDN = '';

    /**
     * Cross Origin string to apply to images
     * @name Assets.CORS
     * @memberof Assets
     * @example
     * Assets.CORS = '';
     */
    this.CORS = null;

    /**
     * Storage for all images loaded for easy access
     * @name Assets.IMAGES
     * @memberof Assets
     */
    this.IMAGES = {};

    /**
     * Storage for all sdf font files loaded for easy access
     * @name Assets.SDF
     * @memberof Assets
     */
    this.SDF = {};

    /**
     * Storage for all JSON files loaded for easy access. Always clones object when retrieved.
     * @name Assets.JSON
     * @memberof Assets
     */
    this.JSON = {
        push: function(prop, value) {
            this[prop] = value;
            Object.defineProperty(this, prop, {
                get: () => {return JSON.parse(JSON.stringify(value))},
            });
        }
    };

    Object.defineProperty(this.JSON, 'push', {
        enumerable: false,
        writable: true
    });

    /**
     * Storage for all SVG files loaded for easy access
     * @name Assets.SVG
     * @memberof Assets
     */
    this.SVG = {};

    /**
     * Returns pixel-ratio-appropriate version if exists
     * @private
     * @param path
     * @returns {String}
     */
    function parseResolution(path) {
        if (!window.ASSETS || !ASSETS.RES) return path;
        var res = ASSETS.RES[path];
        var ratio = Math.min(Device.pixelRatio, 3);
        if (!res) return path;
        if (!res['x' + ratio]) return path;
        var split = path.split('/');
        var file = split[split.length-1];
        split = file.split('.');
        return path.replace(file, split[0] + '-' + ratio + 'x.' + split[1]);
    }

    /**
     * Array extension for manipulating list of assets
     * @private
     * @param {Array} arr
     * @returns {AssetList}
     * @constructor
     */
    function AssetList(arr) {
        arr.__proto__ = AssetList.prototype;
        return arr;
    }
    AssetList.prototype = new Array;

    /**
     * Filter asset list to only include those matching the arguments
     * @param {String|String[]} items
     */
    AssetList.prototype.filter = function(items) {
        for (let i = this.length - 1; i >= 0; i--) if (!this[i].includes(items)) this.splice(i, 1);
        return this;
    };

    /**
     * Filter asset list to exclude those matching the arguments
     * @param {String|String[]} items
     */
    AssetList.prototype.exclude = function(items) {
        for (let i = this.length - 1; i >= 0; i--) if (this[i].includes(items)) this.splice(i, 1);
        return this;
    };

    AssetList.prototype.prepend = function(prefix) {
        for (let i = this.length - 1; i >= 0; i--) this[i] = prefix + this[i];
        return this;
    };

    AssetList.prototype.append = function(suffix) {
        for (let i = this.length - 1; i >= 0; i--) this[i] = this[i] + suffix;
        return this;
    };

    /**
     * Get compiled list of assets
     * @name Assets.list
     * @memberof Assets
     *
     * @function
     * @returns {AssetList}
     * @example
     * const assets = Assets.list();
     * assets.filter(['images', 'geometry']);
     * assets.exclude('mobile');
     * assets.append('?' + Utils.timestamp());
     * const loader = _this.initClass(AssetLoader, assets);
     */
    this.list = function() {
        if (!window.ASSETS) console.warn(`ASSETS list not available`);
        return new AssetList(window.ASSETS.slice(0) || []);
    };

    /**
     * Wrap path in CDN and get correct resolution file
     * @name Assets.getPath
     * @memberof Assets
     *
     * @function
     * @param {String} path
     * @returns {String}
     */
    this.getPath = function(path) {

        // If static url, return untouched
        if (!!~path.indexOf('//')) return path;

        // Check if should offer different DPR version
        path = parseResolution(path);

        // Wrap in CDN
        if (this.CDN && !~path.indexOf(this.CDN)) path = this.CDN + path;

        return path;
    };

    /**
     * Load image, adding CDN and CORS state and optionally storing in memory
     * @name Assets.loadImage
     * @memberof Assets
     *
     * @function
     * @param {String} path - path of asset
     * @param {Boolean} [isStore] - True if to store in memory under Assets.IMAGES
     * @returns {Image}
     * @example
     * Assets.loadImage('assets/images/cube.jpg', true);
     * console.log(Assets.IMAGES['assets/images/cube.jpg']);
     */
    this.loadImage = function(path, isStore) {
        var img = new Image();
        img.crossOrigin = this.CORS;
        img.src = _this.getPath(path);

        img.loadPromise = function() {
            let promise = Promise.create();
            img.onload = promise.resolve;
            return promise;
        };

        if (isStore) this.IMAGES[path] = img;

        return img;
    };

    /**
     * Load and decode an image off the main thread
     * @name Assets.decodeImage
     * @memberof Assets
     *
     * @function
     * @param {String} path - path of asset
     * @param {Boolean} [flipY=Assets.FLIPY] - overwrite global flipY option
     * @returns {Promise}
     * @example
     * Assets.decodeImage('assets/images/cube.jpg').then(imgBmp => {});
     */
    this.decodeImage = function(path, params) {
        let promise = Promise.create();
        let img = _this.loadImage(path);
        img.onload = () => promise.resolve(img);
        return promise;
    };

}, 'static');
/**
 * @name AssetLoader
 * @example
 * const assets = Assets.list()l
 * const loader = new AssetLoader(assets);
 * _this.events.sub(loader, Events.COMPLETE, complete);
 */

Class(function AssetLoader(_assets, _callback, ASSETS = Assets) {
    Inherit(this, Events);
    const _this = this;

    let _total = _assets.length;
    let _loaded = 0;

    (function() {
        if (!Array.isArray(_assets)) throw `AssetLoader requires array of assets to load`;
        _assets = _assets.slice(0).reverse();

        init();
    })();

    function init() {
        if (!_assets.length) return complete();
        for (let i = 0; i < AssetLoader.SPLIT; i++) {
            if (_assets.length) loadAsset();
        }
    }

    function loadAsset() {
        let path = _assets.splice(_assets.length - 1, 1)[0];

        const name = path.split('assets/').last().split('.')[0];
        const ext = path.split('.').last().split('?')[0].toLowerCase();

        let timeout = Timer.create(timedOut, AssetLoader.TIMEOUT, path);

        // Check if asset previously loaded
        if (!!~Assets.__loaded.indexOf(path)) return loaded();

        // If image, don't use fetch api
        if (ext.includes(['jpg', 'jpeg', 'png', 'gif'])) {
            let image = ASSETS.loadImage(path);
            if (image.complete) return loaded();
            image.onload = loaded;
            image.onerror = loaded;
            return;
        }

        if (window.AURA && window.AURA.import) {
            if (ext == 'js') {
                AURA.import(path);
                loaded();
                return;
            }
        }

        get(Assets.getPath(path), Assets.HEADERS).then(data => {
            Assets.__loaded.push(path);
            if (ext == 'json') ASSETS.JSON.push(name, data);
            if (ext == 'svg') ASSETS.SVG[name] = data;
            if (ext == 'fnt') ASSETS.SDF[name.split('/')[1]] = data;
            if (ext == 'js') window.eval(data);
            if (ext.includes(['fs', 'vs', 'glsl']) && window.Shaders) Shaders.parse(data, path);
            loaded();
        }).catch(e => {
            console.warn(e);
            loaded();
        });

        function loaded() {
            if (timeout) clearTimeout(timeout);
            increment();
            if (_assets.length) loadAsset();
        }
    }

    function increment() {
        _this.events.fire(Events.PROGRESS, {percent: ++_loaded / _total});

        // Defer to get out of promise error catching
        if (_loaded == _total) defer(complete);
    }

    function complete() {

        // Defer again to allow any code waiting for loaded libs to run first
        defer(() => {
            _callback && _callback();
            _this.events.fire(Events.COMPLETE);
        });
    }

    function timedOut(path) {
        console.warn('Asset timed out', path);
    }

    this.loadModules = function() {
        if (!window._BUILT_ || window.AURA) return;
        this.add(1);
        let module = window._ES5_ ? 'es5-modules' : 'modules';
        let s = document.createElement('script');
        s.src = 'assets/js/'+module+'.js?' + window._CACHE_;
        s.async = true;
        AssetLoader.waitForLib('zUtils3D').then(_ => _this.trigger(1));
        document.head.appendChild(s);
    }

    /**
     * Increment total tasks for loader. Will need to manually trigger same amount for loader to complete.
     * @name add
     * @memberof AssetLoader
     *
     * @function
     * @param {Number} num
     * @example
     * const loader = new AssetLoader(assets);
     * loader.add(1);
     * _this.delayedCall(loader.trigger, 1000, 1);
     */
    this.add = function(num) {
        _total += num || 1;
    };

    /**
     * Increment number of loaded tasks.
     * @name trigger
     * @memberof AssetLoader
     *
     * @function
     * @param {Number} num
     */
    this.trigger = function(num) {
        for (let i = 0; i < (num || 1); i++) increment();
    };

}, () => {

    /**
     * Define number of batches to split up AssetLoader. Loader waits until each batch completes before starting next.
     * @name AssetLoader.SPLIT
     * @memberof AssetLoader
     */
    AssetLoader.SPLIT = 2;

    /**
     * Define length of asset timeout
     * @name AssetLoader.TIMEOUT
     * @memberof AssetLoader
     */
    AssetLoader.TIMEOUT = 5000;

    /**
     * Util to wrap AssetLoader in a promise and load all files.
     * @name AssetLoader.loadAllAssets
     * @memberof AssetLoader
     *
     * @function
     * @param {Function} callback
     * @returns {Promise}
     */
    AssetLoader.loadAllAssets = function(callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        promise.loader = new AssetLoader(Assets.list(), () => {
            if (callback) callback();
            if (promise.loader && promise.loader.destroy) promise.loader = promise.loader.destroy();
        });

        return promise;
    };

    /**
     * Util to wrap AssetLoader in a promise and load a list of files.
     * @name AssetLoader.loadAssets
     * @memberof AssetLoader
     *
     * @function
     * @param {Array} list
     * @param {Function} callback
     * @returns {Promise}
     */
    AssetLoader.loadAssets = function(list, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        promise.loader = new AssetLoader(list, () => {
            if (callback) callback();
            if (promise.loader && promise.loader.destroy) promise.loader = promise.loader.destroy();
        });

        return promise;
    };

    /**
     * Wait for global variable to be available
     * @name AssetLoader.waitForLib
     * @memberof AssetLoader
     *
     * @function
     * @param {String} name
     * @param {Function} [callback]
     * @returns {Promise}
     */
    AssetLoader.waitForLib = function(name, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        Render.start(check);
        function check() {
            if (window[name]) {
                Render.stop(check);
                callback && callback();
            }
        }

        return promise;
    };
});
