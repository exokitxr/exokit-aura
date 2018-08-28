/**
 * @name Points
 * @param {Geometry} geometry
 * @param {Shader} shader
 */
class Points extends Base3D {
    constructor(geometry, shader) {
        super();
        this.geometry = geometry;
        this.shader = shader;
        this.isPoints = true;
    }

    clone() {
        return new Points(this.geometry, this.material).copy(this);
    }
}
