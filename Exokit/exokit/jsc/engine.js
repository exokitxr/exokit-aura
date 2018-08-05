window = this;

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

window.fetch = function(url, options) {
    if (!FetchRequest.list) FetchRequest.list = [];
    options = options || {};
    delete options.credentials;
    delete options.headers;
    const promise = Promise.create();
    const request = FetchRequest.create();

    let method = options.method || 'GET';
    if (method.toLowerCase() == 'get') {
        delete options.method;
        let query = '';
        for (let key in options) {
            if (!query.length) query = '?';
            query += `${key}=${options[key]}&`;
        }
        query = query.slice(0, -1);
        url += query;
    }

    request.openWithMethodUrl(method, url);

    for (let i in options.headers) {
        request.setRequestHeaderWithKeyValue(i, options.headers[i]);
    }

    request.onload = (data) => {
        FetchRequest.list.splice(FetchRequest.list.indexOf(request), 1);
        promise.resolve(response(data));
    };

    request.onerror = () => {
        FetchRequest.list.splice(FetchRequest.list.indexOf(request), 1);
        promise.reject();
    };

    FetchRequest.list.push(request);

    options.body = options.body || {}
    request.sendWithBody(options.body);

    function response(data) {
        let keys = [],
        all = [],
        headers = {},
        header;

        return {
            ok: true,        // 200-399
            status: 200,
            statusText: data,
            url: '',
            clone: response,

            text: () => Promise.resolve(data),
            json: () => Promise.resolve(data).then(JSON.parse),
            xml: () => Promise.resolve(data),
            blob: () => Promise.resolve(new Blob([data])),

            headers: {
            keys: () => keys,
            entries: () => all,
            get: n => headers[n.toLowerCase()],
            has: n => n.toLowerCase() in headers
            }
        };
    }
    return promise;
};

window.createImageBitmap = function(img) {
    return Promise.resolve(img);
}

window.performance = {};
window._gl = {};
window._canvas = {};
_canvas.style = {};
_canvas.getContext = function() {
  return _gl;
};

_canvas.addEventListener = function() {

};

_gl.getContextAttributes = function() {
    return {};
};

_gl.isContextLost = function() {
    return false;
};

_gl.getParameter = function(param) {
    if (param == _gl.VERSION) return 'Exokit';
    return _gl._getParameter(param)
}

_gl.bindVertexArray = function(buffer) {
    _gl._bindVertexArray(buffer || EXOKIT._emptyVertexArray);
};

_gl.bindBuffer = function(target, buffer) {
    _gl._bindBuffer(target, buffer || EXOKIT._emptyBuffer);
};

_gl.bindFramebuffer = function(target, buffer) {
    _gl._bindFramebuffer(target, buffer || EXOKIT._emptyFrameBuffer);
};

_gl.bindRenderbuffer = function(target, buffer) {
    _gl._bindRenderbuffer(target, buffer || EXOKIT._emptyRenderBuffer);
};

_gl.bindTexture = function(target, buffer) {
    _gl._bindTexture(target, buffer || EXOKIT._emptyTexture);
};

_gl.pixelStorei = function(p0, p1) {
    if (typeof p1 === 'number') _gl._pixelStorei(p0, p1);
}

_gl.texImage2D = function(p0, p1, p2, p3, p4, p5, p6, p7, p8) {
    var img;
    if (p6) {
        img = p8 || EXOKIT._img;
        if (!img._src) img = {intArray: img};
        _gl._texImage2DLong(p0, p1, p2, p3, p4, p5, p6, p7, img);
    } else {
        img = p5 || EXOKIT._img;
        if (!img._src) return;
        _gl._texImage2DShort(p0, p1, p2, p3, p4, img);
    }
};

_gl.uniform1i = function(location, x) {
    if (typeof x === 'boolean') {
        x = !!x ? 1 : 0;
    }

    _gl._uniform1i(location, x);
};

_gl.getExtension = function(name) {
    if (name == 'ANGLE_instanced_arrays') {
        return {
            drawElementsInstancedANGLE: _gl.drawElementsInstanced,
            drawArraysInstancedANGLE: _gl.drawArraysInstanced,
            vertexAttribDivisorANGLE: _gl.vertexAttribDivisor
        };
    } else if (name == 'OES_texture_half_float') {
        return {'HALF_FLOAT_OES': _gl.HALF_FLOAT_OES};
    }

    return 1;
}

_gl.bufferData = function(p0, p1, p2) {
    window.C_glBufferData(p0, p1, p2);
}

_gl.bufferSubData = function(p0, p1, p2, p3) {
    window.C_glBufferSubData(p0, p1, p2, p3);
}

function Timeout() {
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

}
new Timeout();

