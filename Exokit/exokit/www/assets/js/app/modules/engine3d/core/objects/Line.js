/**
 * @name Line
 * @param {Geometry} geometry
 * @param {Shader} shader
 */
class Line extends Base3D {
    constructor(geometry, shader) {
        super();
        this.geometry = geometry;
        this.shader = Utils3D.getTestShader(shader);
        this.isLine = true;
    }

    clone() {
        return new Line(this.geometry, this.shader).copy(this);
    }
}