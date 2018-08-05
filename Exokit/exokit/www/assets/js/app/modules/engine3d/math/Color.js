/**
 * @name Color
 */

class Color {
    constructor(r, g, b) {
        if (r == undefined && g == undefined && b == undefined) return this.setRGB(1, 1, 1);

        if ( g === undefined && b === undefined ) {
            return this.set( r );
        }

        this.setRGB( r, g, b );
    }

    /**
     * @name set
     * @memberof Color
     *
     * @function
     * @param {*} value
     * @return {Color}
     */
    set(value) {
        if ( value && value instanceof Color ) {
            this.copy( value );
        } else if ( typeof value === 'number' ) {
            this.setHex( value );
        } else if ( typeof value === 'string' ) {
            this.setStyle( value );
        }

        return this;
    }

    /**
     * @name setScalar
     * @memberof Color
     *
     * @function
     * @param {Number} value
     * @return {Color}
     */
    setScalar(scalar) {
        this.r = scalar;
        this.g = scalar;
        this.b = scalar;

        return this;
    }

    /**
     * @name setHex
     * @memberof Color
     *
     * @function
     * @param {Number} hex
     * @return {Color}
     */
    setHex(hex) {
        hex = Math.floor( hex );

        this.r = ( hex >> 16 & 255 ) / 255;
        this.g = ( hex >> 8 & 255 ) / 255;
        this.b = ( hex & 255 ) / 255;

        return this;
    }

    /**
     * @name setStyle
     * @memberof Color
     *
     * @function
     * @param {String} value
     * @return {Color}
     */
    setStyle(string) {
        return this.setHex(Number(string.replace('#', '0x')));
    }

    /**
     * @name setRGB
     * @memberof Color
     *
     * @function
     * @param {Number} r
     * @param {Number} g
     * @param {Number} b
     * @return {Color}
     */
    setRGB(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;

        return this;
    }

    /**
     * @name setHSL
     * @memberof Color
     *
     * @function
     * @param {Number} h
     * @param {Number} s
     * @param {Number} l
     * @return {Color}
     */
    setHSL(h, s, l) {
        function hue2rgb( p, q, t ) {
            if ( t < 0 ) t += 1;
            if ( t > 1 ) t -= 1;
            if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
            if ( t < 1 / 2 ) return q;
            if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
            return p;
        }

        h = Math.euclideanModulo( h, 1 );
        s = Math.clamp( s, 0, 1 );
        l = Math.clamp( l, 0, 1 );

        if ( s === 0 ) {

            this.r = this.g = this.b = l;

        } else {

            let p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
            let q = ( 2 * l ) - p;

            this.r = hue2rgb( q, p, h + 1 / 3 );
            this.g = hue2rgb( q, p, h );
            this.b = hue2rgb( q, p, h - 1 / 3 );

        }

        return this;
    }

    /**
     * @name clone
     * @memberof Color
     *
     * @function
     * @return {Color}
     */
    clone() {
        return new Color(this.r, this.g, this.b);
    }

    copy(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;

        return this;
    }

    copyGammaToLinear(color, gammaFactor) {
        if ( gammaFactor === undefined ) gammaFactor = 2.0;

        this.r = Math.pow( color.r, gammaFactor );
        this.g = Math.pow( color.g, gammaFactor );
        this.b = Math.pow( color.b, gammaFactor );

        return this;
    }

    copyLinearToGamma(color, gammaFactor) {
        if ( gammaFactor === undefined ) gammaFactor = 2.0;

        let safeInverse = ( gammaFactor > 0 ) ? ( 1.0 / gammaFactor ) : 1.0;

        this.r = Math.pow( color.r, safeInverse );
        this.g = Math.pow( color.g, safeInverse );
        this.b = Math.pow( color.b, safeInverse );

        return this;
    }

    convertGammaToLinear(gammaFactor) {
        this.copyGammaToLinear( this, gammaFactor );
        return this;
    }

    convertLinearToGamma(gammaFactor) {
        this.copyLinearToGamma( this, gammaFactor );
        return this;
    }

