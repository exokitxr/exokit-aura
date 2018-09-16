const EventEmitter = require('events');
const gl = require('./gl');
const fs = require('fs');
const input = require('./input');
const timer = require('./timer');

function Canvas() {
    this.style = {};

    this.addEventListener = window.addEventListener;
    this.removeEventListener = window.removeEventListener;
    this.fireEvent = window.fireEvent;

    this.getContext = function(type) {
        if (type == '2d') throw 'Canvas 2D is not yet supported';
        _gl.type = type;
        gl.initialize(_gl);
        return _gl;
    }
}

function Script() {
    this.script = true;
}

window.document = new EventEmitter();
document.createElement = document.createDocumentFragment = function(type) {
    if (type == 'canvas') return new Canvas();
    if (type == 'script') return new Script();
    return createElement();
}

window.document.getElementsByTagName = function() {
    return [createElement()];
}

window.document.body = createElement();
window.document.head = createElement();
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
window.navigator.userAgent = 'Exokit iOS';

window.history = {};

function createElement() {
    var el = {};
    el.style = {};
    el.appendChild = function(child) {
        if (child.script) {
            let code = fs.readFileSync(EXOKIT.rootPath + child.src);
            EXOKIT.evaluate(code);
        }
    };

    return el;
}

let events = new EventEmitter();
window.addEventListener = events.addEventListener;
window.removeEventListener = events.removeEventListener;
window.fireEvent = window.dispatchEvent = events.fireEvent;

window.Image = function() { };
Image.prototype = {
	set src (val) {
		this._src = val;
		var dim = _gl._getImageDimensions(val);
		this.width = dim[0];
		this.height = dim[1];
		this.complete = true;
        let _this = this;
        setTimeout(() => _this.onload && _this.onload(), 10);
	},
	get src() {
		return this._src;
	}
};
