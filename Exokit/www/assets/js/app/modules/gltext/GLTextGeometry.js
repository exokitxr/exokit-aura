Class(function GLTextGeometry({
     font,
     text,
     width = Infinity,
     align = 'left',
     size = 1,
     letterSpacing = 0,
     lineHeight = 1.4,
     wordSpacing = 0,
     wordBreak = false,
 }) {
    let _this = this;
    let json, image, glyphs, buffers;
    let fontHeight, baseline, scale;

    _this.loaded = Promise.create();

    (async function init() {
        await loadFont();
        createGeometry();
    })();

    async function loadFont() {
        [json, image, glyphs] = await GLTextGeometry.loadFont(font);
    }

    async function createGeometry() {
        let buffers = await Thread.shared().loadTextGeometry({font, text, width, align, size, letterSpacing, lineHeight, wordSpacing, wordBreak, json, glyphs});
        buffers.id = buffers.aid;
        delete buffers.aid;

        _this.buffers = buffers;
        _this.image = image;
        _this.numLines = buffers.lineLength;
        _this.height = _this.numLines * size * lineHeight;

        _this.onLayout && _this.onLayout(buffers, image, _this.height, _this.numLines);

        _this.loaded.resolve({buffers, image, height: _this.height, numLines: _this.numLines});
    }
}, _ => {
    async function loadJSON(font) {
        return await (await fetch(Assets.getPath(`assets/fonts/${font}.json`))).json();
    }

    async function loadImage(font) {
        return await new Promise(resolve => {
            let img = new Image();
            img.onload = () => resolve(img);
            img.src = Assets.getPath(`assets/fonts/${font}.png`);
        });
    }

    var _promises = {};
    GLTextGeometry.loadFont = function(font) {
        if (!_promises[font]) {
            let promise = Promise.create();
            _promises[font] = promise;

            (async function() {
                let [json, image] = await Promise.all([loadJSON(font), loadImage(font)]);
                glyphs = {};
                json.chars.forEach(d => glyphs[d.char] = d);
                promise.resolve([json, image, glyphs]);
            })();
        }

        return _promises[font];
    }
});