(function() {
    var _touches = [];
    var _touching = 0;

    window.ontouchstart = () => { };

    function convert(string) {
        let split = string.split('|');
        let touchArray = JSON.parse('[' + split[0].slice(0, -1) + ']');
        let prevTouchArray = JSON.parse('[' + split[1].slice(0, -1) + ']');
        let forceArray = JSON.parse('[' + split[2].slice(0, -1) + ']');

        let touches = [];
        let prevTouches = [];
        let forceIndex = 0;
        for (let i = 0; i < touchArray.length; i += 2) {
            let touch = {};
            touch.x = touchArray[i + 0];
            touch.y = touchArray[i + 1];
            touch.force = Math.min(forceArray[forceIndex++], 1);
            touches.push(touch);
        }

        for (let i = 0; i < prevTouchArray.length; i += 2) {
            let touch = {};
            touch.x = prevTouchArray[i + 0];
            touch.y = prevTouchArray[i + 1];
            prevTouches.push(touch);
        }

        return {touches, prevTouches};
    }

    EXOKIT.touchStart = string => {
        let {touches, prevTouches} = convert(string);
        touches.forEach(t => {
            t.id = Date.now();
            t.pageX = t.x;
            t.pageY = t.y;
            _touches.push(t);
        });

        ++_touching;

        let e = {isTrusted: true, touches: _touches, changedTouches: _touches, currentTarget: window};
        StoredEvents.touchstart && StoredEvents.touchstart.forEach(cb => cb(e));
    };

    EXOKIT.touchEnd = string => {
        if (string == "resignActive") {
            _touching = 0;
            _touches.length = 0;
            let e = {isTrusted: true, touches: [], changedTouches: [{pageX: 0, pageY: 0}], currentTarget: window};
            StoredEvents.touchend && StoredEvents.touchend.forEach(cb => cb(e));
            return;
        }

        let changed = [];
        let {touches, prevTouches} = convert(string);
        touches.forEach((t, j) => {
            for (let i = 0; i < _touches.length; i++) {
                let touch = _touches[i];
                if (prevTouches[j].x == touch.x && prevTouches[j].y == touch.y) {
                    changed.push(touch);
                    _touches.splice(_touches.indexOf(touch), 1);
                }
            }
        });

        --_touching;
        if (!_touching) _touches.length = 0;

        let e = {isTrusted: true, touches: _touches, changedTouches: prevTouches, currentTarget: window};
        StoredEvents.touchend && StoredEvents.touchend.forEach(cb => cb(e));
    };

    EXOKIT.touchMove = string => {
        let {touches, prevTouches} = convert(string);
        touches.forEach((t, j) => {
            for (let i = 0; i < _touches.length; i++) {
                let touch = _touches[i];
                if (prevTouches[j].x == touch.x && prevTouches[j].y == touch.y) {
                    touch.pageX = touch.x = t.x;
                    touch.pageY = touch.y = t.y;
                    touch.force = t.force;
                }
            }
        });

        let e = {isTrusted: true, touches: _touches, changedTouches: _touches, currentTarget: window};
        StoredEvents.touchmove && StoredEvents.touchmove.forEach(cb => cb(e));
    };
})();

function VideoElement() {
    var _progress, _src, _backing, _loop;
    var _volume = 1;
    var _currentTime = 0;

    this.readyState = 4;
    this.style = {};

    this.play = function() {
        _backing.play();
    }

    this.pause = function() {
        _backing.pause();
    }

    this.addEventListener = function(evt, callback) {
        if (evt == 'progress') _progress = evt;
    }

    this.removeEventListener = function() {

    }

    this.setAttribute = this.addAttribute = function() {

    }

    this.getAttribute = this.removeAttribute = function() {

    }

    this.load = function() {
        
    }

    Object.defineProperty(this, 'src', {
       get: function() {
           return _volume;
       },

       set: function(v) {
           this._src = v;
           if (!_backing) {
               _backing = VideoElementBacking.create();
               _backing.setSrc(v);
               _backing._tick = function(currentTime, duration) {
                   _currentTime = currentTime;
                   this.duration = duration;
               };
           }

           if (v == '') _backing.destroy();
       }
    });

    Object.defineProperty(this, 'volume', {
       get: function() {
           return _volume;
       },

       set: function(v) {
           _volume = v;
           _backing.setVolume(v);
       }
    });

    Object.defineProperty(this, 'currentTime', {
       get: function() {
           return _currentTime;
       },

       set: function(v) {
           _backing.setTime(v);
           _currentTime = v;
       }
    });

    Object.defineProperty(this, 'loop', {
       get: function() {
           return _loop;
       },

       set: function(v) {
           _loop = v;
           _backing.setLoop(v);
       }
    });
}

function Worker(_script) {
    var _backing = WorkerBacking.create();
    _backing.load(_script);

    const _events = {};

    this.postMessage = function(data, buffer) {
        let string = JSON.stringify(data);
        _backing.postMessage(string);
    }

    this.addEventListener = function(evt, callback) {
        _events[evt] = callback;
    }

    this.terminate = function() {
        _backing.terminate();
    }

    _backing.receiveMessage = function(string) {
        let data = JSON.parse(string);
        Worker.replaceTransfer(data);
        Worker.replaceTransfer(data.message);
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

