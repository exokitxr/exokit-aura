Class(function InputUILConfig(_name, _uil) {
    const _this = this;

    var prefix = 'INPUT_'+_name;
    var _group = _uil ? _uil.add('group', {name: prefix}) : null;

    //*** Constructor
    (function () {

    })();

    //*** Event handlers

    //*** Public methods
    this.add = function(key, initValue) {
        if (!_group) return this;

        let value = UILStorage.get(`${prefix}_${key}`) || initValue;
        let change = val => {
            UILStorage.set(`${prefix}_${key}`, val);
            if (_this.onUpdate) _this.onUpdate(key);
        };

        if (typeof initValue !== 'undefined' && !UILStorage.get(`${prefix}_${key}`)) {
            change(initValue);
        }

        _group.add('string', { name: key, value, callback: change});

        return this;
    }

    this.get = function(key) {
        let val = UILStorage.get(`${prefix}_${key}`);
        if (!val || val == '') return undefined;
        return val;
    }

    this.getNumber = function(key) {
        return Number(this.get(key));
    }

    this.setValue = function(key, value) {
        UILStorage.set(`${prefix}_${key}`, value);
        return this;
    }
});