Class(function Lighting() {
    Inherit(this, Component);
    const _this = this;

    var _lights = [];
    var _renderShadows = [];
    var _shaders = new LinkedList();

    //*** Constructor
    (function () {

    })();

    function loop() {
        decomposeLights(_lights);

        let shader = _shaders.start();
        while (shader) {
            decomposeLights(shader.lights);
            updateArrays(shader);
            shader = _shaders.next();
        }
    }

    function decomposeLights(lights) {
        for (let i = lights.length-1; i > -1; i--) {
            let light = lights[i];
            if (light._decomposedTime && Render.TIME - light._decomposedTime < 8) continue;
            light._decomposedTime = Render.TIME;

            if (!light._parent) light.updateMatrixWorld();
            if (!light._world) light._world = new Vector3();
            light.getWorldPosition(light._world);
        }
    }

    function updateArrays(shader) {
        let lights = shader.lights;
        let lighting = shader.__lighting;
        let light;

        lighting.position.length = 0;
        lighting.color.length = 0;
        lighting.intensity.length = 0;
        lighting.distance.length = 0;

        for (let i = 0; i < lights.length; i++) {
            light = lights[i];
            lighting.position.push(light._world.x, light._world.y, light._world.z);
            lighting.color.push(light.color.r, light.color.g, light.color.b);
            lighting.intensity.push(light.intensity);
            lighting.distance.push(light.distance);
        }

        for (let i = 0; i < _lights.length; i++) {
            light = _lights[i];
            lighting.position.push(light._world.x, light._world.y, light._world.z);
            lighting.color.push(light.color.r, light.color.g, light.color.b);
            lighting.intensity.push(light.intensity);
            lighting.distance.push(light.distance);
        }
    }

    //*** Event handlers

    //*** Public methods
    this.push = this.add = function(light) {
        _lights.push(light);
        Render.start(loop);
    }

    this.remove = function(light) {
        _lights.remove(light);
    }

    this.getLighting = function(shader, force) {
        if (shader.__lighting && !force) return shader.__lighting;

        _shaders.push(shader);

        shader.__lighting = {
            position: [],
            color: [],
            intensity: [],
            distance: []
        };

        if (_lights[0] && !_lights[0]._world) decomposeLights(_lights);
        decomposeLights(shader.lights);
        updateArrays(shader)

        return shader.__lighting;
    }

    this.destroyShader = function(shader) {
        _shaders.remove(shader);
    }

    this.sort = function(callback) {
        _lights.sort(callback);
    }

    this.addToShadowGroup = function(light) {
        _renderShadows.push(light);
    }

    this.removeFromShadowGroup = function(light) {
        _renderShadows.remove(light);
    }

    this.getShadowLights = function() {
        return _renderShadows;
    }

    this.getShadowCount = function() {
        return _renderShadows.length;
    }

    this.initShadowShader = function(object, mesh) {
        let shader = object.shader || object;
        if (!shader._gl) shader.upload();

        let vsName = shader.vsName;
        let fsName = 'ShadowDepth';

        if (shader.customShadowShader) vsName = fsName = shader.customShadowShader;
        if (object.castShadow == Shader.CUSTOM_DEPTH || (mesh && mesh.castShadow == Shader.CUSTOM_DEPTH)) vsName = shader.vsName;

        shader.shadow = new Shader(vsName, fsName, {receiveLight: shader.receiveLight, UILPrefix: shader.UILPrefix, precision: 'high'});
        shader.copyUniformsTo(shader.shadow, true);
        shader.shadow.upload();
    }

    this.getShadowUniforms = function() {
        if (!Renderer.instance.shadows || _renderShadows.length == 0) return '';

        return [
            `#define SHADOW_MAPS ${_renderShadows.length}`,
            Renderer.instance.shadows == Renderer.SHADOWS_LOW ? '#define SHADOWS_LOW' : '',
            Renderer.instance.shadows == Renderer.SHADOWS_MED ? '#define SHADOWS_MED' : '',
            Renderer.instance.shadows == Renderer.SHADOWS_HIGH ? '#define SHADOWS_HIGH' : '',
            `uniform sampler2D shadowMap[${_renderShadows.length}];`,
            `uniform mat4 shadowMatrix[${_renderShadows.length}];`,
            `uniform vec3 shadowLightPos[${_renderShadows.length}];`,
            `uniform float shadowSize[${_renderShadows.length}];`,
        ].join('\n');
    }

}, 'static');