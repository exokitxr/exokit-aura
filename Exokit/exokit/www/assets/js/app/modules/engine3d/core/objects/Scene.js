/**
 * @name Scene
 */
class Scene extends Base3D {
    constructor() {
        super();
        this.autoUpdate = true;
        this.toRender = [[], []];
        this.displayNeedsUpdate = true;
        this.isScene = true;
    }
}