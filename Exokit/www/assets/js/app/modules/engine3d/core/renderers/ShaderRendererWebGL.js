Class(function ShaderRendererWebGL() {
    const _this = this;
    var _gl = Renderer.context;

    var _pool = {};
    var _programID = 0;
    var _cached = {};
    var _uboCache = {};

    const WEBGL2 = Renderer.type == Renderer.WEBGL2;

    function toTypedArray(uni) {
        let value = uni.value;
        if (!uni._gl) uni._gl = {};
        if (!uni._gl.array || uni._gl.array.length != uni.value.length) uni._gl.array = new Float32Array(uni.value);
        else uni._gl.array.set(uni.value);
        return uni._gl.array;
    }

    function createShader(str, type) {
        let shader = _gl.createShader(type);

        _gl.shaderSource(shader, str);
        _gl.compileShader(shader);

        if (Hydra.LOCAL) {
            if (!_gl.getShaderParameter(shader, _gl.COMPILE_STATUS)) {
                let error = _gl.getShaderInfoLog(shader);
                _gl.deleteShader(shader);
                let split = str.split('\n');
                let errorString = '';
                split.forEach((line, index) => {
                    index = (function() {
                        switch (index.toString().length) {
                            case 1: return '00' + index; break;
                            case 2: return '0' + index; break;
                        }
                        return index;
                    })();

                    errorString += `${index}: ${line}\n`;
                });
                console.warn(error, errorString);
                throw error;
            }
        }

        return shader;
    }

    function createProgram(shader) {
        let vsCode = shader.onBeforeCompile(shader.vertexShader, 'vs');
        let fsCode = shader.onBeforeCompile(shader.fragmentShader, 'fs');

        let vs = createShader(vsCode, _gl.VERTEX_SHADER);
        let fs = createShader(fsCode, _gl.FRAGMENT_SHADER);

        let program = _gl.createProgram();
        _gl.attachShader(program, vs);
        _gl.attachShader(program, fs);
        _gl.linkProgram(program);

        if (Hydra.LOCAL) {
            if (!_gl.getProgramParameter(program, _gl.LINK_STATUS)) {
                console.warn(vsCode);
                console.warn(fsCode);
                throw 'Could not compile WebGL program. \n\n' + _gl.getProgramInfoLog(program);
            }
        }

        return program;
    }

    function setupShaders(shader) {
        for (let key in shader.uniforms) {
            let uniform = shader.uniforms[key];
            if (typeof shader._gl[key] !== 'undefined') continue;

            if (uniform.ubo) {
                if (WEBGL2) {
                    if (_uboCache[shader.UILPrefix] && !shader.ubo) shader.ubo = _uboCache[shader.UILPrefix];

                    //UBO is already cached, so dont add any uniforms to it
                    if (_uboCache[shader.UILPrefix]) {
                        shader._gl[key] = 'U';
                        continue;
                    }

                    //This shader is uploading for the first time so has not been cached yet
                    if (!shader.ubo) shader.ubo = new UBO(1);
                    shader.ubo.push(uniform);
                    shader._gl[key] = 'U';
                } else {
                    //Not WEBGL2, so fallback UBO to uniform
                    shader._gl[key] = _gl.getUniformLocation(shader._gl.program, key);
                }
            } else {
                shader._gl[key] = _gl.getUniformLocation(shader._gl.program, key);
            }
        }

        if (shader.ubo && !_uboCache[shader.UILPrefix]) _uboCache[shader.UILPrefix] = shader.ubo;
    }

    function findUniformType(uniform) {
        if (typeof uniform.type === 'string') return uniform.type;
        if (uniform.value === null || uniform.value instanceof Texture || uniform.value.texture || uniform.value.rt && uniform.value.rt.texture) return 't';
        if (uniform.value instanceof Vector2) return 'v2';
        if (uniform.value instanceof Vector3) return 'v3';
        if (uniform.value instanceof Vector4) return 'v4';
        if (uniform.value instanceof Matrix4) return 'm4';
        if (uniform.value instanceof Matrix3) return 'm3';
        if (uniform.value instanceof Color) return 'c';
        if (uniform.value instanceof Quaternion) return 'q';

        if (Array.isArray(uniform.value)) {
            if (uniform.value[0] instanceof Texture) return 'tv';
        }

        return 'f';
    }

    function setupBlending(shader) {
        if (_cached.blending != shader.blending) {
            switch (shader.blending) {
                case Shader.ADDITIVE_BLENDING:
                    _gl.blendEquation(_gl.FUNC_ADD);
                    _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE);
                    break;

                default:
                    _gl.blendEquationSeparate(_gl.FUNC_ADD, _gl.FUNC_ADD);
                    _gl.blendFuncSeparate(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA, _gl.ONE, _gl.ONE_MINUS_SRC_ALPHA);
                    break;
            }
            _cached.blending = shader.blending;
        }
    }

    function uniformTextureArray(uni, uLoc, shader) {
        let array = shader._gl.texArray || [];
        array.length = 0;
        shader._gl.texArray = array;

        for (let i = 0; i < uni.value.length; i++) {
            array.push(shader._gl.texIndex);

            let texture = uni.value[i];
            if (texture.loaded === false) texture = Utils3D.getEmptyTexture();
            if (texture._gl === undefined || texture.needsReupload) Texture.renderer.upload(texture);

            _gl.activeTexture(_gl[`TEXTURE${shader._gl.texIndex++}`]);
            _gl.bindTexture(_gl.TEXTURE_2D, texture._gl);
        }

        _gl.uniform1iv(uLoc, array);
    }

    //*** Event handlers

    //*** Public methods
    this.upload = function(shader) {
        if (!shader._gl) {
            shader._gl = {};
            let key = `${shader.vsName}_${shader.fsName}`;
            let cached = _pool[key];

            if (cached) {
                shader._gl.program = cached.program;
                shader._gl._id = cached.id;
                cached.count++;
            } else {
                shader._gl.program = createProgram(shader);
                shader._gl._id = _programID++;
                _pool[key] = {count: 1, program: shader._gl.program, id: shader._gl._id};
            }
        }

        setupShaders(shader);
        if (shader.ubo) shader.ubo.upload();
    }

    this.findCachedProgram = function(shader) {
        let key = `${shader.vsName}_${shader.fsName}`;
        let cached = _pool[key];

        if (cached) {
            shader._gl = {};
            shader._gl.program = cached.program;
            shader._gl._id = cached.id;
            if (_uboCache[shader.UILPrefix]) shader.ubo = shader.UILPrefix;
            cached.count++;
            return true;
        }

        return false;
    }

    this.draw = function(shader) {
        if (!shader._gl) this.upload(shader);

        shader._gl.texIndex = 0;

        if (shader._gl.program != _cached.program) _gl.useProgram(shader._gl.program);
        _cached.program = shader._gl.program;
        if (shader.ubo) shader.ubo.bind(shader._gl.program, 'ubo');

        for (let key in shader.uniforms) {
            let uni = shader.uniforms[key];
            if (typeof shader._gl[key] === 'undefined') setupShaders(shader);

            let uLoc = shader._gl[key];

            if (uni.value === null) uni.value = Utils3D.getEmptyTexture();

            if (uLoc === null || uLoc == -1 || uLoc == 'U') continue;

            if (!uni.type) uni.type = findUniformType(uni);
            switch (uni.type) {
                case 'f': _gl.uniform1f(uLoc, uni.value); break;
                case 'v2': _gl.uniform2f(uLoc, uni.value.x, uni.value.y); break;
                case 'v3': _gl.uniform3f(uLoc, uni.value.x, uni.value.y, uni.value.z); break;
                case 'c': _gl.uniform3f(uLoc, uni.value.r, uni.value.g, uni.value.b); break;
                case 'q': case 'v4': _gl.uniform4f(uLoc, uni.value.x, uni.value.y, uni.value.z, uni.value.w); break;
                case 'v3v': _gl.uniform3fv(uLoc, toTypedArray(uni)); break;
                case 'v2v': _gl.uniform2fv(uLoc, toTypedArray(uni)); break;
                case 'fv': _gl.uniform1fv(uLoc, toTypedArray(uni)); break;
                case 'm4': _gl.uniformMatrix4fv(uLoc, false, uni.value.elements); break;
                case 'm3': _gl.uniformMatrix3fv(uLoc, false, uni.value.elements); break;
                case 'tv': uniformTextureArray(uni, uLoc, shader); break;
                case 't':
                    let texture = uni.value;
                    if (!texture.isTexture) {
                        if (uni.value.rt) texture = uni.value.rt.overrideTexture || uni.value.rt.texture;
                        if (uni.value.texture) texture = uni.value.texture;
                    }
                    if (texture.loaded === false) texture = Utils3D.getEmptyTexture();
                    Texture.renderer.draw(texture, uLoc, key, shader._gl.texIndex++);
                    break;
            }
        }

        if (shader.polygonOffset) {
            let key = shader.polygonOffsetFactor+'_'+shader.polygonOffsetUnits;
            if (_cached.polygonOffset != key) {
                _gl.enable(_gl.POLYGON_OFFSET_FILL);
                _gl.polygonOffset(shader.polygonOffsetFactor, shader.polygonOffsetUnits);
            }
            _cached.polygonOffset = key;
        } else {
            if (_cached.polygonOffset) _gl.disable(_gl.POLYGON_OFFSET_FILL);
            _cached.polygonOffset = false;
        }

        if (shader.transparent) {
            if (!_cached.transparent) _gl.enable(_gl.BLEND);
            _cached.transparent = true;
        } else {
            if (_cached.transparent) _gl.disable(_gl.BLEND);
            _cached.transparent = false;
        }

        setupBlending(shader);

        if (shader.depthTest) {
            if (!_cached.depthTest) _gl.enable(_gl.DEPTH_TEST);
            _cached.depthTest = true;
        } else {
            if (_cached.depthTest) _gl.disable(_gl.DEPTH_TEST);
            _cached.depthTest = false;
        }

        switch (shader.side) {
            case Shader.BACK_SIDE:
                if (_cached.side != Shader.BACK_SIDE) {
                    _gl.enable(_gl.CULL_FACE);
                    _gl.cullFace(_gl.FRONT);
                    _cached.side = Shader.BACK_SIDE;
                }
                break;

            case Shader.DOUBLE_SIDE:
                if (_cached.side != Shader.DOUBLE_SIDE) {
                    _gl.disable(_gl.CULL_FACE);
                    _cached.side = Shader.DOUBLE_SIDE;
                }
                break;

            default:
                if (_cached.side != Shader.FRONT_SIDE) {
                    _gl.enable(_gl.CULL_FACE);
                    _gl.cullFace(_gl.BACK);
                    _cached.side = Shader.FRONT_SIDE;
                }
                break;
        }

        if (_cached.depthMask != shader.depthWrite) {
            _gl.depthMask(shader.depthWrite);
            _cached.depthMask = shader.depthWrite;
        }
    }

    this.destroy = function(shader) {
        if (shader.ubo) shader.ubo.destroy();
        let key = `${shader.vsName}_${shader.fsName}`;
        let cached = _pool[key];
        if (cached) {
            if (--cached.count == 0) _gl.deleteProgram(cached.program);
        }
    }

    this.appendUniform = function(shader, key, value, hint) {
        if (typeof shader._gl[key] === 'undefined') shader._gl[key] = _gl.getUniformLocation(shader._gl.program, key);

        if (shader._gl[key] === null) return;

        if (value instanceof Matrix4) {

            _gl.uniformMatrix4fv(shader._gl[key], false, value.elements);

        } else if (value instanceof Matrix3) {

            _gl.uniformMatrix3fv(shader._gl[key], false, value.elements);

        } else if (value instanceof Vector3) {

            _gl.uniform3f(shader._gl[key], value.x, value.y, value.z);

        } else if (value instanceof Vector2) {

            _gl.uniform2f(shader._gl[key], value.x, value.y);

        } else if (value instanceof Float32Array) {

            switch (hint) {
                case 'matrix':
                    _gl.uniformMatrix4fv(shader._gl[key], false, value);
                    break;

                case 'float':
                    _gl.uniform1fv(shader._gl[key], value);
                    break;

                case 'vec3':
                    _gl.uniform3fv(shader._gl[key], value);
                    break;
            }

        } else if (Array.isArray(value)) {

            let array = shader._gl.texArray || [];
            array.length = 0;
            shader._gl.texArray = array;

            for (let i = 0; i < value.length; i++) {
                array.push(shader._gl.texIndex);
                _gl.activeTexture(_gl[`TEXTURE${shader._gl.texIndex++}`]);
                _gl.bindTexture(_gl.TEXTURE_2D, value[i]._gl);
            }

            _gl.uniform1iv(shader._gl[key], array);

        } else {

            _gl.uniform1f(shader._gl[key], value);

        }

    }

    this.resetState = function() {
        if (!_cached.depthMask) {
            _gl.depthMask(true);
            _cached.depthMask = true;
        }

        if (!_cached.depthTest) _gl.enable(_gl.DEPTH_TEST);
        _cached.depthTest = true;
    }
});