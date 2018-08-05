/**
 * @name Shader
 * @param {String} vertexShader
 * @param {String} fragmentShader
 * @param {Object} params
 */
Class(function Shader(_vertexShader, _fragmentShader, _params, _onBeforeBuild, _postfix) {
    const _this = this;

    this.uniforms = {};
    this.side = Shader.FRONT_SIDE;
    this.blending = Shader.NORMAL_BLENDING;
    this.polygonOffset = false;
    this.polygonOffsetFactor = 0;
    this.polygonOffsetUnits = 1;
    this.depthTest = true;
    this.depthWrite = true;
    this.wireframe = false;
    this.transparent = false;
    this.visible = true;
    this.persists = false;
    this.lights = [];
    this.precision = 'high';

    if (typeof _fragmentShader !== 'string') {
        _params = _fragmentShader;
        _fragmentShader = _vertexShader;
    }

    _params = _params || {};

    _this.vsParam = _vertexShader;
    _this.fsParam = _fragmentShader;
    _this.params = _params;

    _this.vsName = _vertexShader;
    _this.fsName = (_fragmentShader || _vertexShader) + (_postfix || '');
    if (_params.vsName) {
        _this.vsName = _params.vsName;
        delete _params.vsName;
    }

    if (_params.precision) _this.precision = _params.precision;
    if (_params.receiveShadow) {
        _this.receiveLight = true;
        if (!!World.RENDERER.shadows) _this.precision = 'high';
    }

    let cachedProgram = Shader.renderer.findCachedProgram(_this);

    if (!cachedProgram) {
        _this.vertexShader = Shader.process(Shaders.getShader(_vertexShader + '.vs'), 'vs', _this, _onBeforeBuild);
        _this.fragmentShader = Shader.process(Shaders.getShader(_fragmentShader + '.fs'), 'fs', _this, _onBeforeBuild);
    }

    let vs = _vertexShader;
    let fs = _fragmentShader;

    if (_params.uilFrom) {
        vs = _params.uilFrom;
        fs = _params.uilFrom;
        delete _params.uilFrom;
    }

    _this.UILPrefix = _params.UILPrefix || `${vs}/${fs}/${(_params.unique ? _params.unique + '/' : '')}`;

    Shader.parseParams(_params, _this);

}, _ => {
    Shader.FRONT_SIDE = 'shader_front_side';
    Shader.BACK_SIDE = 'shader_back_side';
    Shader.DOUBLE_SIDE = 'shader_double_side';
    Shader.ADDITIVE_BLENDING = 'shader_additive_blending';
    Shader.NORMAL_BLENDING = 'shader_normal_blending';
    Shader.CUSTOM_DEPTH = 'shader_custom_depth';

    Shader.parseParams = function(_params, _this) {
        for (let key in _params) {

            // Custom params
            if (key == 'receiveShadow') {
                _this.receiveShadow = _params[key];
            } else if (key == 'receiveLight') {
                _this.receiveLight = _params[key];
            } else if (_params[key].value !== undefined) {
                // Retrieve UIL overrides if exists
                if (window.UILStorage) {
                    _this.uniforms[key] = UILStorage.parse(_this.UILPrefix + key, _params[key].value) || _params[key];
                    if (!!_params[key].ubo) _this.uniforms[key].ubo = true;
                } else {
                    _this.uniforms[key] = _params[key];
                }
            } else {
                if (key == 'unique') continue;
                _this[key] = _params[key];
            }
        }
    }

    Shader.process = function(code, type, _this, _onBeforeBuild) {
        const WEBGL2 = Renderer.type == Renderer.WEBGL2;

        if (!code) throw 'No shader found! ' + _this.vsName + ' | ' + _this.fsName;
        const externalOES = code.includes('samplerOES');
        const standardDeriv = !WEBGL2 && code.includes(['fwidth', 'dFdx']);
        const drawBuffers = !WEBGL2 && code.includes(['gl_FragData', '#drawbuffer']) && (window.World && World.NUKE.useDrawBuffers);

        if (type == 'vs') {
            header = [
                '#version 300 es',
                `precision ${_this.precision}p float;`,
                `precision ${_this.precision}p int;`,

                'attribute vec2 uv;',
                'attribute vec3 position;',
                'attribute vec3 normal;',

                'uniform mat3 normalMatrix;',
                'uniform mat4 modelMatrix;',
                'uniform mat4 modelViewMatrix;',

                'uniform global {',
                'mat4 projectionMatrix;',
                'mat4 viewMatrix;',
                'vec3 cameraPosition;',
                'vec2 resolution;',
                'float time;',
                '};',

            ].join('\n');
        } else {
            header = [
                '#version 300 es',
                externalOES ? '#extension GL_OES_EGL_image_external : require' : '',
                standardDeriv ? '#extension GL_OES_standard_derivatives : enable' : '',
                drawBuffers ? '#extension GL_EXT_draw_buffers : require' : '',
                `precision ${_this.precision}p float;`,
                `precision ${_this.precision}p int;`,

                'uniform mat3 normalMatrix;',
                'uniform mat4 modelMatrix;',
                'uniform mat4 modelViewMatrix;',

                'uniform global {',
                'mat4 projectionMatrix;',
                'mat4 viewMatrix;',
                'vec3 cameraPosition;',
                'vec2 resolution;',
                'float time;',
                '};',

                'out vec4 FragColor;'

            ].join('\n');
        }

        header += '\n__ACTIVE_THEORY_LIGHTS__\n\n';
        if (window.AURA) header += '#define AURA\n';

        if (_onBeforeBuild) code = _onBeforeBuild(code, type);

        code = header + code;

        return code;
    }

    function getLightingCode(_this) {
        if (!_this.receiveLight) return '';

        let lighting = Lighting.getLighting(_this);
        let numLights = lighting.intensity.length;

        if (numLights == 0) return '';

        _this.uniforms.lightPos = {type: 'v3v', value: lighting.position};
        _this.uniforms.lightColor = {type: 'v3v', value: lighting.color};
        _this.uniforms.lightIntensity = {type: 'fv', value: lighting.intensity};
        _this.uniforms.lightDistance = {type: 'fv', value: lighting.distance};

        let lights = [
            `#define NUM_LIGHTS ${numLights}`,
            `uniform vec3 lightPos[${numLights}];`,
            `uniform vec3 lightColor[${numLights}];`,
            `uniform float lightIntensity[${numLights}];`,
            `uniform float lightDistance[${numLights}];`,
            ``,
        ].join('\n');

        return lights + Lighting.getShadowUniforms();
    }

    const prototype = Shader.prototype;

    /**
     * If linked, any changes to one uniform will update both. Non-linked it just a snapshot copy.
     * @name copyUniformsTo
     * @memberof Shader
     *
     * @function
     * @param {Shader} shader
     * @param {Boolean} linked
     */
    prototype.copyUniformsTo = function(shader, linked) {
        for (let key in this.uniforms) {
            if (!linked) {
                shader.uniforms[key] = {type: this.uniforms[key].type, value: this.uniforms[key].value};
            } else {
                shader.uniforms[key] = this.uniforms[key];
            }
        }
    }

    prototype.draw = function(mesh, geom) {
        Shader.renderer.draw(this, mesh, geom);
    }

    prototype.upload = function(mesh, geom) {
        Shader.renderer.upload(this, mesh, geom);
        if (this.receiveShadow && !this.shadow) Lighting.initShadowShader(this, mesh);
    }

    prototype.destroy = function() {
        if (!this.persists) {
            Shader.renderer.destroy(this);
            if (this.shadow) this.shadow.destroy();
        }
        if (this.receiveLight) Lighting.destroyShader(this);
    }

    prototype.onBeforeCompile = function(code, type) {
        const WEBGL2 = Renderer.type == Renderer.WEBGL2;

        if (type == 'fs') {
            if (WEBGL2) {
                if (code.includes('gl_FragColor')) code = code.replace(/gl_FragColor/g, 'FragColor');
            } else {
                if (code.includes('#applyShadow')) code = code.replace('#applyShadow', '');
            }

            if (code.includes('#drawbuffer Color')) {
                code = code.replace('#drawbuffer Color', '');
                while (code.includes('#drawbuffer')) {
                    let pre = code.split('#drawbuffer');
                    let post = pre[1].split('\n');
                    code = pre[0] + post[1];
                }
            }
        }

        code = code.replace('__ACTIVE_THEORY_LIGHTS__', getLightingCode(this));

        if (type == 'fs' && code.includes('SHADOW_MAPS')) code = require('GLSLOptimizer')(code.replace('SHADOW_COUNT', Lighting.getShadowCount(this)));

        if (this.preCompile) code = this.preCompile(code, type);

        let converter = require('ShaderCode');
        if (!WEBGL2) {
            code = converter.convertWebGL1(code);
        } else {
            code = converter.convertWebGL2(code, type);
        }

        return code;
    }

    /**
     * @name set
     * @memberof Shader
     *
     * @function
     * @param {String} key
     * @param {*} [value]
     * @returns {*} value of uniform
     */
    prototype.set = function(key, value) {
        if (typeof value !== 'undefined') this.uniforms[key].value = value;
        return this.uniforms[key].value;
    };

    /**
     * @name get
     * @memberof Shader
     *
     * @function
     * @param {String} key
     * @returns {*} value of uniform
     */
    prototype.get = function(key) {
        return this.uniforms[key].value;
    };

    /**
     * @name tween
     * @memberof Shader
     *
     * @function
     * @param {String} key
     * @param {*} value
     * @param {Number} time
     * @param {String} ease
     * @param {Number} [delay]
     * @returns {Tween}
     */
    prototype.tween = function(key, value, time, ease, delay, callback, update) {
        return tween(this.uniforms[key], {value: value}, time, ease, delay, callback, update);
    };

    /**
     * @name clone
     * @memberof Shader
     *
     * @function
     */
    prototype.clone = function(noShadows, postfix) {
        const _this = this;

        if (noShadows) _this.params.receiveShadow = false;
        let shader = new Shader(_this.vsParam, _this.fsParam, _this.params, null, postfix);

        for (let key in _this) {
            if (key.includes(['vsName', 'fsName', 'uniforms']) || typeof _this[key] === 'function') continue;
            shader[key] = _this[key];
        }

        for (let key in _this.uniforms) {
            shader.uniforms[key] = {type: _this.uniforms[key].type, value: _this.uniforms[key].value};
        }
        return shader;
    }
});

/**
 * @name Shader.FRONT_SIDE
 * @memberof Shader
 * @property
 */

/**
 * @name Shader.BACK_SIDE
 * @memberof Shader
 * @property
 */

/**
 * @name Shader.DOUBLE_SIDE
 * @memberof Shader
 * @property
 */

/**
 * @name Shader.ADDITIVE_BLENDING
 * @memberof Shader
 * @property
 */

/**
 * @name Shader.NORMAL_BLENDING
 * @memberof Shader
 * @property
 */

/**
 * @name Shader.CUSTOM_DEPTH
 * @memberof Shader
 * @property
 */