Class(function UILFile() {
    Inherit(this, Component);
    const _this = this;

    this.load = async function() {
        await _this.wait(Assets.JSON, 'data/uil');
        return Assets.JSON['data/uil'];
    }

    this.save = function(sessionData, data) {
        Dev.writeFile('assets/data/uil.json', data);
    }

});