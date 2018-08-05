Class(function SceneView() {
    Inherit(this, Object3D);
    const _this = this;

    //*** Constructor
    (function () {
        // World.NUKE.add(new FXAA());
        initMesh();
    })();

    function initMesh() {
        let mesh = new Mesh(new BoxGeometry(1, 1, 1), Utils3D.getTestShader());
        _this.add(mesh);

        _this.startRender(t => {
            mesh.position.y = Math.sin(t * 0.002) * 0.3;
            mesh.rotation.y += 0.01;
            mesh.rotation.x += 0.004;
        });

        World.SCENE.add(_this.group);

        let camera = _this.initClass(GazeCamera);
        camera.moveXY.set(8, 4);
        camera.position.set(0, 0, 6);
        camera.lerpSpeed = 0.07;
        camera.lookAt = new Vector3();
        camera.lock();

    }

    //*** Event handlers

    //*** Public methods

});