    /**
     * @name getHex
     * @memberof Color
     *
     * @function
     * @return {Number}
     */
    getHex() {
        return ( this.r * 255 ) << 16 ^ ( this.g * 255 ) << 8 ^ ( this.b * 255 ) << 0;
    }

    /**
     * @name getHexString
     * @memberof Color
     *
     * @function
     * @return {String}
     */
    getHexString() {
        return '#' + ( '000000' + this.getHex().toString( 16 ) ).slice( - 6 );
    }

    /**
     * @name getHSL
     * @memberof Color
     *
     * @function
     * @return {Object}
     */
    getHSL() {
        let target = this.target || {};
        this.target = target;

        let r = this.r, g = this.g, b = this.b;

        let max = Math.max( r, g, b );
        let min = Math.min( r, g, b );

        let hue, saturation;
        let lightness = ( min + max ) / 2.0;

        if ( min === max ) {

            hue = 0;
            saturation = 0;

        } else {

            let delta = max - min;

            saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );

            switch ( max ) {

                case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
                case g: hue = ( b - r ) / delta + 2; break;
                case b: hue = ( r - g ) / delta + 4; break;

            }

            hue /= 6;

        }

        target.h = hue;
        target.s = saturation;
        target.l = lightness;

        return target;
    }

    /**
     * @name offsetHSL
     * @memberof Color
     *
     * @function
     * @param {Number} h
     * @param {Number} s
     * @param {Number} l
     * @return {Color}
     */
    offsetHSL(h, s, l) {
        let hsl = this.getHSL();
        hsl.h += h; hsl.s += s; hsl.l += l;
        this.setHSL( hsl.h, hsl.s, hsl.l );
        return this;
    }

    /**
     * @name add
     * @memberof Color
     *
     * @function
     * @param {Color} color
     * @return {Color}
     */
    add(color) {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;

        return this;
    }

    /**
     * @name addColors
     * @memberof Color
     *
     * @function
     * @param {Color} color
     * @param {Color} color2
     * @return {Color}
     */
    addColors(color1, color2) {
        this.r = color1.r + color2.r;
        this.g = color1.g + color2.g;
        this.b = color1.b + color2.b;

        return this;
    }

    /**
     * @name addScalar
     * @memberof Color
     *
     * @function
     * @param {Number} scalar
     * @return {Color}
     */
    addScalar(s) {
        this.r += s;
        this.g += s;
        this.b += s;

        return this;
    }

    sub(color) {
        this.r = Math.max( 0, this.r - color.r );
        this.g = Math.max( 0, this.g - color.g );
        this.b = Math.max( 0, this.b - color.b );

        return this;
    }

    multiply(color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;

        return this;
    }

    multiplyScalar(s) {
        this.r *= s;
        this.g *= s;
        this.b *= s;

        return this;
    }

    /**
     * @name lerp
     * @memberof Color
     *
     * @function
     * @param {Color} color
     * @param {Number} alpha
     * @return {Color}
     */
    lerp(color, alpha) {
        this.r += ( color.r - this.r ) * alpha;
        this.g += ( color.g - this.g ) * alpha;
        this.b += ( color.b - this.b ) * alpha;

        return this;
    }

    equals(c) {
        return ( c.r === this.r ) && ( c.g === this.g ) && ( c.b === this.b );
    }

    /**
     * @name fromArray
     * @memberof Color
     *
     * @function
     * @param {Array} array
     * @param {Number} offset
     * @return {Color}
     */
    fromArray(array, offset) {
        if ( offset === undefined ) offset = 0;

        this.r = array[ offset ];
        this.g = array[ offset + 1 ];
        this.b = array[ offset + 2 ];

        return this;
    }

    /**
     * @name toArray
     * @memberof Color
     *
     * @function
     * @param {Array} array
     * @param {Number} offset
     * @return {Array}
     */
    toArray(array, offset) {
        if ( array === undefined ) array = [];
        if ( offset === undefined ) offset = 0;

        array[ offset ] = this.r;
        array[ offset + 1 ] = this.g;
        array[ offset + 2 ] = this.b;

        return array;
    }
}