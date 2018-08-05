Class(function ImageDecoder() {
    Inherit(this, Component);
    var _this = this;
    var _compressed;

    const ACTIVE = !!(window.fetch && window.createImageBitmap && Device.system.browser.includes('chrome') && !window.AURA);

    this.scale = 1;

    (async function() {
        await Hydra.ready();
        Thread.upload(decodeImage);
        Thread.upload(decodeCompressedImage);
    })();

    function decodeImage(data, id) {
        let run = async _ => {
            let e = await fetch(data.path);
            if (e.status != 200) throw `Image not found :: ${data.path}`;

            try {
                let blob = await e.blob();

                let obj = {imageOrientation: 'flipY'};
                if (data.params && data.params.premultiplyAlpha === false) obj.premultiplyAlpha = 'none';

                let bitmap = await createImageBitmap(blob, obj);
                let message = {post: true, id, message: bitmap};
                self.postMessage(message, [bitmap]);

            } catch(e) {
                throw `${data.path} could not be decoded`;
            }
        };

        run();
    }

    function decodeCompressedImage(data, id) {
        let run = async _ => {

            let config = await get(data.path + '/image.json');
            let ext = null;
            for (let key in data.settings) {
                if (ext) continue;
                if (data.settings[key]) ext = config[key];
            }

            if (ext == 'dtc1') ext = 'dxt1';

            let fileName = data.path.split('/');
            fileName = fileName[fileName.length-1];

            let e = await fetch(`${data.path}/${fileName}-${ext}.ktx`);
            if (e.status != 200) throw `Image not found :: ${data.path}`;

            try {
                let arrayBuffer = await e.arrayBuffer();
                let header = new Int32Array(arrayBuffer, 12, 13);

                let glType = header[1];
                let glTypeSize = header[2];
                let glFormat = header[3];
                let gliFormat = header[4];
                let glBaseInternalFormat = header[5];
                let width = header[6];
                let height = header[7];
                let miplevels = header[11];
                let bytesOfKeyValueData = header[12];

                let buffers = [];
                let compressedData = [];
                let sizes = [];

                let dataOffset = 12 + (13 * 4) + bytesOfKeyValueData;

                for (let level = 0; level < miplevels; level++) {
                    let imageSize = new Int32Array(arrayBuffer, dataOffset, 1)[0];
                    dataOffset += 4;

                    let byteArray = new Uint8Array(arrayBuffer, dataOffset, imageSize);

                    dataOffset += imageSize;
                    dataOffset += 3 - ((imageSize + 3) % 4);

                    sizes.push(width);
                    width = Math.max(1.0, width * 0.5);
                    height = Math.max(1.0, height * 0.5);

                    let clone = new Uint8Array(byteArray);

                    compressedData.push(clone);
                    buffers.push(clone.buffer);
                }

                resolve({gliFormat, compressedData, sizes}, id, buffers);

            } catch(e) {
                throw `${data.path} could not be decoded`;
            }
        };

        run();
    }

    function process(bitmap, scale) {
        let s = scale * _this.scale;
        if (s == 1) return bitmap;

        let pow2 = Math.isPowerOf2(bitmap.width, bitmap.height);

        let canvas = document.createElement('canvas');
        canvas.context = canvas.getContext('2d');
        canvas.width = Math.round(bitmap.width * _this.scale * scale);
        canvas.height = Math.round(bitmap.height * _this.scale * scale);

        if (pow2 && scale * _this.scale < 1) {
            canvas.width = Math.floorPowerOf2(canvas.width);
            canvas.height = Math.floorPowerOf2(canvas.height);
        }

        canvas.context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    //*** Event handlers

    //*** Public methods
    this.decode = async function(path, params = {}) {
        path = Thread.absolutePath(Assets.getPath(path));

        if (!path.slice(-5).includes('.')) {
            if (!_compressed) _compressed = {dxt: !!Renderer.extensions.s3tc, etc: !!Renderer.extensions.etc1, pvrtc: !!Renderer.extensions.pvrtc, astc: !!Renderer.extensions.astc};
            let obj = await Thread.shared().decodeCompressedImage({path, settings: _compressed});
            return obj;
        }

        let bitmap = await (ACTIVE ? Thread.shared().decodeImage({path, params}) : Assets.decodeImage(path, params));
        return process(bitmap, params.scale || 1);
    }
}, 'static');

/**
 * Decode images on a separate thread, preventing jank
 * @name ImageDecoder
 * @constructor
 * @example
 *
 * async function loadImage() {
        let canvas = await ImageDecoder.decode(_data.image);
        let texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        texture.minFilter = texture.magFilter = THREE.LinearFilter;
        _shader.set('tBG', texture);
    }
 **/