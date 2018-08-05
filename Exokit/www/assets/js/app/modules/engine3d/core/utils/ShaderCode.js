Module(function ShaderCode() {
    function removeUBO(code, name) {
        let uniforms = code.split(`uniform ${name} {`)[1];
        uniforms = uniforms.split('};')[0];

        uniforms = uniforms.split('\n');
        uniforms.forEach(u => {
            if (!u.length) return;
            code = code.replace(u, 'uniform '+u);
        });

        code = code.replace(`uniform ${name} {`, '');
        code = code.replace(`};`, '');
        return code;
    }

    function convertWebGL1(code) {
        code = code.replace('#version 300 es', '');
        code = code.replace('out vec4 FragColor;', '');

        if (code.includes('uniform ubo {')) code = removeUBO(code, 'ubo');
        if (code.includes('uniform global {')) code = removeUBO(code, 'global');
        // if (code.includes('uniform lights {')) code = removeUBO(code, 'lights');
        return code;
    }

    function convertWebGL2(code, type) {
        code = code.replace(/texture2D/g, 'texture');

        if (type == 'vs') {
            code = code.replace(/attribute/g, 'in');
            code = code.replace(/varying/g, 'out');
        } else {
            code = code.replace(/varying/g, 'in');
            code = code.replace(/textureCube/g, 'texture');
        }

        if (!Renderer.UBO) {
            if (code.includes('uniform ubo {')) code = removeUBO(code, 'ubo');
            if (code.includes('uniform global {')) code = removeUBO(code, 'global');
        }

        return code;
    }

    this.exports = {convertWebGL1, convertWebGL2};
});