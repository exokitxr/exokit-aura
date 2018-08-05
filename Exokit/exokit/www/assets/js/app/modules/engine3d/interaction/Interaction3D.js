/**
 * @name Interaction3D
 * @param {CameraBase3D} camera
 */

Class(function Interaction3D(_camera) {
    Inherit(this, Component);
    const _this = this;
    let _hover, _click;
    var _input, _hold, _calc;
    var _v3 = new Vector3();

    _camera = _camera || World.CAMERA;
    let _ray = _this.initClass(Raycaster, _camera);
    _ray.testVisibility = true;

    let _meshes = [];
    const _event = {};

    this.cursor = 'auto';

    /**
     * @name cursor
     * @memberof Interaction3D
     * @property
     */

    (function() {
        _this.enabled = true;
    })();

    function parseMeshes(meshes) {
        if (!Array.isArray(meshes)) meshes = [meshes];
        let output = [];
        meshes.forEach(checkMesh);
        function checkMesh(obj) {
            if ( obj.hitArea ) obj = initHitMesh( obj );
            if (typeof obj.isHitMesh === 'boolean') {
                obj.mouseEnabled = function(visible) {
                    if (visible) {
                        if (!~_meshes.indexOf(obj)) _meshes.push(obj);
                    } else {
                        _meshes.remove(obj);
                    }
                };
                output.push(obj);
            } else {
                output.push(obj);
            }
            if (obj.children.length) obj.children.forEach(checkMesh);
        }
        return output;
    }

    function initHitMesh( obj ) {
        if ( !obj.hitMesh ) {
            obj.hitMesh = new Mesh( obj.hitArea );
            obj.add( obj.hitMesh );
        }
        obj = obj.hitMesh;
        obj.isHitMesh = true;
        obj.testVisibility = false;
        obj.visible = false;
        return obj;
    }

    //*** Event handlers
    function addHandlers() {
        _this.events.sub(Mouse.input, Interaction.START, start);
        if (Device.mobile) _this.events.sub(Mouse.input, Interaction.END, end);
        _this.events.sub(Mouse.input, Interaction.MOVE, move);
        _this.events.sub(Mouse.input, Interaction.CLICK, click);
    }

    function removeHandlers() {
        _this.events.unsub(Mouse.input, Interaction.START, start);
        if (Device.mobile) _this.events.unsub(Mouse.input, Interaction.END, end);
        _this.events.unsub(Mouse.input, Interaction.MOVE, move);
        _this.events.unsub(Mouse.input, Interaction.CLICK, click);
    }

    function start() {
        if (!_this.enabled) return;
        let hit = move();
        if (hit) {
            _click = hit.object;
            _click.time = Render.TIME;
        } else {
            _click = null;
        }
    }

    function move() {
        if (!_this.enabled) {
            Stage.css('cursor', _this.cursor);
            return;
        }

        let hit;
        if (_input.type == '2d') {
            hit = _ray.checkHit(_meshes, _input.position)[0];
        } else {
            _v3.set(0, 0, -1).applyQuaternion(_input.quaternion);
            hit = _ray.checkFromValues(_meshes, _input.position, _v3)[0];
        }

        if (hit) {
            let mesh = hit.object;
            _input.obj && _input.obj.setHitPosition && _input.obj.setHitPosition( hit );
            if (_hover !== mesh) {
                if (_hover) triggerHover('out', _hover, hit);

                _hover = mesh;
                triggerHover('over', _hover, hit);

                if (_hover.__clickCallback) {
                    Stage.css('cursor', 'pointer');
                } else {
                    Stage.css('cursor', _this.cursor);
                }
            } else {
                triggerMove(_hover, hit);
            }

            return hit;
        } else {
            end();
            _input.obj && _input.obj.setHitPosition && _input.obj.setHitPosition( false );
            return false;
        }
    }

    function end() {
        if (!_hover) return;
        triggerHover('out', _hover, null);
        _hover = null;
        Stage.css('cursor', _this.cursor);
    }

    function click(e) {
        if (!_this.enabled) return;
        if (!_click) return;

        let hit;
        if (_input.type == '2d') {
            let element = document.elementFromPoint(e.x, e.y);
            if (element && element.className === 'hit') return;
            hit = _ray.checkHit(_meshes, _input.position)[0];
        } else {
            _v3.set(0, 0, -1).applyQuaternion(_input.quaternion);
            hit = _ray.checkFromValues(_meshes, _input.position, _v3)[0];
        }

        if (hit && hit.object === _click) {
            triggerClick(_click, hit);
        }
        _click = null;
    }

    function triggerHover(action, mesh, hit) {
        _event.action = action;
        _event.mesh = mesh;
        _event.hit = hit;
        _this.events.fire(Interaction3D.HOVER, _event, true);
        _hover.__hoverCallback && _hover.__hoverCallback(_event);
    }

    function triggerClick(mesh, hit) {
        _event.action = 'click';
        _event.mesh = mesh;
        _event.hit = hit;
        _this.events.fire(Interaction3D.CLICK, _event, true);
        _click.__clickCallback && _click.__clickCallback(_event);
    }

    function triggerMove(mesh, hit) {
        _event.action = 'move';
        _event.mesh = mesh;
        _event.hit = hit;
        _this.events.fire(Interaction3D.MOVE, _event, true);
        mesh.__moveCallback && mesh.__moveCallback(_event);
    }

    //*** Public methods
    this.set('camera', c => {
        _ray.camera = c;
    });

    /**
     * @name add()
     * @memberof Interaction3D
     *
     * @function
     * @param {Array} meshes
     * @param {Callback} hover
     * @param {Callback} click
     * @param {Callback} move
     */
    this.add = function(meshes, hover, click, move, isParse) {
        if (!Array.isArray(meshes) || isParse) meshes = parseMeshes(meshes);

        meshes.forEach(mesh => {
            mesh.hitDestroy = _ => _meshes.remove( mesh );
            if (hover) mesh.__hoverCallback = hover;
            if (click) mesh.__clickCallback = click;
            if (move) mesh.__moveCallback = move;
            _meshes.push(mesh);
        });
    };

    /**
     * @name remove()
     * @memberof Interaction3D
     *
     * @function
     * @param {Array} meshes
     */
    this.remove = function(meshes, isParse) {
        if (!Array.isArray(meshes) || isParse) meshes = parseMeshes(meshes);
        meshes.forEach(mesh => {
            if ( mesh === _hover ) {
                _hover = null;
                Stage.css('cursor', _this.cursor);
            }

            for (let i = _meshes.length - 1; i >= 0; i--) {
                if (mesh === _meshes[i]) _meshes.splice(i, 1);
            }
        });
    };

    this.set('testVisibility', v => _ray.testVisibility = v);

    this.set('input', obj => {
        _input = {};
        _input.obj = obj;
        _input.position = obj.group && obj.group.position || obj;
        _input.quaternion = obj.group && obj.group.quaternion;
        _input.type = typeof _input.position.z === 'number' ? '3d' : '2d';
        if (_input.type == '3d') {
            _hold = new Vector3();
            _calc = new Vector3();
        } else {
            _hold = new Vector2();
            _calc = new Vector2();
        }

        if (obj == Mouse) {
            addHandlers();
        } else {
            removeHandlers();
            _this.events.sub( obj, Events.SELECT, start );
            _this.events.sub( obj, Events.END, click );
            _this.startRender(move, 24);
        }
    });

}, () => {
    Interaction3D.HOVER = 'interaction3d_hover';
    Interaction3D.CLICK = 'interaction3d_click';
    Interaction3D.MOVE = 'interaction3d_move';

    var _map = new Map();
    var _input = Mouse;

    Interaction3D.find = function(camera) {
        if (!_map.has(camera)) {
            let interaction = new Interaction3D(camera);
            interaction.input = _input;
            _map.set(camera, interaction);
        }
        return _map.get(camera);
    }

    Interaction3D.useInput = function(obj) {
        for ( let [ camera, interaction ] of _map ) interaction.input = obj;
        _input = obj;
    }
});