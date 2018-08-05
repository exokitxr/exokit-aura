Class(function GLText({

    // Generation props
    font,
    text,
    width = Infinity,
    align = 'left',
    size = 1,
    letterSpacing = 0,
    lineHeight = 1.4,
    wordSpacing = 0,
    wordBreak = false,

    // Shader props
    color = new Color('#000000'),
    alpha = 1,
}) {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        init();
    })();

    function init() {
        _this.charLength = text.length;
        _this.text = new GLTextGeometry({font, text, width, align, wordSpacing, letterSpacing, size, lineHeight, wordBreak});

        _this.text.loaded.then(({buffers, image, height, numLines}) => {
            _this.texture = GLText.getTexture(image);

            _this.shader = _this.initClass(Shader, 'DefaultText', {
                tMap: {value: _this.texture},
                uColor: {value: color},
                uAlpha: {value: alpha},
                transparent: true,
            });

            _this.geometry = new Geometry();
            _this.geometry.addAttribute('position', new GeometryAttribute(buffers.position, 3));
            _this.geometry.addAttribute('uv', new GeometryAttribute(buffers.uv, 2));
            _this.geometry.addAttribute('id', new GeometryAttribute(buffers.id, 1));
            _this.geometry.setIndex(new GeometryAttribute(buffers.index, 1));
            _this.geometry.boundingBox = buffers.boundingBox;

            _this.mesh = new Mesh(_this.geometry, _this.shader);
            _this.height = height;

            _this.add(_this.mesh);
        });
    }

    function setVars(options) {
        let o = Object.assign(options, {font, width, align, wordSpacing, letterSpacing, size, lineHeight, wordBreak});
        font = o.font;
        width = o.width;
        align = o.align;
        wordSpacing = o.wordSpacing;
        letterSpacing = o.letterSpacing;
        size = o.size;
        lineHeight = o.lineHeight;
        wordBreak = o.wordBreak;
    }

    //*** Event handlers

    //*** Public methods
    this.onDestroy = function() {
        _this.mesh.destroy();
    }

    this.ready = function() {
        return _this.text.loaded;
    }

    this.centerY = function() {
        _this.mesh.position.y = _this.height * 0.5;
        _this.flag('centerY', true);
    }

    this.resize = function(options) {
        this.setText(text, options);
    }

    this.setColor = function(color) {
        _this.shader.uniforms.uColor.value.set(color);
    }

    this.setText = function(txt, options = {}) {
        if (text == txt) return;
        text = txt;
        setVars(options);

        _this.charLength = text.length;
        _this.text = new GLTextGeometry({font, text, width, align, wordSpacing, letterSpacing, size, lineHeight, wordBreak});

        _this.text.loaded.then(({buffers, image, height, numLines}) => {
            _this.geometry.destroy(_this.mesh);

            _this.geometry = new Geometry();
            _this.geometry.addAttribute('position', new GeometryAttribute(buffers.position, 3));
            _this.geometry.addAttribute('uv', new GeometryAttribute(buffers.uv, 2));
            _this.geometry.addAttribute('id', new GeometryAttribute(buffers.id, 1));
            _this.geometry.setIndex(new GeometryAttribute(buffers.index, 1));
            _this.geometry.boundingBox = buffers.boundingBox;

            _this.mesh.geometry = _this.geometry;
            _this.height = height;

            if (_this.flag('centerY')) _this.centerY();
        });
    }
}, _ => {
    var _map = new Map();
    GLText.getTexture = function(image) {
        if (!_map.get(image)) {
            let texture = new Texture(image);
            texture.generateMipmaps = false;
            texture.minFilter = Texture.LINEAR;

            _map.set(image, texture);
        }

        return _map.get(image);
    }
});