/**
 * @name GeomThread
 */
Class(function GeomThread() {
    Inherit(this, Component);
    const _this = this;

    var _cache = {};
    var _cacheWait = {};
    var _receive = {};
    var _threads = [];
    var _index = 0;

    this.caching = true;

    (async function() {
        await Hydra.ready();
        Thread.upload(loadGeometry, loadSkinnedGeometry, geom_useFn, computeBounding);
    })();

    function computeBounding(data) {
        let geom = new Geometry();
        geom.addAttribute('position', new GeometryAttribute(data.position, 3));
        geom.computeBoundingBox();
        geom.computeBoundingSphere();
        data.boundingBox = geom.boundingBox;
        data.boundingSphere = geom.boundingSphere;
    }

    function loadGeometry(e, id) {
        get(e.path).then(data => {
            let buffers = [];
            for (let key in data) {
                if (Array.isArray(data[key])) {
                    data[key] = new Float32Array(data[key]);
                    buffers.push(data[key].buffer);
                } else if (data[key].length > 0) {
                    buffers.push(data[key].buffer);
                }
            }

            computeBounding(data);
            if (e.custom) self[e.custom](data);

            resolve(data, id, buffers);
        });
    }

    function loadSkinnedGeometry(e, id) {
        get(e.path).then(data => {
            let buffers = [];
            for (let key in data) {
                if (key == 'bones') continue;
                if (Array.isArray(data[key])) {
                    data[key] = new Float32Array(data[key]);
                    buffers.push(data[key].buffer);
                } else if (data[key].length > 0) {
                    buffers.push(data[key].buffer);
                }
            }

            computeBounding(data);
            if (e.custom) self[e.custom](data);

            resolve(data, id, buffers);
        });
    }

    function geom_useFn(e) {
        if (!Global.FNS) Global.FNS = [];
        Global.FNS.push(e.name);
    }

    //*** Event handlers

    //*** Public methods

    /**
     * @name loadGeometry
     * @memberof GeomThread
     *
     * @function
     * @param {String} path
     * @param {String} custom
     * @returns {Promise} geometry
     */
    this.loadGeometry = function(path, custom) {
        if (_cache[path]) return Promise.resolve(_cache[path]);

        if (!path.includes('assets/geometry/')) path = 'assets/geometry/' + path;
        if (!path.includes('.')) path += '.json';
        path = Thread.absolutePath(path);

        if (_this.caching) {
            if (!_cacheWait[path]) _cacheWait[path] = Promise.create();
            else return _cacheWait[path];
        }

        Thread.shared().loadGeometry({path, custom}).then(data => {
            let geometry;
            if (custom && _receive[custom]) {
                geometry = _receive[custom](data);
            } else {
                let geom = new Geometry();
                geom.addAttribute('position', new GeometryAttribute(data.position, 3));
                geom.addAttribute('normal', new GeometryAttribute(data.normal || data.position.length, 3));
                geom.addAttribute('uv', new GeometryAttribute(data.uv || data.position.length / 3 * 2, 2));
                if (data.uv2) geom.addAttribute('uv2', new GeometryAttribute(data.uv2, 2));
                geom.boundingBox = new Box3(new Vector3().set(data.boundingBox.min.x, data.boundingBox.min.y, data.boundingBox.min.z), new Vector3().set(data.boundingBox.max.x, data.boundingBox.max.y, data.boundingBox.max.z));
                geom.boundingSphere = new Sphere(new Vector3().set(data.boundingSphere.center.x, data.boundingSphere.center.y, data.boundingSphere.center.z), data.boundingSphere.radius);
                geometry = geom;
            }
            

            if (_this.caching) _cache[path] = geometry;
            _cacheWait[path].resolve(geometry);
            delete _cacheWait[path];
        });

        return _cacheWait[path];
    }

    /**
     * @name loadSkinnedGeometry
     * @memberof GeomThread
     *
     * @function
     * @param {String} path
     * @param {String} custom
     * @returns {Promise} geometry
     */
    this.loadSkinnedGeometry = function(path, custom) {
        if (_cache[path]) return Promise.resolve(_cache[path]);

        if (!path.includes('assets/geometry/')) path = 'assets/geometry/' + path;
        if (!path.includes('.')) path += '.json';
        path = Thread.absolutePath(path);

        if (_this.caching) {
            if (!_cacheWait[path]) _cacheWait[path] = Promise.create();
            else return _cacheWait[path];
        }

        Thread.shared().loadSkinnedGeometry({path, custom}).then(data => {

            let geometry;
            if (custom && _receive[custom]) {
                geometry = _receive[custom](data);
            } else {
                let geom = new Geometry();

                geom.addAttribute('position', new GeometryAttribute(data.position, 3));
                geom.addAttribute('normal', new GeometryAttribute(data.normal || data.position.length, 3));
                geom.addAttribute('uv', new GeometryAttribute(data.uv || data.position.length / 3 * 2, 2));
                geom.addAttribute('skinIndex', new GeometryAttribute(data.skinIndex, 4));
                geom.addAttribute('skinWeight', new GeometryAttribute(data.skinWeight, 4));
                geom.bones = data.bones.slice(0);
                geom.boundingBox = new Box3(new Vector3().set(data.boundingBox.min.x, data.boundingBox.min.y, data.boundingBox.min.z), new Vector3().set(data.boundingBox.max.x, data.boundingBox.max.y, data.boundingBox.max.z));
                geom.boundingSphere = new Sphere(new Vector3().set(data.boundingSphere.center.x, data.boundingSphere.center.y, data.boundingSphere.center.z), data.boundingSphere.radius);
                geometry = geom;
            }

            if (_this.caching) _cache[path] = geometry;
            _cacheWait[path].resolve(geometry);
            delete _cacheWait[path];
        });

        return _cacheWait[path];
    }

    /**
     * @name customFunction
     * @memberof GeomThread
     *
     * @function
     * @param {Function} function
     * @param {Function} receive
     */
    this.customFunction = function(fn, receive) {
        let name = Thread.upload(fn);
        name = name[0];
        t.geom_useFn({name});

        _receive[name] = receive;
    }
}, 'static');