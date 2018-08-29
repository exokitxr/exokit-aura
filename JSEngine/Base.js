window = this;
global = this;

window.screen = {};
window.EXOKIT = {};
EXOKIT._emptyBuffer = {_id: 0};
EXOKIT._emptyTexture = {_id: 0};
EXOKIT._emptyVertexArray = {_id: 0};
EXOKIT._emptyFrameBuffer = {_id: 1}; //Important!
EXOKIT._emptyRenderBuffer = {_id: 2};

EXOKIT._img = {'_src': '-1'};
EXOKIT.onDrawFrame = function(stage) {
    window.innerWidth = stage.width;
    window.innerHeight = stage.height;
    if (EXOKIT.prevStage) {
        if (stage.width != EXOKIT.prevStage.width || stage.height != EXOKIT.prevStage.height) {
            window.onresize && window.onresize();
        }
    }
    EXOKIT.prevStage = stage;
    EXOKIT.animationFrame && EXOKIT.animationFrame(performance.now());
    window.__internalTimer();
};

EXOKIT.onload = function() {
    if (StoredEvents.load) StoredEvents.load.forEach(cb => cb());
};

(function() {
    let c = console;
    window.console = {
      log: function(c) {
        print("LOG :: " +(typeof c === 'object' ? JSON.stringify(c) : c));
        c && c.log && c.log.apply(this, arguments);
      },

      warn: function(c, d) {
        print("WARN :: " + c + " " + d);
        c && c.warn && c.warn.apply(this, arguments);
      },

      error: function(c, d) {
        print("ERROR :: " + c + d);
        c && c.error && c.error.apply(this, arguments);
      },

      trace: function(c) {
        let e = new Error();
        print("TRACE :: " + e.toString());
        c && c.trace && c.trace.apply(this, arguments);
      }
    };
})();

console.time = function() {
    console._saveTime = performance.now();
}

console.timeEnd = function() {
    console.log(performance.now() - console._saveTime);
}

window.requestAnimationFrame = function(callback) {
    EXOKIT.animationFrame = callback;
}

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

window.document = {};
window.document.createElement = window.document.createDocumentFragment = function(type) {
    if (type == 'video') return new VideoElement();
    return createElement();
};

window.document.getElementsByTagName = function() {
    return [createElement()];
}

window.document.body = createElement();
window.document.documentElement = createElement();
window.document.getElementById = createElement;

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

window.StoredEvents = {};
window.addEventListener = function(evt, cb) {
    if (!StoredEvents[evt]) StoredEvents[evt] = [];
    StoredEvents[evt].push(cb);
};

window.removeEventListener = function(evt, cb) {
    let array = StoredEvents[evt];
    if (array) array.splice(array.indexOf(cb), 1);
};

window.Audio = {};
