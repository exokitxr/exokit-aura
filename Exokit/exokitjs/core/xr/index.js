const {PlaneGeometry, Renderer, Shader, FBO} = require('exokitgl');
const camera = require('./camera');

let renderer = new Renderer();

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

uniform sampler2D tMap;

void main() {
    FragColor = texture(tMap, vUv);
}
`;

function init() {
    camera.init();
    camera.draw();

    let geom = new PlaneGeometry(2, 2);
    let shader = new Shader(vs, fs, {
        tMap: {type: 't', value: camera.getFBO().texture}
    });

    renderer.draw(shader, geom);
}

exports = {
    init
}
