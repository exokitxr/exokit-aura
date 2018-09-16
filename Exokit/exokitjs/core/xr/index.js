const {PlaneGeometry, Renderer, Shader, FBO, Matrix4, Vector3, Vector2, Quaternion, Euler, Group, PerspectiveCamera} = require('exokitgl');
const {Camera} = require('./camera');

let renderer = new Renderer();
let rotation = new Euler();
let cameraGroup = new Group();
let nullGroup = new Group();
let quaternion = new Quaternion();
let euler = new Euler();
let camera = new PerspectiveCamera(35, 1, 0.1, 1000);

nullGroup.add(cameraGroup);

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
    FragColor = vec4(vUv, 0.0, 1.0);
}
`;

function radians(degrees) {
    return degrees * (Math.PI / 180);
}

window.EXOKIT_AR = {};
EXOKIT_AR.setTrackingOrientation = function(name) {
    _camera.orientation = name;

    switch (orientation) {
        case 'portrait': euler.z = radians(90); break;
        case 'portraitUpsideDown': euler.z = radians(-90); break;
        case 'landscapeLeft': euler.z = 0; break;
        case 'landscapeRight': euler.z = radians(180); break;
    }

    quaternion.setFromEuler(euler);
};

EXOKIT_AR.setRotation = function(value) {
    rotation.setFromArray(value);
};

EXOKIT_AR.setTransform = function(value) {
    cameraGroup.matrixWorld.fromArray(value);
    cameraGroup.matrixWorld.decompose(cameraGroup.position, cameraGroup.quaternion, cameraGroup.scale);

    nullGroup.updateMatrix();
    nullGroup.updateMatrixWorld();

    cameraGroup.matrixWorld.decompose(camera.position, camera.quaternion, camera.scale);
    camera.quaternion.multiply(quaternion);

    camera.updateMatrixWorld();
};

EXOKIT_AR.setProjectionMatrix = function(value) {
    camera.projectionMatrix.fromArray(value);
    camera.fov = Math.atan(1 / value[5]) * 2 * (180 / Math.PI);
};

EXOKIT_AR.setLightIntensity = function() {

};

EXOKIT_AR.setTrackingState = function() {

};

function init() {
    // let camera = new Camera();
    // camera.draw();

    ARInterface.create();

    let geom = new PlaneGeometry(2, 2);
    let shader = new Shader(vs, fs, {
        // tMap: {type: 't', value: camera.texture}
    });

    renderer.draw(shader, geom);
}

exports = {
    init
}
