const fs = require('fs');
const timer = require('./timer');
const EventEmitter = require('events')
const f = require('./fetch');

let events = new EventEmitter();
self.addEventListener = events.addEventListener;
self.removeEventListener = events.removeEventListener;
self.fireEvent = self.dispatchEvent = events.fireEvent;

EXOKIT.tick = _ => {
    self.__internalTimer();
};

EXOKIT.init = path => {
    if (EXOKIT.rootPath.charAt(EXOKIT.rootPath.length-1) != '/') EXOKIT.rootPath += '/';
    EXOKIT.evaluate(fs.readFileSync(EXOKIT.rootPath + path), path);
};

const _getArrayType = function(array) {
    if (array instanceof Uint16Array) return 'Uint16Array';
    return 'Float32Array';
};

EXOKIT.onMessage = function(message) {
    self.fireEvent('message', {data: JSON.parse(message)});
};

self.postMessage = function(msg, buffer) {
    if (buffer) {
        for (let key in msg) {
            if (ArrayBuffer.isView(msg[key])) {
                let typedArray = msg[key];
                let type = _getArrayType(typedArray);
                let id = (Date.now() + Math.round(Math.random() * 5000)).toString();
                let typedKey = `t_${type}/${key}/${id}`;
                msg[key] = typedKey;
                EXOKIT.transferData(typedKey, typedArray);
            }
        }
    }
    EXOKIT.postMessage(JSON.stringify(msg));
};

self.importScripts = function() {
    for (let i = 0; i < arguments.length; i++) {
        EXOKIT.evaluate(fs.readFileSync(EXOKIT.rootPath + arguments[i]), arguments[i]);
    }
};
