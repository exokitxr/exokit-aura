Class(function TextureRendererWebGL() {
    const _this = this;

    var _gl = Renderer.context;
    var _state = {};

    const DATA = new Uint8Array([255, 255, 255, 255]);

    const {getFormat, getProperty, getType, getFloatParams} = require('GLTypes');

    function uploadCube(texture) {
        if (typeof texture._gl === 'undefined') {
            texture._gl = _gl.createTexture();

            _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, texture._gl);

            if (!_state.flipY) {
                _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
                _state.flipY = true;
            }

            setTextureParams(texture, _gl.TEXTURE_CUBE_MAP);
        }

        let format = getFormat(texture);
        for (let i = 0; i < 6; i++) {
            _gl.texImage2D(_gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, format, format, getType(texture), texture.cube[i]);
        }
        _gl.generateMipmap(_gl.TEXTURE_CUBE_MAP);

        texture.needsUpdate = texture.needsReupload = false;
        if (texture.onUpdate) texture.onUpdate();
    }

    function setTextureParams(texture, textureType = _gl.TEXTURE_2D) {
        let format = getFormat(texture);
        if (textureType == _gl.TEXTURE_2D && !texture.compressed) _gl.texImage2D(textureType, 0, format, 1, 1, 0, format, _gl.UNSIGNED_BYTE, DATA);
        _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_S, getProperty(texture.wrapS));
        _gl.texParameteri(textureType, _gl.TEXTURE_WRAP_T, getProperty(texture.wrapT));
        _gl.texParameteri(textureType, _gl.TEXTURE_MAG_FILTER, getProperty(texture.magFilter));
        _gl.texParameteri(textureType, _gl.TEXTURE_MIN_FILTER, getProperty(texture.minFilter));

        if (!window.AURA && !texture.data && texture.format == Texture.RGBAFormat) {
            if (texture.premultiplyAlpha === false) {
                _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                _state.premultiply = false;
            } else {
                _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                _state.premultiply = true;
            }
        }

        if (texture.anisotropy > 1) _gl.texParameterf(_gl.TEXTURE_2D, Renderer.extensions.anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, texture.anisotropy);
    }

    function updateDynamic(texture) {
        if (texture.type.includes('float')) {
            if (_state.flipY) {
                _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, false);
                _state.flipY = false;
            }

            if (_state.premultiply) {
                _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                _state.premultiply = true;
            }

            let {format, type} = getFloatParams(texture);
            _gl.texSubImage2D(_gl.TEXTURE_2D, 0, 0, 0, texture.width, texture.height, format, type, texture.data);
        } else {

            if (!_state.flipY) {
                _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
                _state.flipY = true;
            }

            if (texture.format == Texture.RGBAFormat) {
                if (!_state.premultiply) {
                    _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                    _state.premultiply = true;
                }
            } else {
                if (_state.premultiply) {
                    _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
                    _state.premultiply = false;
                }
            }

            let format = getFormat(texture);
            _gl.texImage2D(_gl.TEXTURE_2D, 0, format, format, getType(texture), texture.image);
        }
    }

    //*** Event handlers

    //*** Public methods
    this.draw = function(texture, loc, key, id) {
        if (texture._gl === undefined || texture.needsReupload) this.upload(texture);

        _gl.activeTexture(_gl[`TEXTURE${id}`]);

        if (texture.cube) {
          _gl.bindTexture(_gl.TEXTURE_CUBE_MAP, texture._gl);
        } else {
            if (texture.EXT_OES && _gl._bindOESTexture) _gl._bindOESTexture(texture._gl);
            else _gl.bindTexture(_gl.TEXTURE_2D, texture._gl);
        }

        _gl.uniform1i(loc, id);

        if (texture.dynamic || texture.needsUpdate) updateDynamic(texture);
        texture.needsUpdate = false;
    }

    this.upload = function(texture) {
        let format = getFormat(texture);

        if (!!texture.cube) {
            if (texture.cube.length != 6) throw 'Cube texture requires 6 images';
            return uploadCube(texture);
        }

        if (typeof texture._gl === 'undefined') {
            texture._gl = _gl.createTexture();
            if (texture.EXT_OES && _gl._bindOESTexture) return _gl._bindOESTexture(texture._gl);

            _gl.bindTexture(_gl.TEXTURE_2D, texture._gl);
            setTextureParams(texture, _gl.TEXTURE_2D);
        } else {
            _gl.bindTexture(_gl.TEXTURE_2D, texture._gl);
        }

        if (texture.type.includes('float')) {

            _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, 1);
            let {internalformat, format, type} = getFloatParams(texture);
            _gl.texImage2D(_gl.TEXTURE_2D, 0, internalformat, texture.width, texture.height, 0, format, type, texture.data);

        } else {

            if (!_state.flipY) {
                _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
                _state.flipY = true;
            }

            if (texture.image && texture.compressed) {
                let data = texture.image.compressedData;
                for (let i = 0; i < data.length; i++) {
                    let size = texture.image.sizes[i];
                    _gl.compressedTexImage2D(_gl.TEXTURE_2D, i, texture.image.gliFormat, size, size, 0, data[i]);
                }
                data.length = 0;
            } else if (texture.image) {
                _gl.texImage2D(_gl.TEXTURE_2D, 0, format, format, getType(texture), texture.image);
            }

        }

        if ((texture.image || texture.data)
            && texture.generateMipmaps && !texture.compressed) _gl.generateMipmap(_gl.TEXTURE_2D);

        texture.needsUpdate = texture.needsReupload = false;
        if (texture.onUpdate) texture.onUpdate();
    }

    this.destroy = function(texture) {
        if (texture._gl) _gl.deleteTexture(texture._gl);
        delete texture._gl;
    }
});