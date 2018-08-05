/**
 * @name Base3D
 */

class Base3D {

    constructor() {
        this.position = new Vector3();
        this.rotation = new Euler();
        this.quaternion = new Quaternion();
        this.scale = new Vector3(1, 1, 1);

        this._parent = null;

        this.up = new Vector3(0, 1, 0);
        this.isObject3D = true;
        this.children = [];

        this.modelViewMatrix = new Matrix4();
        this.normalMatrix = new Matrix3();
        this.matrix = new Matrix4();
        this.matrixWorld = new Matrix4();

        this.matrixAutoUpdate = true;
        this.matrixWorldNeedsUpdate = false;

        this.visible = true;

        this.castShadow = false;

        this.frustumCulled = true;
        this._renderOrder = 0;

        this.worldPos = new Vector3();

        const _this = this;
        this.quaternion.onChange(_ => {
            _this.rotation.setFromQuaternion(_this.quaternion, undefined, false);
        });

        this.rotation.onChange(_ => {
            _this.quaternion.setFromEuler(_this.rotation, false);
        });

        /**
         * @name position
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name rotation
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name quaternion
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name scale
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name matrix
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name matrixWorld
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name castShadow
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name visible
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name frustumCulled
         * @memberof Base3D
         *
         * @property
         */

        /**
         * @name renderOrder
         * @memberof Base3D
         *
         * @property
         */
    }

    get renderOrder() {
        return this._renderOrder;
    }

    set renderOrder(value) {
        this._renderOrder = value;
        let p = this._parent;
        while (p) {
            if (p instanceof Scene) p.displayNeedsUpdate = true;
            p = p._parent;
        }
    }

    /**
     * @name applyMatrix()
     * @memberof Base3D
     *
     * @function
     * @param {Matrix4} matrix
     */
    applyMatrix(matrix) {
        this.matrix.multiplyMatrices(matrix, this.matrix);
        this.matrix.decompose(this.position, this.quaternion, this.scale);
        return this;
    }

    /**
     * @name applyQuaternion()
     * @memberof Base3D
     *
     * @function
     * @param {Quaternion} q
     */
    applyQuaternion(q) {
        this.quaternion.premultiply(q);
        return this;
    }

    /**
     * @name setRotationFromAxisAngle()
     * @memberof Base3D
     *
     * @function
     * @param {Number} axis
     * @param {Number} angle
     */
    setRotationFromAxisAngle(axis, angle) {
        this.quaternion.setFromAxisAngle(axis, angle);
    }

    /**
     * @name setRotationFromMatrix()
     * @memberof Base3D
     *
     * @function
     * @param {Matrix4} matrix
     */
    setRotationFromMatrix(m) {
        this.quaternion.setFromRotationMatrix(m);
    }

    /**
     * @name setRotationFromQuaternion()
     * @memberof Base3D
     *
     * @function
     * @param {Quaternion} q
     */
    setRotationFromQuaternion(q) {
        this.quaternion.copy(q);
    }

    /**
     * @name localToWorld()
     * @memberof Base3D
     *
     * @function
     * @param {Vector3} v
     */
    localToWorld(v) {
        return v.applyMatrix4(this.matrixWorld);
    }

    /**
     * @name worldToLocal()
     * @memberof Base3D
     *
     * @function
     * @param {Vector3} v
     */
    worldToLocal(v) {
        let m1 = this.M1 || new Matrix4();
        this.M1 = m1;

        v.applyMatrix4(m1.getInverse(this.matrixWorld));
    }

    /**
     * @name lookAt()
     * @memberof Base3D
     *
     * @function
     * @param {Vector3} v
     */
    lookAt(x, y, z) {
        let m1 = this.M1 || new Matrix4();
        this.M1 = m1;

        let v = this.V1 || new Vector3();
        this.V1 = v;

        if (x.isVector3) {
            v.copy(x);
        } else {
            v.set(x, y, z);
        }

        if (this.isCamera) {
            m1.lookAt(this.position, v, this.up);
        } else {
            m1.lookAt(v, this.position, this.up);
        }

        this.quaternion.setFromRotationMatrix(m1);
    }

