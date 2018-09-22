function initialize(_gl) {
    _gl.getContextAttributes = function() {
        return {};
    };

    _gl.isContextLost = function() {
        return false;
    };

    _gl.getParameter = function(param) {
        switch (param) {
            case _gl.RENDERER:
            case _gl.SHADING_LANGUAGE_VERSION:
            case _gl.VENDOR:
            case _gl.EXTENSIONS:
            return _gl._getString(param);
            break;

            case _gl.DEPTH_WRITEMASK:
            return _gl._getBoolean(param);
            break;

            case _gl.VERSION:
            if (_gl.type.includes('2')) return 'WebGL 2.0';
            return 'WebGL 1.0';
            break;
        }

        return _gl._getParameter(param);
    }

    _gl.bindVertexArray = function(buffer) {
        _gl._bindVertexArray(buffer || EXOKIT._emptyVertexArray);
    };

    _gl.bindBuffer = function(target, buffer) {
        _gl._bindBuffer(target, buffer || EXOKIT._emptyBuffer);
    };

    _gl.bindFramebuffer = function(target, buffer) {
        _gl._bindFramebuffer(target, buffer || EXOKIT._emptyFrameBuffer);
    };

    _gl.bindRenderbuffer = function(target, buffer) {
        _gl._bindRenderbuffer(target, buffer || EXOKIT._emptyRenderBuffer);
    };

    _gl.bindTexture = function(target, buffer) {
        _gl._bindTexture(target, buffer || EXOKIT._emptyTexture);
    };

    _gl.pixelStorei = function(p0, p1) {
        if (typeof p1 === 'number') _gl._pixelStorei(p0, p1);
        else _gl._pixelStoreiBool(p0, p1);
    }

    _gl.texImage2D = function(p0, p1, p2, p3, p4, p5, p6, p7, p8) {
        let info = EXOKIT._img;
        let image = p6 ? p8 : p5;
        if (image._arraybuffer) {
            info.flipped = image.flipped;
            info.premultiply = image.premultiply;
        }

        if (p6) {
            _gl._texImage2DLong(p0, p1, p2, p3, p4, p5, p6, p7, p8.buffer);
        } else {
            if (!!p5.resource) _gl._texImage2DResource(p5.resource, p0, p1, p2, p3, p4);
            else if (p5.buffer) _gl._texImage2DShort(p0, p1, p2, p3, p4, p5.buffer, info);
        }
    };

    _gl.uniform1i = function(location, x) {
        if (typeof x === 'boolean') {
            x = !!x ? 1 : 0;
        }

        _gl._uniform1i(location, x);
    };

    _gl.getExtension = function(name) {
        switch (name) {
            case 'ANGLE_instanced_arrays':
            return {
                drawElementsInstancedANGLE: _gl.drawElementsInstanced,
                drawArraysInstancedANGLE: _gl.drawArraysInstanced,
                vertexAttribDivisorANGLE: _gl.vertexAttribDivisor
            };
            break;

            case 'OES_texture_half_float':
            return {'HALF_FLOAT_OES': _gl.HALF_FLOAT_OES};
            break;

            case 'OES_standard_derivatives':
            case 'EXT_color_buffer_float':
            return {};
            break;

            case 'WEBGL_depth_texture':
            return {UNSIGNED_INT_24_8_WEBGL: _gl.GL_UNSIGNED_INT_24_8_OES};
            break;

            case 'EXT_texture_filter_anisotropic':
            return {
                MAX_TEXTURE_MAX_ANISOTROPY_EXT: _gl.GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT,
                TEXTURE_MAX_ANISOTROPY_EXT: _gl.GL_TEXTURE_MAX_ANISOTROPY_EXT
            };
            break;

            case 'WEBGL_compressed_texture_pvrtc':
            return {
                COMPRESSED_RGB_PVRTC_4BPPV1_IMG: _gl.GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
                COMPRESSED_RGBA_PVRTC_4BPPV1_IMG: _gl.GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
                COMPRESSED_RGB_PVRTC_2BPPV1_IMG: _gl.GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
                COMPRESSED_RGBA_PVRTC_2BPPV1_IMG: _gl.GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
            };

            case 'WEBGL_draw_buffers':
            let obj = {};
            for (let i = 0; i < 16; i++) {
                obj['DRAW_BUFFER'+i+'_WEBGL'] = _gl['DRAW_BUFFER'+i];
                obj['COLOR_ATTACHMENT'+i+'_WEBGL'] = _gl['COLOR_ATTACHMENT'+i];
            }
            obj.MAX_COLOR_ATTACHMENTS_WEBGL = _gl.MAX_COLOR_ATTACHMENTS;
            obj.MAX_DRAW_BUFFERS_WEBGL = _gl.MAX_DRAW_BUFFERS;
            return obj;
            break;

            case 'WEBGL_debug_renderer_info':
            return {
                UNMASKED_RENDERER_WEBGL: _gl.RENDERER,
                UNMASKED_VENDOR_WEBGL: _gl.VENDOR
            };
            break;
        }
    }

    _gl.bufferSubData = function(p0, p1, p2, p3) {
        if (!p3) p3 = p2.length;
        _gl._bufferSubData(p0, p1, p2, p3);
    }
}

exports = {
    initialize
};
