/**
 * @name Shaders
 * */

Class(function Shaders() {
    Inherit(this, Component);
    var _this = this;

    //*** Constructor
    (function () {

    })();

    function parseSingleShader(code) {
        let uniforms = code.split('#!UNIFORMS')[1].split('#!')[0];
        let varyings = code.split('#!VARYINGS')[1].split('#!')[0];
        let attributes = code.split('#!ATTRIBUTES')[1].split('#!')[0];

        while (code.includes('#!SHADER')) {
            code = code.slice(code.indexOf('#!SHADER'));
            let split = code.split('#!SHADER')[1];
            let br = split.indexOf('\n');
            let name = split.slice(0, br).split(': ')[1];
            let glsl = split.slice(br);
            if (name.includes('.vs')) glsl = attributes + uniforms + varyings + glsl;
            else glsl = uniforms + varyings + glsl;

            // Have to do this weird thing for chrome on windows in dev mode
            let splitName = name.split('.');
            _this[splitName[0] + (splitName[1].includes('vs') ? '.vs' : '.fs')] = glsl;

            code = code.replace('#!SHADER', '$');
        }
    }

    function parseCompiled(shaders) {
        var split = shaders.split('{@}');
        split.shift();

        for (var i = 0; i < split.length; i += 2) {
            var name = split[i];
            var text = split[i+1];
            if (text.includes('#!UNIFORMS')) {
                parseSingleShader(text);
            } else {
                _this[name] = text;
            }
        }
    }

    function parseRequirements() {
        for (var key in _this) {
            var obj = _this[key];
            if (typeof obj === 'string') {
                _this[key] = require(obj);
            }
        }
    }

    function require(shader) {
        if (!shader.includes('require')) return shader;

        shader = shader.replace(/# require/g, '#require');
        while (shader.includes('#require')) {
            var split = shader.split('#require(');
            var name = split[1].split(')')[0];
            name = name.replace(/ /g, '');

            if (!_this[name]) throw 'Shader required '+name+', but not found in compiled shaders.\n'+shader;

            shader = shader.replace('#require('+name+')', _this[name]);
        }

        return shader;
    }

    //*** Event handlers

    //*** Public methods
    this.parse = function(code, file) {
        if (!code.includes('{@}')) {
            file = file.split('/');
            file = file[file.length-1]; 

            _this[file] = code;
        } else {
            parseCompiled(code);
            parseRequirements();
        }

        _this.shadersParsed = true;
    }

    this.onReady = this.ready = function(callback) {
        let promise = Promise.create();
        if (callback) promise.then(callback);
        _this.wait(() => promise.resolve(), _this, 'shadersParsed');
        return promise;
    }

    this.getShader = function(string) {
        if (_this.FALLBACKS) {
            if (_this.FALLBACKS[string]) {
                string = _this.FALLBACKS[string];
            }
        }

        var code = _this[string];

        if (code) {
            while (code.includes('#test ')) {
                try {
                    var test = code.split('#test ')[1];
                    var name = test.split('\n')[0];
                    var glsl = code.split('#test ' + name + '\n')[1].split('#endtest')[0];

                    if (!eval(name)) {
                        code = code.replace(glsl, '');
                    }

                    code = code.replace('#test ' + name + '\n', '');
                    code = code.replace('#endtest', '');
                } catch (e) {
                    throw 'Error parsing test :: ' + string;
                }
            }
        }

        return code;
    }
}, 'static');