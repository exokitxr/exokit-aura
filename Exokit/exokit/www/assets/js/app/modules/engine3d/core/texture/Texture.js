/**
 * @name Texture
 * @param {Image} img
 */

class Texture {
    constructor(img) {
        this.magFilter = Texture.LINEAR;
        this.minFilter = Texture.LINEAR_MIPMAP;
        this.format = Texture.RGBAFormat;
        this.wrapS = this.wrapT = Texture.CLAMP_TO_EDGE;
        this.image = img;
        this.needsUpdate = true;
        this.generateMipmaps = true;
        this.anisotropy = 1;
        this.type = Texture.UNSIGNED_BYTE;
        this.isTexture = true;

        /**
         * @name magFilter
         * @memberof Texture
         * @property
         */

        /**
         * @name minFilter
         * @memberof Texture
         * @property
         */

        /**
         * @name format
         * @memberof Texture
         * @property
         */

        /**
         * @name wrapS
         * @memberof Texture
         * @property
         */

        /**
         * @name wrapT
         * @memberof Texture
         * @property
         */

        /**
         * @name image
         * @memberof Texture
         * @property
         */

        /**
         * @name needsUpdate
         * @memberof Texture
         * @property
         */

        /**
         * @name generateMipmaps
         * @memberof Texture
         * @property
         */

        /**
         * @name anisotropy
         * @memberof Texture
         * @property
         */

        /**
         * @name type
         * @memberof Texture
         * @property
         */
    }

    upload() {
        if (!this._gl) Texture.renderer.upload(this);
    }

    destroy() {
        Texture.renderer.destroy(this);
    }

    clone() {
        let texture = new Texture(this.img);
        texture.format = this.format;
        texture.type = this.type;
        texture.anisotropy = this.anisotropy;
        texture.wrapS = this.wrapS;
        texture.wrapT = this.wrapT;
        texture.generateMipmaps = this.generateMipmaps;
        texture.minFilter = this.minFilter;
        texture.magFilter = this.magFilter;
        return texture;
    }
}

/**
 * @name DataTexture
 * @param {Float32Array} data
 * @param {Number} width
 * @param {Number} height
 * @param {String} format
 * @param {String} type
 */
class DataTexture extends Texture {
    constructor(data, width, height, format, type) {
        super();
        if (format) this.format = format;

        this.width = width;
        this.height = height;
        this.data = data;
        this.minFilter = this.magFilter = Texture.NEAREST;
        this.generateMipmaps = false;
        this.type = type || Texture.FLOAT;
    }
}

Texture.NEAREST = 'texture_nearest';
Texture.CLAMP_TO_EDGE = 'texture_clamp';
Texture.REPEAT = 'texture_repeat';
Texture.MIRROR_REPEAT = 'texture_mirror_repeat';
Texture.LINEAR = 'texture_linear';
Texture.LINEAR_MIPMAP = 'texture_linear_mip';
Texture.LINEAR_MIPMAP_NEAREST = 'texture_linear_mip_nearest';
Texture.NEAREST_MIPMAP = 'texture_nearest_mip';
Texture.RGBFormat = 'texture_rgbFormat';
Texture.RGBAFormat = 'texture_rgbaFormat';
Texture.UNSIGNED_BYTE = 'texture_unsigned_byte';
Texture.DEPTH = 'texture_depth';
Texture.FLOAT = 'texture_float';
Texture.HALF_FLOAT = 'texture_half_float';

/**
 * @name Texture.NEAREST
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.CLAMP_TO_EDGE
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.REPEAT
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.LINEAR
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.LINEAR_MIPMAP
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.LINEAR_MIPMAP_NEAREST
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.NEAREST_MIPMAP
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.RGBFormat
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.RGBAFormat
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.UNSIGNED_BYTE
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.DEPTH
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.FLOAT
 * @memberof Texture
 * @property
 */

/**
 * @name Texture.HALF_FLOAT
 * @memberof Texture
 * @property
 */