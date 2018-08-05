Module(function GLTypes() {
    function getFormat(texture) {
        let _gl = Renderer.context;
        return texture.format == Texture.RGBAFormat ? _gl.RGBA : _gl.RGB;
    }

    function getProperty(property) {
        let _gl = Renderer.context;
        switch (property) {
            case Texture.NEAREST: return _gl.NEAREST; break;
            case Texture.LINEAR: return _gl.LINEAR; break;
            case Texture.LINEAR_MIPMAP: return _gl.LINEAR_MIPMAP_LINEAR; break;
            case Texture.NEAREST_MIPMAP: return _gl.NEAREST_MIPMAP_LINEAR; break;
            case Texture.LINEAR_MIPMAP_NEAREST: return _gl.LINEAR_MIPMAP_NEAREST; break;
            case Texture.CLAMP_TO_EDGE: return _gl.CLAMP_TO_EDGE; break;
            case Texture.REPEAT: return _gl.REPEAT; break;
            case Texture.MIRROR_REPEAT: return _gl.MIRRORED_REPEAT; break;
        }
    }

    function getType(texture) {
        let _gl = Renderer.context;
        switch (texture.type) {
            case Texture.FLOAT:
                return _gl.FLOAT;
                break;

            case Texture.HALF_FLOAT:
                if (Renderer.type == Renderer.WEBGL2) return _gl.HALF_FLOAT;
                else return Renderer.extensions.halfFloat.HALF_FLOAT_OES;
                break;

            default:
                return _gl.UNSIGNED_BYTE;
                break;
        }
    }

    function getFloatParams(texture) {
        let _gl = Renderer.context;
        let internalformat = (function() {
            if (Renderer.type == Renderer.WEBGL2) {
                switch (texture.type) {
                    case Texture.HALF_FLOAT:
                        return texture.format == Texture.RGBAFormat ? _gl.RGBA16F : _gl.RGB16F;

                    case Texture.FLOAT:
                        return texture.format == Texture.RGBAFormat ? _gl.RGBA32F : _gl.RGB32F;
                        break;
                }
            } else {
                return texture.format == Texture.RGBAFormat ? _gl.RGBA : _gl.RGB;
            }
        })();

        let format = texture.format == Texture.RGBAFormat ? _gl.RGBA : _gl.RGB;

        let type = getType(texture);

        return {internalformat, format, type};
    }

    this.exports = {
        getFormat,
        getProperty,
        getType,
        getFloatParams
    };
});