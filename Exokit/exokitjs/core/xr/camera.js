const {PlaneGeometry, Renderer, Shader, FBO} = require('exokitgl');

const renderer = new Renderer();

let vs = `#version 300 es
precision highp float;
precision highp int;
in vec3 position;
in vec2 uv;
out vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

let fs = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 FragColor;

void main() {
    FragColor = vec4(vUv, 1.0, 1.0);
}
`;

class Camera {
    constructor() {
        this.lum = new Texture('EXOKIT_LUMINANCE');
        this.chroma = new Texture('EXOKIT_CHROMA');
        this.lum.dynamic = this.chroma.dynamic = true;

        this.renderer = new Renderer();
        this.geom = new PlaneGeometry(2, 2);
        this.shader = new Shader(vs, fs);
        this.fbo = new FBO(screen.width * window.devicePixelRatio, screen.height * window.devicePixelRatio);

        const _this = this;
        window.addEventListener('resize', _ => {
            _this.fbo.setSize(screen.width * window.devicePixelRatio, screen.height * window.devicePixelRatio);
        });
    }

    get texture() {
        return this.fbo.texture;
    }

    draw() {
        this.fbo.bind();
        this.renderer.draw(this.shader, this.geom);
        this.fbo.unbind();
    }
}

exports = {Camera};
