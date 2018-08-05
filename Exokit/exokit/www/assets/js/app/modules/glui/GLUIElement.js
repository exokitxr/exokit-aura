Class(function GLUIElement() {
    Inherit(this, Component);
    const _this = this;

    this.group = $gl(0, 0);

    this.create = function (w, h, t) {
        return this.group.create(w, h, t);
    }
});