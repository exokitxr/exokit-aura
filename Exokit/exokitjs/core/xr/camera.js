const {PlaneGeometry, Renderer, Shader, FBO} = require('exokitgl');
const shaderCode = require('./camera-shaders');

const renderer = new Renderer();

class PerspectiveCamera {
    constructor() {
        this.lum = new Texture('EXOKIT_LUMINANCE');
        this.chroma = new Texture('EXOKIT_CHROMA');
        this.lum.dynamic = this.chroma.dynamic = true;

        this.renderer = new Renderer();
        this.geom = new PlaneGeometry(2, 2);
        this.fbo = new FBO(screen.width * window.devicePixelRatio, screen.height * window.devicePixelRatio);

        const _this = this;
        window.addEventListener('resize', _ => {
            _this.fbo.setSize(screen.width * window.devicePixelRatio, screen.height * window.devicePixelRatio);
        });

        this.shaders = {};

        ['landscapeLeft', 'landscapeRight', 'portraitUpsideDown', 'portrait'].forEach(name => {
            let cameraShader = new Shader(shaderCode.vs, shaderCode[name], {
                tChroma: {type: 't', value: _this.lum},
                tLum: {type: 't', value: _this.chroma}
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

exports = {PerspectiveCamera};
