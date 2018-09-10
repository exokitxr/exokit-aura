const EventEmitter = require('events');
const gl = require('./gl');

function Canvas() {
    this.style = {};

    this.getContext = function(type) {
        if (type == '2d') throw 'Canvas 2D is not yet supported';
        _gl.type = type;
        gl.initialize(_gl);
        return _gl;
    }
}

window.document = {};
document.createElement = document.createDocumentFragment = function(type) {
    if (type == 'canvas') return new Canvas();
    return createElement();
}

window.document.getElementsByTagName = function() {
    return [createElement()];
}

window.document.body = createElement();
window.document.documentElement = createElement();
window.document.getElementById = document.createElement;

window.location = {
    hash: '',
    search: '',
    href: 'EXOKIT',
    hostname: 'EXOKIT',
    pathname: '',
    reload: function() {}
}

window.navigator = {};
window.navigator.userAgent = 'Exokit';

window.history = {};

function createElement() {
    var el = {};
    el.style = {};
    el.appendChild = function() {};

    return el;
}

let events = new EventEmitter();
window.addEventListener = events.addEventListener;
window.removeEventListener = events.removeEventListener;
window.fireEvent = events.fireEvent;
