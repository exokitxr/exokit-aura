var _callbacks = [];

var _time = Date.now();

function loop() {
    var date = Date.now();
    var delta = date - _time;
    for (var i = 0; i < _callbacks.length; i++) {
        var c = _callbacks[i];
        c.current += delta;
        if (c.current >= c.time) {
            c();

            if (c.interval) {
                c.current = 0;
            } else {
                var index = _callbacks.indexOf(c);
                if (index > -1) _callbacks.splice(index, 1);
            }
        }
    }
    _time = date;
}

function find(ref) {
    for (var i = _callbacks.length-1; i > -1; i--) {
        var c = _callbacks[i];
        if (c.ref == ref) return c;
    }
}

function create(callback, time) {
    callback.time = time;
    callback.current = 0;
    callback.ref = Date.now();
    _callbacks.push(callback);
    return callback;
}

window.setTimeout = function(callback, time) {
    create(callback, time);
    return callback.ref;
}

window.setInterval = function(callback, time) {
    create(callback, time);
    callback.interval = true;
    return callback.ref;
}

window.clearTimeout = window.clearInterval = function(ref) {
    var c = find(ref);
    var index = _callbacks.indexOf(c);
    if (index > -1) _callbacks.splice(index, 1);
}

window.__internalTimer = loop;
