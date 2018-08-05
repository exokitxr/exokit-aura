/**
 * @name Utils3D
 */

Class(function Utils3D() {
    const _this = this;
    var _debugGeometry, _emptyTexture;

    var _textures = {};

    window.Vec2 = window.Vector2;
    window.Vec3 = window.Vector3;

    (async function() {
        await Hydra.ready();
        let threads = Thread.shared(true);
        for (let i = 0; i < threads.array.length; i++) _this.loadEngineOnThread(threads.array[i]);
    })();

    //*** Public methods

    /**
     * @name Utils3D.decompose
     * @memberof Utils3D
     *
     * @function
     * @param {Vector3} local
     * @param {Vector3} world
     */
    this.decompose = function(local, world) {
        local.matrixWorld.decompose(world.position, world.quaternion, world.scale);
    };

    /**
     * @name Utils3D.createDebug
     * @memberof Utils3D
     *
     * @function
     * @param {Number} size
     * @param {Color} color
     */
    this.createDebug = function(size = 1, color) {
        if (!_debugGeometry) _debugGeometry = new IcosahedronGeometry(size, 1);
        return new Mesh(_debugGeometry, _this.getTestShader(color));
    };

    /**
     * @name Utils3D.getTestShader
     * @memberof Utils3D
     *
     * @function
     * @param {Color} color
     */
    this.getTestShader = function(color) {
        return color ? new Shader('ColorMaterial', {color: {value: new Color(color)}}) : new Shader('TestMaterial');
    }


    this.createMultiRT = function(width, height, type, format) {
        let rt = new MultiRenderTarget(width, height, {minFilter: Texture.LINEAR, magFilter: Texture.LINEAR, format: format || Texture.RGBFormat, type});
        rt.texture.generateMipmaps = false;
        return rt;
    };

    this.createRT = function(width, height, type, format) {
        let rt = new RenderTarget(width, height, {minFilter: Texture.LINEAR, magFilter: Texture.LINEAR, format: format || Texture.RGBFormat, type});
        rt.texture.generateMipmaps = false;
        return rt;
    }

    this.getFloatType = function() {
        return Device.system.os == 'android' ? Texture.FLOAT : Texture.HALF_FLOAT;
    }

    /**
     * @name Utils3D.getTexture
     * @memberof Utils3D
     *
     * @function
     * @param {String} path
     * @returns {Texture}
     */
    this.getTexture = function(path, params = {}) {
        if (!_textures[path]) {
            let texture = new Texture();
            texture.loaded = false;
            texture.promise = Promise.create();
            texture._destroy = texture.destroy;
            texture.destroy = function() {
                delete _textures[path];
                this._destroy();
            };
            _textures[path] = texture;

            texture.format = path.match(/jpe?g/) ? Texture.RGBFormat : Texture.RGBAFormat;
            texture.src = path;
            if (params.premultiplyAlpha === false) texture.premultiplyAlpha = false;

            if (!path.includes('.')) {
                texture.compressed = true;
                texture.minFilter = Texture.LINEAR;
            }

            ImageDecoder.decode(path, params).then(imgBmp => {
                texture.image = imgBmp;
                texture.loaded = true;
                texture.needsReupload = true;
                if (!Math.isPowerOf2(imgBmp.width, imgBmp.height)) {
                    texture.minFilter = Texture.LINEAR;
                    texture.generateMipmaps = false;
                }

                texture.onUpdate = function() {
                    if (!params.preserveData && imgBmp.close) imgBmp.close();
                    texture.onUpdate = null;
                };

                texture.promise.resolve();
                if (texture.onload) {
                    texture.onload();
                    texture.onload = null;
                }
            });
        }

        return _textures[path];
    };

    /**
     * @name Utils3D.getLookupTexture
     * @memberof Utils3D
     *
     * @function
     * @param {String} path
     * @returns {Texture}
     */
    this.getLookupTexture = function(path) {
        let texture = this.getTexture(path);
        texture.minFilter = texture.magFilter = Texture.NEAREST;
        return texture;
    }

    /**
     * @name Utils3D.disposeAllTextures
     * @memberof Utils3D
     * @function
     */
    this.disposeAllTextures = function() {
        for (let key in _textures) {
            _textures[key].dispose();
        }
    };

    /**
     * @name Utils3D.loadCurve
     * @memberof Utils3D
     *
     * @function
     * @param {String} path
     * @returns {CatmullRomCurve}
     */
    this.loadCurve = function(obj) {
        if (typeof obj === 'string') {
            obj = Assets.JSON[obj];
            obj.curves = obj.curves[0];
        }

        let data = obj.curves;
        let points = [];
        for (let j = 0; j < data.length; j += 3) {
            points.push(new Vector3(
                data[j + 0],
                data[j + 1],
                data[j + 2]
            ));
        }

        if (!window.CatmullRomCurve) throw 'loadCurve requires curve3d module';
        return new CatmullRomCurve(points);
    }

    this.getEmptyTexture = function() {
        if (!_emptyTexture) _emptyTexture = new Texture();
        return _emptyTexture;
    }

    /**
     * @name Utils3D.getRepeatTexture
     * @memberof Utils3D
     *
     * @function
     * @param {String} path
     * @returns {Texture}
     */
    this.getRepeatTexture = function(src, scale) {
        let texture = _this.getTexture(src, scale);
        texture.wrapS = texture.wrapT = Texture.REPEAT;
        return texture;
    }

    /**
     * @name Utils3D.findTexturesByPath
     * @memberof Utils3D
     *
     * @function
     * @param {String} path
     * @returns {Array}
     */
    this.findTexturesByPath = function(path) {
        let array = [];
        for (let key in _textures) {
            if (key.includes(path)) array.push(_textures[key]);
        }
        return array;
    }

    /**
     * @name Utils3D.getHeightFromCamera
     * @memberof Utils3D
     *
     * @function
     * @param {CameraBase3D} camera
     * @returns {Number}
     */
    this.getHeightFromCamera = function(camera) {
        let dist = camera.position.length();
        let fov = camera.fov;
        return 2.00 * dist * Math.tan(Math.radians(fov) * 0.5);
    }

    /**
     * @name Utils3D.getPositionFromCameraSize
     * @memberof Utils3D
     *
     * @function
     * @param {CameraBase3D} camera
     * @param {Number} size
     * @returns {Number}
     */
    this.getPositionFromCameraSize = function(camera, size) {
        let fov = Math.radians(camera.fov);
        return Math.abs(size / Math.sin(fov/2));
    }

    /**
     * @name Utils3D.loadEngineOnThread
     * @memberof Utils3D
     *
     * @function
     * @param {Thread} thread
     */
    this.loadEngineOnThread = function(thread) {
        [
            'Base3D', 'CameraBase3D', 'Mesh', 'OrthographicCamera', 'PerspectiveCamera', 'Geometry', 'GeometryAttribute', 'Points', 'Scene',
            'BoxGeometry', 'CylinderGeometry', 'PlaneGeometry', 'PolyhedronGeometry', 'IcosahedronGeometry', 'SphereGeometry',
            'Box2', 'Box3', 'Face3', 'Color', 'Cylindrical', 'Euler', 'Frustum', 'Line3', 'Matrix3', 'Matrix4', 'Plane', 'Quaternion',
            'Ray', 'Sphere', 'Spherical', 'Triangle', 'Vector2', 'Vector3', 'Vector4', 'RayManager'
        ].forEach(name => {
            thread.importES6Class(name);
        });

        thread.importCode(`Class(${zUtils3D.constructor.toString()}, 'static')`);
    }

}, 'static');