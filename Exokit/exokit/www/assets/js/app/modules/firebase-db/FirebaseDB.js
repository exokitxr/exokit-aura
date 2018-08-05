Class(function FirebaseDB() {
    Inherit(this, Model);
    var _this = this;

    let _database;

    //*** Constructor
    (function () {
        Firebase.ready().then(init);
    })();

    function init() {
        if (!firebase.database) return _this.delayedCall(init);
        _database = firebase.database();
        _this.dataReady = true;
    }

    //*** Event handlers

    //*** Public methods
    this.ref = function(ref) {
        return _database.ref(ref);
    }

    this.insert = function(path, data) {
        return _database.ref(path).push(data).key;
    }

    this.update = function(path, data) {
        return _database.ref(path).set(data);
    }

    this.increment = function(path) {
        return _database.ref(path).transaction( function(count) {
            if (!count) return 1;
            return count+1;
        });
    }

    this.encode = function(data) {
        let out = {}
        for (var key in data) {
            out[btoa(key)] = data[key];
        }
        return out;
    }

    this.decode = function(data) {
        let out = {}
        for (var key in data) {
            out[atob(key)] = data[key];
        }
        return out;        
    }

}, 'Static');