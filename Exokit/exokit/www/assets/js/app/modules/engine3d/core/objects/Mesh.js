/**
 * @name Mesh
 * @param {Geometry} geometry
 * @param {Shader} shader
 */
class Mesh extends Base3D {
    constructor(geometry, shader = Utils3D.getTestShader()) {
        super();
        this.geometry = geometry;
        this.shader = shader && shader.shader ? shader.shader : shader;
        this.isMesh = true;
    }

    clone() {
        return new Mesh(this.geometry, this.shader).copy(this);
    }
}