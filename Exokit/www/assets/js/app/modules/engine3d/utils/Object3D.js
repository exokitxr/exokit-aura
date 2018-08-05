/**
 * @name Object3D
 */

Class(function Object3D() {
    Inherit(this, Component);
    var _this = this;

    /**
     * @name this.group
     * @memberof Object3D
     */
    this.group = new Group();

    //*** Event handlers

    //*** Public methods

    /**
     * @name this.freezeMatrix
     * @memberof Object3D
     *
     * @function
     * @param {THREE.Object3D} group
     */
    this.freezeMatrix = function(group) {
        group = group || _this.group;
        group.matrixAutoUpdate = false;
        group.updateMatrix();
    };

    /**
     * @name this.add
     * @memberof Object3D
     *
     * @function
     * @param {Object3D|THREE.Object3D} child
     */
    this.add = function(child) {
        this.group.add(child.group || child);
    };

    /**
     * @name this.remove
     * @memberof Object3D
     *
     * @function
     * @param {Object3D|THREE.Object3D} child
     */
    this.remove = function(child) {
        this.group.remove(child.group || child);
    };

    this.onDestroy = function() {
        if (this.group && this.group.parent) this.group.parent.remove(this.group);
    }
});