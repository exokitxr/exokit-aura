function Worker(_script) {
    var _backing = WorkerBacking.create();
    _backing.load(_script);

    const _events = {};

    this.postMessage = function(data, buffer) {
//        let string = JSON.stringify(data);
        _backing.postMessage(data);
    }

    this.addEventListener = function(evt, callback) {
        _events[evt] = callback;
    }

    this.terminate = function() {
        _backing.terminate();
    }

    _backing.receiveMessage = function(data) {
//        let data = JSON.parse(string);
//        Worker.replaceTransfer(data);
//        Worker.replaceTransfer(data.message);
        _events.message && _events.message({data});
        Worker.TRANSFERS = {};
    }
}

Worker.replaceTransfer = function(obj) {
    if (!obj) return;
    for (let key in obj) {
        if (typeof obj[key] !== 'string') continue;
        if (obj[key].slice(0, 2) == 't_') {
            obj[key] = Worker.TRANSFERS[obj[key]];
        }
    }
}

Worker.TRANSFERS = {};
EXOKIT.receiveTransfer = function(key, array) {
    let type = key.split('_')[1].split('/')[0];
    Worker.TRANSFERS[key] = new window[type](array);
};

window.Worker = Worker;
