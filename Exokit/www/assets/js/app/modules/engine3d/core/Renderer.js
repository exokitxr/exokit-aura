/**
 * @name Renderer
 * @param {Object} params
 */
Class(function Renderer(_params = {}) {
    Inherit(this, Component);
    const _this = this;
    var _canvas, _gl, _width, _height, _anisotropy;
    var _projScreenMatrix, _vector3, _frustum, _ubo;

    var _dpr = 1;
    var _resolution = new Vector2();
    var _m0 = new Matrix4();
    var _m1 = new Matrix4();
    var _time = {value: 0};

    this.autoClear = true;
    this.shadows = false;

    /**
     * @name autoClear
     * @memberof Renderer
     * @property
     */

    /**
     * @name shadows
     * @memberof Renderer
     * @property
     */

    //*** Constructor
    (function () {
        Renderer.instance = _this;
        Renderer.CLEAR = [0, 0, 0, 1];

        initContext();
        setExtensions();
        initRenderers();
        initMath();
        initUBO();
        _this.startRender(loop);
    })();

    function initContext() {
        let contextAttributes = {
            antialias: _params.antialias !== undefined ? _params.antialias : false,
            powerPreference: _params.powerPreference,
            preserveDrawingBuffer: _params.preserveDrawingBuffer,
            compatibleXRDevice: _params.compatibleXRDevice
        };

        _canvas = _params.canvas || document.createElement('canvas');

        if (!_params.gl) {
            ['webgl2', 'webgl', 'experimental-webgl'].forEach(name => {
                if (_gl || (name == 'webgl2' && _params.forceWebGL1)) return;

                _gl = _canvas.getContext(name, contextAttributes);

                if (_gl && name == 'webgl2') _this.type = Renderer.WEBGL2;
                else _this.type = Renderer.WEBGL1;
            });
        } else {
            _gl = _params.gl;
            _this.type = Renderer.WEBGL2;
        }

        if (!_gl) throw 'Error! Could not create WebGL context';

        _this.domElement = _canvas;

        Renderer.type = _this.type;
        Renderer.context = _this.context = _gl;
    }

    function setExtensions() {
        _this.extensions = {};
        if (_this.type != Renderer.WEBGL2) {
            _this.extensions.VAO = _gl.getExtension('OES_vertex_array_object');
            _this.extensions.instancedArrays = _gl.getExtension('ANGLE_instanced_arrays');
            _this.extensions.standardDerivatives = _gl.getExtension('OES_standard_derivatives');
            _this.extensions.depthTextures = _gl.getExtension('WEBGL_depth_texture');
            _this.extensions.drawBuffers = _gl.getExtension('WEBGL_draw_buffers');
            _this.extensions.halfFloat = _gl.getExtension('OES_texture_half_float');
            _this.extensions.float = _gl.getExtension('OES_texture_float');
            _this.extensions.colorBufferFloat = _gl.getExtension('WEBGL_color_buffer_float');
        } else {
            _this.extensions.colorBufferFloat = _gl.getExtension('EXT_color_buffer_float');
        }

        _this.extensions.anisotropy = _gl.getExtension('EXT_texture_filter_anisotropic');
        _this.extensions.astc = _gl.getExtension('WEBGL_compressed_texture_astc');
        _this.extensions.atc = _gl.getExtension('WEBGL_compressed_texture_atc');
        _this.extensions.etc = _gl.getExtension('WEBGL_compressed_texture_etc');
        _this.extensions.etc1 = _gl.getExtension('WEBGL_compressed_texture_etc1');
        _this.extensions.pvrtc = _gl.getExtension('WEBGL_compressed_texture_pvrtc');
        _this.extensions.s3tc = _gl.getExtension('WEBGL_compressed_texture_s3tc');
        _this.extensions.s3tc_srgb = _gl.getExtension('WEBGL_compressed_texture_s3tc_srgb');

        Renderer.extensions = _this.extensions;
    }

    function initUBO() {
        if (_this.type == Renderer.WEBGL2) {
            _ubo = true;
        }

        Renderer.UBO = _ubo;
    }

    function initCameraUBO(camera) {
        camera._ubo = new UBO(0);
        camera._ubo.push({value: camera.projectionMatrix});
        camera._ubo.push({value: camera.matrixWorldInverse});
        camera._ubo.push({value: camera.worldPos});
        camera._ubo.push({value: _resolution});
        camera._ubo.push(_time);
        camera._ubo.upload();
    }

    function initRenderers() {
        Geometry.renderer = new GeometryRendererWebGL();
        Texture.renderer = new TextureRendererWebGL();
        Shader.renderer = new ShaderRendererWebGL();
        RenderTarget.renderer = new FBORendererWebGL();
    }

    function initMath() {
        _projScreenMatrix = new Matrix4();
        _vector3 = new Vector3();
        _frustum = new Frustum();
    }

    function sortOpaque(array) {
        for (let i = array.length-1; i > -1; i--) {
            let obj = array[i];
            if (!obj.shader._gl) obj.shader.upload();
        }
        array.sort((a, b) => {
            if (a.renderOrder != b.renderOrder) return a.renderOrder - b.renderOrder;
            let aid = a.shader._gl._id;
            let bid = b.shader._gl._id;
            return aid - bid;
        });
    }

    function sortTransparent(array) {
        array.sort((a, b) => {
            if (a.renderOrder != b.renderOrder) return a.renderOrder - b.renderOrder;
            return a.worldPos.z - b.worldPos.z
        });
    }

    function projectObject(object, camera, scene) {
        if (!!object.shader) {
            let visible = object.determineVisible();
            if (visible) {
                object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
                object.normalMatrix.getNormalMatrix(object.modelViewMatrix);
            }

            if (scene.displayNeedsUpdate || (object.shader.transparent && !scene.disableAutoSort && visible)) object.getWorldPosition(object.worldPos);
            if (scene.displayNeedsUpdate) scene.toRender[object.shader.transparent ? 1 : 0].push(object);
        }

        for (let i = object.children.length-1; i > -1; i--) {
            projectObject(object.children[i], camera, scene);
        }
    }

    function attachSceneUniforms(object, scene, camera) {
        Shader.renderer.appendUniform(object.shader, 'normalMatrix', object.normalMatrix);
        Shader.renderer.appendUniform(object.shader, 'modelMatrix', object.matrixWorld);
        Shader.renderer.appendUniform(object.shader, 'modelViewMatrix', object.modelViewMatrix);

        if (!_ubo) {
            Shader.renderer.appendUniform(object.shader, 'projectionMatrix', camera.projectionMatrix);
            Shader.renderer.appendUniform(object.shader, 'viewMatrix', camera.matrixWorldInverse);
            Shader.renderer.appendUniform(object.shader, 'cameraPosition', camera.worldPos);
            Shader.renderer.appendUniform(object.shader, 'resolution', _resolution);
            Shader.renderer.appendUniform(object.shader, 'time', _time.value);
        } else {
            camera._ubo.bind(object.shader._gl.program, 'global');
        }

        if (_this.shadows && object.shader.receiveShadow && !_this.overridePreventShadows) {
            let lights = Lighting.getShadowLights();
            if (!object._gl) object._gl = {};
            if (!object._gl.shadowData) object._gl.shadowData = {combined: new Float32Array(lights.length * 16)};

            for (let i = 0; i < lights.length; i++) {
                let light = lights[i];
                _m1.multiplyMatrices(light.shadow.camera.matrixWorldInverse, object.matrixWorld);
                _m0.multiplyMatrices(light.shadow.camera.projectionMatrix, _m1);
                _m0.toArray(object._gl.shadowData.combined, i * 16);
            }

            if (scene._shadowData) {
                Shader.renderer.appendUniform(object.shader, 'shadowMap', scene._shadowData[_this.overridePreventShadows ? 'emptyMaps' : 'maps']);
                Shader.renderer.appendUniform(object.shader, 'shadowMatrix', object._gl.shadowData.combined, 'matrix');
                Shader.renderer.appendUniform(object.shader, 'shadowLightPos', scene._shadowData.pos, 'vec3');
                Shader.renderer.appendUniform(object.shader, 'shadowSize', scene._shadowData.size, 'float');
            }
        }
    }

    function attachShadowUniforms(object, scene, light) {
        if (!light._mvm) light._mvm = new Matrix4();
        if (!light._nm) light._nm = new Matrix3();
        light._mvm.multiplyMatrices(light.shadow.camera.matrixWorldInverse, object.matrixWorld);
        light._nm.getNormalMatrix(object.modelViewMatrix);

        Shader.renderer.appendUniform(object.shader.shadow, 'normalMatrix', light._nm);
        Shader.renderer.appendUniform(object.shader.shadow, 'modelMatrix', object.matrixWorld);
        Shader.renderer.appendUniform(object.shader.shadow, 'modelViewMatrix', light._mvm);

        if (!_ubo) {
            Shader.renderer.appendUniform(object.shader.shadow, 'projectionMatrix', light.shadow.camera.projectionMatrix);
            Shader.renderer.appendUniform(object.shader.shadow, 'viewMatrix', light.shadow.camera.matrixWorldInverse);
        } else {
            light.shadow.camera._ubo.bind(object.shader._gl.program, 'global');
        }
    }

    function loop(t, dt) {
        _time.value += dt * 0.001;
    }

    function render(scene, camera, rt) {
        if (rt) RenderTarget.renderer.bind(rt);
        else {
            if (!Renderer.overrideViewport) _gl.viewport(0, 0, _width * _dpr, _height * _dpr);
            if (_this.autoClear) {
                _gl.clearColor(Renderer.CLEAR[0], Renderer.CLEAR[1], Renderer.CLEAR[2], Renderer.CLEAR[3]);
                _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
            }
        }

        if (!camera.parent) camera.updateMatrixWorld();
        camera.getWorldPosition(camera.worldPos);
        _frustum.setFromCamera(camera);

        if (_ubo) {
            if (!camera._ubo) initCameraUBO(camera);
            else camera._ubo.update();
        }

        for (let l = 0; l < 2; l++) {
            for (let i = 0; i < scene.toRender[l].length; i++) {
                let object = scene.toRender[l][i];
                object.onBeforeRender && object.onBeforeRender();
                if (!object.determineVisible() || !object.shader.visible) continue;

                if (!object.frustumCulled || _frustum.intersectsObject(object)) {
                    object.shader.draw(object, object.geometry);
                    attachSceneUniforms(object, scene, camera);
                    object.geometry.draw(object, object.shader);
                    if (_ubo) camera._ubo.unbind();
                }
            }
        }

        if (rt) RenderTarget.renderer.unbind();
    }

    function renderShadows(scene, camera) {
        let render = light => {
            if (light.shadow.frozen) return;
            RenderTarget.renderer.bind(light.shadow.rt);

            light.shadow.camera.updateMatrixWorld();
            camera.getWorldPosition(camera.worldPos);
            _frustum.setFromCamera(camera);

            if (_ubo) {
                if (!light.shadow.camera._ubo) initCameraUBO(light.shadow.camera);
                else light.shadow.camera._ubo.update();
            }

            for (let l = 0; l < 2; l++) {
                for (let i = 0; i < scene.toRender[l].length; i++) {
                    let object = scene.toRender[l][i];
                    if (!object.determineVisible() || !object.shader.visible) continue;

                    if ((!object.frustumCulled || _frustum.intersectsObject(object)) && object.castShadow) {
                        if (!object.shader.shadow) Lighting.initShadowShader(object);
                        object.shader.shadow.draw(object, object.geometry);
                        attachShadowUniforms(object, scene, light);
                        object.geometry.draw(object, object.shader);
                        if (_ubo) light.shadow.camera._ubo.unbind();
                    }
                }
            }

            RenderTarget.renderer.unbind(light.shadow.rt);
        };

        let lights = Lighting.getShadowLights();
        if (!scene._shadowData) scene._shadowData = {maps: [], emptyMaps: [], size: new Float32Array(lights.length), pos: new Float32Array(lights.length * 3), count: lights.length};
        if (scene._shadowData.count != lights.length) {
            scene._shadowData.size = new Float32Array(lights.length);
            scene._shadowData.pos = new Float32Array(lights.length * 3);
            scene._shadowData.count = lights.length;
        }
        for (let i = 0; i < lights.length; i++) {
            let light = lights[i];
            light.prepareRender();
            scene._shadowData.maps[i] = light.shadow.rt.depth;
            scene._shadowData.emptyMaps[i] = Utils3D.getEmptyTexture();
            scene._shadowData.size[i] = light.shadow.size;
            light.position.toArray(scene._shadowData.pos, i * 3);
        }

        for (let i = 0; i < lights.length; i++) render(lights[i]);
    }

    //*** Event handlers

    //*** Public methods

    /**
     * @name render()
     * @memberof Renderer
     *
     * @function
     * @param {Scene} scene
     * @param {Camera} camera
     * @param {RenderTarget} rt
     */
    this.render = function(scene, camera, rt) {
        if (scene.displayNeedsUpdate) {
            scene.toRender[0].length = 0;
            scene.toRender[1].length = 0;
        }

        scene.updateMatrixWorld();

        projectObject(scene, camera, scene);

        if (scene.displayNeedsUpdate) sortOpaque(scene.toRender[0]);
        if (scene.displayNeedsUpdate || (scene.toRender[1].length && !scene.disableAutoSort)) sortTransparent(scene.toRender[1]);

        if (_this.shadows && !_this.overridePreventShadows && !_this.pauseShadowRendering) renderShadows(scene, camera);

        if (!rt && _this.vrRenderingPath) _this.vrRenderingPath(scene, camera, _projScreenMatrix, _frustum, attachSceneUniforms);
        else if (!rt && _this.arRenderingPath) _this.arRenderingPath(render, scene, camera);
        else render(scene, camera, rt);

        scene.displayNeedsUpdate = false;
        Shader.renderer.resetState();
    }

    /**
     * @name setClearColor()
     * @memberof Renderer
     *
     * @function
     * @param {Color} color
     * @param {Float} alpha
     */
    this.setClearColor = function(color, alpha = 1) {
        _this.clearColor = new Color(color);
        Renderer.CLEAR = [_this.clearColor.r, _this.clearColor.g, _this.clearColor.b, alpha];
    }

    /**
     * @name getClearColor()
     * @memberof Renderer
     *
     * @function
     */
    this.getClearColor = function() {
        if (!_this.clearColor) _this.clearColor = new Color(0, 0, 0);
        return _this.clearColor;
    }

    /**
     * @name setPixelRatio()
     * @memberof Renderer
     *
     * @function
     * @param {Float} dpr
     */
    this.setPixelRatio = function(dpr) {
        _dpr = dpr;
        this.setSize(_width, _height);
    }

    /**
     * @name setSize()
     * @memberof Renderer
     *
     * @function
     * @param {Number} width
     * @param {Number} height
     */
    this.setSize = function(width, height) {
        _width = width;
        _height = height;
        _canvas.width = width * _dpr;
        _canvas.height = height * _dpr;
        _canvas.style.width = `${width}px`;
        _canvas.style.height = `${height}px`;
        _resolution.set(_canvas.width, _canvas.height);
    }

    this.getMaxAnisotropy = function() {
        if (!_anisotropy) _anisotropy = _gl.getParameter(_this.extensions.anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        return _anisotropy;
    }

    this.get('resolution', _ => {
        return _resolution;
    });

    this.get('time', _ => {
        return _time;
    });

}, _ => {
    Renderer.WEBGL1 = 'webgl1';
    Renderer.WEBGL2 = 'webgl2';
    Renderer.SHADOWS_LOW = 'shadows_low';
    Renderer.SHADOWS_MED = 'shadows_med';
    Renderer.SHADOWS_HIGH = 'shadows_high';
});

/**
 * @name Renderer.WEBGL1
 * @memberof Renderer
 * @property
 */

/**
 * @name Renderer.WEBGL2
 * @memberof Renderer
 * @property
 */

/**
 * @name Renderer.SHADOWS_LOW
 * @memberof Renderer
 * @property
 */

/**
 * @name Renderer.SHADOWS_MED
 * @memberof Renderer
 * @property
 */

/**
 * @name Renderer.SHADOWS_HIGH
 * @memberof Renderer
 * @property
 */