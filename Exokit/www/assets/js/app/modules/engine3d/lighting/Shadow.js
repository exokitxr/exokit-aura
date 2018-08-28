class Shadow {
    constructor(light) {
        this.light = light;
        this.camera = light instanceof PointLight ? new PerspectiveCamera(60, 1, 0.1, 50) : new OrthographicCamera(-5, 5, 5, -5, 0.1, 50);
        this.target = new Vector3();
        this.rt = new RenderTarget(1024, 1024);
        this.rt.createDepthTexture();
        this.enabled = true;
        this._size = 1024;
        this._fov = 60;

        light.add(this.camera);
    }

    destroy() {
        this.rt.destroy();
    }

    set fov(value) {
        this._fov = value;
        this.camera.fov = value;
        this.camera.updateProjectionMatrix();
    }

    get fov() {
        return this._fov;
    }

    set area(value) {
        this._area = value;
        this.camera.left = -value;
        this.camera.right = value;
        this.camera.top = value;
        this.camera.bottom = -value;
        this.camera.updateProjectionMatrix();
    }

    get area() {
        return this._area;
    }

    set far(value) {
        this._far = value;
        this.camera.far = value;
        this.camera.updateProjectionMatrix();
    }

    get far() {
        return this._far;
    }

    set size(value) {
        this._size = value;
        this.rt.setSize(value, value);
    }

    get size() {
        return this._size;
    }
}