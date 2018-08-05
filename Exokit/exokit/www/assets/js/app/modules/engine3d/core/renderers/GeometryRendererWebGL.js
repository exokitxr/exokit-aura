Class(function GeometryRendererWebGL() {
    const _this = this;
    var _gl = Renderer.context;

    var _cache = {};

    const WEBGL2 = Renderer.type == Renderer.WEBGL2;

    function getMode(mesh, shader) {
        if (mesh instanceof Points) return _gl.POINTS;
        if (mesh instanceof Line) return _gl.LINE_STRIP;
        if (shader.wireframe) return _gl.LINES;
        return _gl.TRIANGLES;
    }

    function updateBuffer(attrib) {
        attrib.needsUpdate = false;

        _gl.bindBuffer(_gl.ARRAY_BUFFER, attrib._gl.buffer);

        let array = attrib.array;
        let updateRange = attrib.updateRange;
        if (updateRange.count === -1) {
            _gl.bufferSubData(_gl.ARRAY_BUFFER, 0, array);
        } else {
            _gl.bufferSubData(_gl.ARRAY_BUFFER, updateRange * offset * array.BYTES_PER_ELEMENT,
                array.subarray(updatRange.offset, updateRange.offset + updateRange.count));
        }

        _gl.bindBuffer(_gl.ARRAY_BUFFER, null);
    }

    //*** Event handlers

    //*** Public methods
    this.draw = function(geom, mesh, shader) {
        if (!geom._gl || geom.needsUpdate || !mesh._gl || !mesh._gl.geomInit) this.upload(geom, mesh, shader);

        for (let key in geom.attributes) {
            let attrib = geom.attributes[key];

            if (mesh._gl.program != shader._gl.program) {
                mesh._gl[`${key}_loc`] = _gl.getAttribLocation(shader._gl.program, key);
                mesh._gl.program = shader._gl.program;
            }

            let location = mesh._gl[`${key}_loc`] || _gl.getAttribLocation(shader._gl.program, key);
            mesh._gl[`${key}_loc`] = location;

            if (location == -1) continue;

            if (attrib.needsUpdate || attrib.dynamic) updateBuffer(attrib);
        }

        mesh._gl.vao.bind();

        let mode = getMode(mesh, shader);
        let drawStart = 0;
        let drawEnd = geom.attributes.position.count;
        if (geom.isInstanced) {

            if (WEBGL2) {
                if (geom.index) _gl.drawElementsInstanced(mode, geom.index.length, _gl.UNSIGNED_SHORT, 0, geom.maxInstancedCount);
                else _gl.drawArraysInstanced(mode, drawStart, drawEnd, geom.maxInstancedCount);
            } else {
                if (geom.index) Renderer.extensions.instancedArrays.drawElementsInstancedANGLE(mode, geom.index.length, _gl.UNSIGNED_SHORT, 0, geom.maxInstancedCount);
                else Renderer.extensions.instancedArrays.drawArraysInstancedANGLE(mode, 0, drawEnd, geom.maxInstancedCount);
            }

        } else {
            if (geom.index) _gl.drawElements(mode, geom.index.length, _gl.UNSIGNED_SHORT, 0);
            else _gl.drawArrays(mode, drawStart, drawEnd);
        }

        mesh._gl.vao.unbind();
    }

    this.upload = function(geom, mesh, shader) {
        if (!geom._gl) geom._gl = {id: Utils.timestamp()};
        if (!mesh._gl) mesh._gl = {};
        mesh._gl.geomInit = true;

        const KEY = `${geom._gl.id}_${shader._gl._id}`;
        let cached = _cache[KEY];
        if (cached) {
            cached.count++;
            mesh._gl.vao = cached.vao;
            mesh._gl.lookup = KEY;
            return;
        }

        if (mesh._gl.vao) mesh._gl.vao.destroy();
        mesh._gl.vao = new VAO();

        for (let key in geom.attributes) {
            let attrib = geom.attributes[key];

            let location = mesh._gl[`${key}_loc`] || _gl.getAttribLocation(shader._gl.program, key);
            mesh._gl[`${key}_loc`] = location;

            if (attrib._gl) continue;

            attrib._gl = {};
            attrib._gl.buffer = _gl.createBuffer();

            _gl.bindBuffer(_gl.ARRAY_BUFFER, attrib._gl.buffer);
            _gl.bufferData(_gl.ARRAY_BUFFER, attrib.array, attrib.dynamic ? _gl.DYNAMIC_DRAW : _gl.STATIC_DRAW);
            _gl.bindBuffer(_gl.ARRAY_BUFFER, null);
            attrib.needsUpdate = false;
        }

        if (geom.index) {
            if (!geom._gl.index) geom._gl.index = _gl.createBuffer();

            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, geom._gl.index);
            _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, geom.index, _gl.STATIC_DRAW);
            _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, null);
        }

        mesh._gl.vao.bind();
        for (let key in geom.attributes) {
            let attrib = geom.attributes[key];
            let location =  mesh._gl[`${key}_loc`];
            if (location == -1) continue;

            _gl.bindBuffer(_gl.ARRAY_BUFFER, attrib._gl.buffer);
            _gl.vertexAttribPointer(location, attrib.itemSize, _gl.FLOAT, false, 0, 0);
            _gl.enableVertexAttribArray(location);

            if (geom.isInstanced) {
                if (WEBGL2) {
                    _gl.vertexAttribDivisor(location, attrib.meshPerAttribute);
                } else {
                    Renderer.extensions.instancedArrays.vertexAttribDivisorANGLE(location, attrib.meshPerAttribute);
                }
            }
        }
        if (geom.index) _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, geom._gl.index);
        mesh._gl.vao.unbind();

        _cache[KEY] = {count: 1, vao: mesh._gl.vao};
    }

    this.destroy = function(geom, mesh) {
        for (let key in geom.attributes) {
            let attrib = geom.attributes[key];
            if (attrib._gl) {
                _gl.deleteBuffer(attrib._gl.buffer);
            }
        }

        if (mesh && mesh._gl.vao) {
            mesh._gl.vao.destroy();
            delete _cache[mesh._gl.lookup];
        }
        delete geom._gl;
    }

});