let yuv2rgb = `
uniform sampler2D tLum;
uniform sampler2D tChroma;

const mat3 yuv2rgb = mat3(
                          1, 0, 1.2802,
                          1, -0.214821, -0.380589,
                          1, 2.127982, 0
                          );

vec4 getRGB(vec2 uv) {
    vec4 lum = texture(tChroma, uv);
    vec4 chroma = texture(tLum, uv);

    vec3 yuv = vec3(
                        1.1643 * (lum.r - 0.0625),
                        chroma.r - 0.5,
                        chroma.a - 0.5
                        );

    vec3 rgb = yuv * yuv2rgb;
    return vec4(rgb, 1.0);
}`;

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

let landscapeLeft = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 FragColor;

${yuv2rgb}

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    FragColor = getRGB(uv)
}
`;

let landscapeRight = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 FragColor;

${yuv2rgb}

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = 1.0 - c.x;
    uv.y = 1.0 - c.y;

    FragColor = getRGB(uv)
}
`;

let portrait = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 FragColor;

${yuv2rgb}

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = c.y;
    uv.y = 1.0 - c.x;

    FragColor = getRGB(uv)
}
`;

let portraitUpsideDown = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 FragColor;

${yuv2rgb}

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = 1.0 - c.y;
    uv.y = c.x;

    FragColor = getRGB(uv)
}
`;

exports = {
    vs,
    landscapeLeft,
    landscapeRight,
    portrait,
    portraitUpsideDown
};
