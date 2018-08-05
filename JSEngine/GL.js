window.performance = {};
window._gl = {};
window._canvas = {};
_canvas.style = {};
_canvas.getContext = function() {
  return _gl;
};

_canvas.addEventListener = function() {

};

_gl.getContextAttributes = function() {
    return {};
};

_gl.isContextLost = function() {
    return false;
};

_gl.getParameter = function(param) {
    if (param == _gl.VERSION) return 'Exokit';
    return _gl._getParameter(param)
}

_gl.bindVertexArray = function(buffer) {
    _gl._bindVertexArray(buffer || EXOKIT._emptyVertexArray);
};

_gl.bindBuffer = function(target, buffer) {
    _gl._bindBuffer(target, buffer || EXOKIT._emptyBuffer);
};

_gl.bindFramebuffer = function(target, buffer) {
    _gl._bindFramebuffer(target, buffer || EXOKIT._emptyFrameBuffer);
};

_gl.bindRenderbuffer = function(target, buffer) {
    _gl._bindRenderbuffer(target, buffer || EXOKIT._emptyRenderBuffer);
};

_gl.bindTexture = function(target, buffer) {
    _gl._bindTexture(target, buffer || EXOKIT._emptyTexture);
};

_gl.pixelStorei = function(p0, p1) {
    if (typeof p1 === 'number') _gl._pixelStorei(p0, p1);
}

_gl.texImage2D = function(p0, p1, p2, p3, p4, p5, p6, p7, p8) {
    var img;
    if (p6) {
        img = p8 || EXOKIT._img;
        if (!img._src) img = {intArray: img};
        _gl._texImage2DLong(p0, p1, p2, p3, p4, p5, p6, p7, img);
    } else {
        img = p5 || EXOKIT._img;
        if (!img._src) return;
        _gl._texImage2DShort(p0, p1, p2, p3, p4, img);
    }
};

_gl.uniform1i = function(location, x) {
    if (typeof x === 'boolean') {
        x = !!x ? 1 : 0;
    }

    _gl._uniform1i(location, x);
};

_gl.getExtension = function(name) {
    if (name == 'ANGLE_instanced_arrays') {
        return {
            drawElementsInstancedANGLE: _gl.drawElementsInstanced,
            drawArraysInstancedANGLE: _gl.drawArraysInstanced,
            vertexAttribDivisorANGLE: _gl.vertexAttribDivisor
        };
    } else if (name == 'OES_texture_half_float') {
        return {'HALF_FLOAT_OES': _gl.HALF_FLOAT_OES};
    }

    return 1;
}

_gl.bufferData = function(p0, p1, p2) {
    window.C_glBufferData(p0, p1, p2);
}

_gl.bufferSubData = function(p0, p1, p2, p3) {
    window.C_glBufferSubData(p0, p1, p2, p3);
}
