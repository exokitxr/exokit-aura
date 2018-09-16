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

let geom, shader, fbo;

function init() {
    geom = new PlaneGeometry(2, 2);
    shader = new Shader(vs, fs);
    fbo = new FBO(screen.width * window.devicePixelRatio, screen.height * window.devicePixelRatio);

    window.addEventListener('resize', _ => {
        fbo.setSize(screen.width * window.devicePixelRatio, screen.height * window.devicePixelRatio);
    });
}

function draw() {
    fbo.bind();
    renderer.draw(shader, geom);
    fbo.unbind();
}

function getFBO() {
    return fbo;
}

exports = {
    draw,
    init,
    getFBO
}