    /**
     * @name add()
     * @memberof Base3D
     *
     * @function
     * @param {Base3D} object
     */
    add(object) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) this.add(arguments[i]);
            return this;
        }

        if (object === this) return this;

        if (object && object.isObject3D) {
            if (object._parent !== null) object._parent.remove(object);
            object._parent = this;
            this.children.push(object);
        } else {
            console.error(`Object is not instance of Object3D`, object);
        }

        if (this.isScene) this.displayNeedsUpdate = true;
        else {
            let p = this._parent;
            while (p) {
                if (p instanceof Scene) p.displayNeedsUpdate = true;
                p = p._parent;
            }
        }

        return this;
    }

    /**
     * @name remove()
     * @memberof Base3D
     *
     * @function
     * @param {Base3D} object
     */
    remove(object) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) this.remove(arguments[i]);
            return this;
        }

        if (this.isScene) this.displayNeedsUpdate = true;
        else {
            let p = this._parent;
            while (p) {
                if (p instanceof Scene) p.displayNeedsUpdate = true;
                p = p._parent;
            }
        }

        this.children.remove(object);
    }

    /**
     * @name getWorldPosition()
     * @memberof Base3D
     *
     * @function
     * @param {Vector3} target
     */
    getWorldPosition(target) {
        let v = this.V1 || new Vector3();
        this.V1 = v;

        if (!target) target = v;

        this.updateMatrixWorld(true);
        return target.setFromMatrixPosition(this.matrixWorld);
    }

    /**
     * @name getWorldScale()
     * @memberof Base3D
     *
     * @function
     * @param {Vector3} target
     */
    getWorldScale(target) {
        let v = this.V1 || new Vector3();
        this.V1 = v;

        let v2 = this.V12|| new Vector3();
        this.V2 = v2;

        let q = this.Q1 || new Quaternion();
        this.Q1 = q;

        if (!target) target = v2;

        this.updateMatrixWorld(true);
        this.matrixWorld.decompose(v, q, target);

        return target;
    }

    /**
     * @name getWorldQuaternion()
     * @memberof Base3D
     *
     * @function
     * @param {Quaternion} target
     */
    getWorldQuaternion(target) {
        let v = this.V1 || new Vector3();
        this.V1 = v;

        let q = this.Q1 || new Quaternion();
        this.Q1 = q;

        if (!target) target = q;

        this.updateMatrixWorld(true);
        this.matrixWorld.decompose(v, target, v);

        return target;
    }

    traverse(callback) {
        callback(this);

        let children = this.children;
        for (let i = 0; i < children.length; i++) {
            children[i].traverse(callback);
        }
    }

    /**
     * @name updateMatrix()
     * @memberof Base3D
     */
    updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
    }

    /**
     * @name updateMatrixWorld()
     * @memberof Base3D
     */
    updateMatrixWorld(force) {
        if (!force && !this.determineVisible()) return;
        if (this.matrixCacheTime > 0 && Render.TIME - this.matrixCacheTime < 8 && !force) return;
        this.matrixCacheTime = Render.TIME;

        if (this.matrixAutoUpdate) this.updateMatrix();
        if (this.matrixWorldNeedsUpdate || force) {
            if (this._parent === null) {
                this.matrixWorld.copy(this.matrix);
            } else {
                this.matrixWorld.multiplyMatrices(this._parent.matrixWorld, this.matrix);
            }

            this.matrixWorldNeedsUpdate = false;
        }

        let children = this.children;
        let len = children.length;
        for (let i = 0; i < len; i++) {
            children[i].updateMatrixWorld(force);
        }
    }

    /**
     * @name clone()
     * @memberof Base3D
     */
    clone(recursive) {
        new this.constructor().copy(this, recursive);
    }

    copy(source, recursive) {
        this.name = source.name;

        this.up.copy(source.up);

        this.position.copy( source.position );
        this.quaternion.copy( source.quaternion );
        this.scale.copy( source.scale );

        this.matrix.copy( source.matrix );
        this.matrixWorld.copy( source.matrixWorld );

        this.matrixAutoUpdate = source.matrixAutoUpdate;
        this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

        this.visible = source.visible;

        this.castShadow = source.castShadow;
        this.receiveShadow = source.receiveShadow;

        this.frustumCulled = source.frustumCulled;
        this.renderOrder = source.renderOrder;

        if (recursive === true) {
            for (let i = 0; i < source.children.length; i++) {
                let child = source.children[i];
                this.add(child.clone());
            }
        }

        return this;
    }

    render() {

    }

    determineVisible() {
        if (this.determineVisibleCacheTime > 0 && Render.TIME - this.determineVisibleCacheTime < 8) return this.determineVisibleCache;

        if (!this.visible) {
            this.determineVisibleCache = false;
            return false;
        }

        let p = this._parent;
        while (p) {
            if (!p.visible) {
                this.determineVisibleCache = false;
                return false;
            }
            p = p._parent;
        }

        this.determineVisibleCache = true;
        return true;
    }

    upload() {
        if (this.shader) this.shader.upload(this, this.geometry);
        if (this.geometry) this.geometry.upload(this, this.shader);
    }

    /**
     * @name destroy()
     * @memberof Base3D
     */
    destroy() {
        if (this.geometry && this.geometry.destroy) this.geometry.destroy(this);
        if (this.shader && this.shader.destroy) this.shader.destroy(this);
        if (this.hitDestroy) this.hitDestroy();
        if (this._gl && this._gl.ubo) this._gl.ubo.destroy();
        if (this._gl && this._gl.vao) this._gl.vao.destroy();
        if (this._gl) this._gl = null;
        this._parent.remove(this);
        if (this.parent && this.parent.__destroyChild) this.parent.__destroyChild(this.__id);
    }
}
