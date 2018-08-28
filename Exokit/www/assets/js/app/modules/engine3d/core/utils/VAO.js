class VAO {
    constructor() {
        this.WEBGL2 = Renderer.type == Renderer.WEBGL2;

        const gl = Renderer.context;
        if (this.WEBGL2) {
            this.vao = gl.createVertexArray();
        } else {
            this.vao = Renderer.extensions.VAO.createVertexArrayOES();
        }
    }

    bind() {
        const gl = Renderer.context;

        if (this.WEBGL2) {
            gl.bindVertexArray(this.vao);
        } else {
            Renderer.extensions.VAO.bindVertexArrayOES(this.vao);
        }
    }

    unbind() {
        const gl = Renderer.context;

        if (this.WEBGL2) {
            gl.bindVertexArray(null);
        } else {
            Renderer.extensions.VAO.bindVertexArrayOES(null);
        }
    }

    destroy() {
        const gl = Renderer.context;

        if (this.WEBGL2) {
            gl.deleteVertexArray(this.vao)
        } else {
            Renderer.extensions.VAO.deleteVertexArrayOES(this.vao);
        }

        this.vao = null;
    }
}