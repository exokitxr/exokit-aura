const {PlaneGeometry, Renderer, Shader, FBO, Texture, Vector2} = require('exokitgl');
const shaderCode = require('./camera-shaders');

const renderer = new Renderer();

function createImg(type) {
    return {src: type, _src: type};
}

class Camera {
    constructor() {
        this.lum = new Texture(createImg('EXOKIT_LUMINANCE'));
        this.chroma = new Texture(createImg('EXOKIT_CHROMA'));
        this.lum.dynamic = this.chroma.dynamic = true;

        this.renderer = new Renderer();
        this.geom = new PlaneGeometry(2, 2);
        this.fbo = new FBO(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);

        let scale = new Vector2(1, 1);

        const _this = this;
        window.addEventListener('resize', _ => {
            _this.fbo.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
        });

        this.shaders = {};

        ['landscapeLeft', 'landscapeRight', 'portraitUpsideDown', 'portrait'].forEach(name => {
            let cameraShader = new Shader(shaderCode.vs, shaderCode[name], {
                tChroma: {type: 't', value: _this.chroma},
                tLum: {type: 't', value: _this.lum},
                uScale: {type: 'v2', value: scale}
            });

            _this.shaders[name] = cameraShader;
        });

        this.shader = this.shaders.portrait;
    }

    get texture() {
        return this.fbo.texture;
    }

    set orientation(name) {
        this.shader = this.shaders[name];
    }

    draw() {
        this.fbo.bind();
        this.renderer.draw(this.shader, this.geom);
        this.fbo.unbind();
    }
}

exports = {Camera};
