let yuv2rgb = `
uniform sampler2D tLum;
uniform sampler2D tChroma;
uniform vec2 uScale;

vec2 transformUV(vec2 uv, float a[9]) {
	vec3 u = vec3(uv, 1.0);
    mat3 mo1 = mat3(
        1, 0, -a[7],
        0, 1, -a[8],
        0, 0, 1);

    mat3 mo2 = mat3(
        1, 0, a[7],
        0, 1, a[8],
        0, 0, 1);

    mat3 mt = mat3(
        1, 0, -a[0],
        0, 1, -a[1],
    	0, 0, 1);

    mat3 mh = mat3(
        1, a[2], 0,
        a[3], 1, 0,
    	0, 0, 1);

    mat3 mr = mat3(
        cos(a[4]), sin(a[4]), 0,
        -sin(a[4]), cos(a[4]), 0,
    	0, 0, 1);

    mat3 ms = mat3(
        1.0 / a[5], 0, 0,
        0, 1.0 / a[6], 0,
    	0, 0, 1);

   	u = u * mt;

   	u = u * mh;

    u = u * mo1;
    u = u * mr;
    u = u * mo2;

    u = u * mo1;
    u = u * ms;
    u = u * mo2;

    return u.xy;
}

vec2 scaleUV(vec2 uv, vec2 scale) {
    float a[9];
    a[0] = 0.0;
    a[1] = 0.0;
    a[2] = 0.0;
    a[3] = 0.0;
    a[4] = 0.0;
    a[5] = scale.x;
    a[6] = scale.y;
    a[7] = 0.5;
    a[8] = 0.5;

    return transformUV(uv, a);
}

const mat3 yuv2rgb = mat3(
                          1, 0, 1.2802,
                          1, -0.214821, -0.380589,
                          1, 2.127982, 0
                          );

vec4 getRGB(vec2 uv) {
    vec4 lum = texture(tLum, uv);
    vec4 chroma = texture(tChroma, uv);

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

    uv = scaleUV(uv, uScale);

    FragColor = getRGB(uv);
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

    uv = scaleUV(uv, uScale);

    FragColor = getRGB(uv);
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

    uv = scaleUV(uv, uScale);

    FragColor = getRGB(uv);
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

    uv = scaleUV(uv, uScale);

    FragColor = getRGB(uv);
}
`;

exports = {
    vs,
    landscapeLeft,
    landscapeRight,
    portrait,
    portraitUpsideDown
};
