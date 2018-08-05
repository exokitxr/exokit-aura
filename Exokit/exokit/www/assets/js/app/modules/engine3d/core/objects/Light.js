/**
 * @name Light
 * @param {Color} color
 * @param {Number} intensity
 * @param {Number} distance
 */
class Light extends Base3D {
    constructor(color = 0xffffff, intensity = 1, distance = Number.POSITIVE_INFINITY) {
        super();
        this.color = new Color(color);
        this.intensity = intensity;
        this.distance = distance;
    }

    destroy() {
        if (this.shadow) {
            Lighting.removeFromShadowGroup(this);
            this.shadow.destroy();
        }
    }

    prepareRender() {
        this.shadow.camera.position.copy(this.position);
        this.shadow.camera.lookAt(this.shadow.target);
    }

    /**
     * @name castShadow
     * @memberof GeometryAttribute
     *
     * @property
     */
    set castShadow(bool) {
        if (!this.shadow) this.shadow = new Shadow(this);
        this.shadow.enabled = bool;

        if (bool) Lighting.addToShadowGroup(this);
        else Lighting.removeFromShadowGroup(this);
    }
}

/**
 * @name DirectionalLight
 * @param {Color} color
 * @param {Number} intensity
 * @param {Number} distance
 */
class DirectionalLight extends Light {
    constructor(color, intensity, distance) {
        super(color, intensity, distance);
    }
}

/**
 * @name PointLight
 * @param {Color} color
 * @param {Number} intensity
 * @param {Number} distance
 */
class PointLight extends Light {
    constructor(color, intensity, distance) {
        super(color, intensity, distance);
    }
}