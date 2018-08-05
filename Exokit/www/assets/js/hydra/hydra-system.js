/**
 * @name Dev
 */

Class(function Dev() {
    var _this = this;
    var _post, _alert, _inter, _timerName;

    var _id = Utils.timestamp();

    this.emulator = Device.mobile && navigator.platform && navigator.platform.toLowerCase().includes(['mac', 'windows']);
    
    function catchErrors() {
        window.onerror = function(message, file, line) {
            var string = message+' ::: '+file+' : '+line;
            if (_alert) alert(string);
            if (_post) post(_post+'/api/data/debug', getDebugInfo(string));
            if (_this.onError) _this.onError(message, file, line);
        };
    }

    function getDebugInfo(string) {
        var obj = {};
        obj.time = new Date().toString();
        obj.deviceId = _id;
        obj.err = string;
        obj.ua = Device.agent;
        obj.width = Stage.width;
        obj.height = Stage.height;
        obj.screenWidth = screen.width;
        obj.screenHeight = screen.height
        return obj;
    }

    //*** Event handlers

    //*** Public Methods
    this.alertErrors = function(url) {
        _alert = true;
        if (typeof url === 'string') url = [url];
        for (var i = 0; i < url.length; i++) {
            if (location.href.includes(url[i]) || location.hash.includes(url[i])) return catchErrors();
        }
    }

    this.postErrors = function(url, post) {
        _post = post;
        if (typeof url === 'string') url = [url];
        for (var i = 0; i < url.length; i++) {
            if (location.href.includes(url[i])) return catchErrors();
        }
    }
    
    this.expose = function(name, val, force) {
        if (Hydra.LOCAL || force) window[name] = val;
    }

    this.logServer = function(msg) {
        if (_post) post(_post+'/api/data/debug', getDebugInfo(msg));
    }

    this.unsupported = function(needsAlert) {
        if (needsAlert) alert('Hi! This build is not yet ready for this device, things may not work as expected. Refer to build schedule for when this device will be supported.');
    }

    this.checkForLeaks = function(flag, array) {
        var matchArray = function(prop) {
            if (!array) return false;
            for (var i = 0; i < array.length; i++) {
                if (prop.includes(array[i])) return true;
            }
            return false;
        };

        if (navigator.userAgent.includes('Exokit')) return;

        clearInterval(_inter);
        if (flag) {
            _inter = setInterval(function() {
                for (var prop in window) {
                    if (prop.includes('webkit')) continue;
                    var obj = window[prop];
                    if (typeof obj !== 'function' && prop.length > 2) {
                        if (prop.includes('_ga') || prop.includes('_typeface_js') || matchArray(prop)) continue;
                        var char1 = prop.charAt(0);
                        var char2 = prop.charAt(1);
                        if (char1 == '_' || char1 == '$') {
                            if (char2 !== char2.toUpperCase()) {
                                console.log(window[prop]);
                                throw 'Hydra Warning:: '+prop+' leaking into global scope';
                            }
                        }
                    }
                }
            }, 1000);
        }
    }

    this.startTimer = function(name) {
        _timerName = name || 'Timer';
        if (console.time && !window._NODE_) console.time(_timerName);
        else _timer = performance.now();
    }

    this.stopTimer = function() {
        if (console.time && !window._NODE_) console.timeEnd(_timerName);
        else console.log('Render '+_timerName+': '+(performance.now() - _timer));
    }

    this.writeFile = function(file, data) {
        if (!Hydra.LOCAL) return;
        let url = location.protocol + '//' + location.hostname + ':8017' + location.pathname + file;
        post(url, data).then(e => {
            if (e != 'OK') console.warn(`Unable to write to ${file}`);
        });
    }

    if (Hydra.LOCAL) _this.checkForLeaks(true);
}, 'Static');

/**
 * @name Service
 */

Class(function Service() {
    Inherit(this, Component);
    var _this = this;
    var _sw;

    this.active = false;
    this.ready = false;
    this.cached = false;
    this.offline = false;
    this.disabled = false;

    //*** Constructor
    (function () {
    })();

    function initWorker() {
        _this.active = true;
        navigator.serviceWorker.register('sw.js').then(handleRegistration).then(handleReady).then(handleError);
    }

    function checkCache() {
        var cache = Storage.get('service_cache');
        if (cache != window._CACHE_) _this.post('clearCache');
    }

    function getSWAssets() {
        if (!window.ASSETS.SW || _this.cached) return [];
        var assets = window.ASSETS.SW;

        assets.forEach((asset, i) => {
            if (asset.includes('.js')) asset = assets[i].replace('.js', '.js?' + window._CACHE_);
        });

        return assets;
    }

    //*** Event handlers
    function handleRegistration(e) {

    }

    function handleReady(e) {
        _this.ready = true;
        _this.events.fire(Events.READY, e, true);
        _sw = navigator.serviceWorker.controller;

        checkCache();
    }

    function handleError(e) {
        if (e) {
            _this.events.fire(Events.ERROR, e, true);
            _this.active = false;
        }
    }

    function handleMessage(e) {
        var data = e.data;
        if (data.evt) _this.events.fire(data.evt, data);
    }

    //*** Public methods
    this.init = function() {
        Hydra.ready(() => {
            if ('serviceWorker' in navigator && (!Hydra.LOCAL || location.port != '') && !window.process && !_this.disabled) initWorker();
        });
    }

    this.cache = function(assets = []) {
        assets = Array.from(assets);

        let upload = function() {
            _this.post('upload', {assets: assets, cdn: Assets.CDN, hostname: location.hostname, sw: getSWAssets(), offline: _this.offline});
            Storage.set('service_cache', window._CACHE_);
            _this.cached = true;
        };

        if (_this.active) _this.wait(_this, 'ready', upload);
    }

    this.post = function(fn, data = {}) {
        if (!_this.active) return;

        let send = function() {
            let mc = new MessageChannel();
            mc.port1.onmessage = handleMessage;

            data.fn = fn;
            _sw && _sw.postMessage(data, [mc.port2]);
        };

        _this.wait(_this, 'ready', send);
    }
}, 'static');
/**
 * @name Storage
 */

Class(function Storage() {
    var _this = this;
    var _storage;
    
    (function() {
        testStorage();
    })();
    
    function testStorage() {
        try {
            if (window.localStorage) {
                try {
                    window.localStorage['test'] = 1;
                    window.localStorage.removeItem('test');
                    _storage = true;
                } catch (e) {
                    _storage = false;
                }
            } else {
                _storage = false;
            }
        } catch(e) {
            _storage = false;
        }
    }
    
    function cookie(key, value, expires) {
        var options;
        if (arguments.length > 1 && (value === null || typeof value !== "object")) {
            options = {};
            options.path = '/';
            options.expires = expires || 1;

            if (value === null) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            return (document.cookie = [
                encodeURIComponent(key), '=',
                options.raw ? String(value) : encodeURIComponent(String(value)),
                options.expires ? '; expires=' + options.expires.toUTCString() : '',
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        options = value || {};
        var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
        return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
    }

    //*** Public Methods
    this.setCookie = function(key, value, expires) {
        cookie(key, value, expires);
    }
    
    this.getCookie = function(key) {
        return cookie(key);
    }
    
    this.set = function(key, value) {
        if (value != null && typeof value === 'object') value = JSON.stringify(value);
        if (_storage) {
            if (value === null) window.localStorage.removeItem(key);
            else window.localStorage[key] = value;
        } else {
            cookie(key, value, 365);
        }
    }
    
    this.get = function(key) {
        var val;
        if (_storage) val = window.localStorage[key];
        else val = cookie(key);
        
        if (val) {
            var char0;
            if (val.charAt) char0 = val.charAt(0);
            if (char0 == '{' || char0 == '[') val = JSON.parse(val);
            if (val == 'true' || val == 'false') val = val == 'true' ? true : false;
        }
        return val;
    }
} ,'Static');
/**
 * @name Thread
 */

Class(function Thread(_class) {
    Inherit(this, Component);
    var _this = this;
    var _worker, _callbacks, _path, _mvc;

    var _msg = {};
    
    //*** Constructor
    (function() {
        init();
        importClasses();
        addListeners();
    })();
    
    function init() {
        let file = window._ES5_ ? 'assets/js/hydra/hydra-thread-es5.js' : 'assets/js/hydra/hydra-thread.js';
        _callbacks = {};
        _worker = new Worker(Thread.PATH + file);
    }

    function importClasses() {
        importClass(Utils);
        importClass(Component);
        importClass(Events);
        importClass(_class, true);
    }

    function importClass(_class, scoped) {
        if (!_class) return;
        var code, namespace;

        if (!scoped) {
            if (typeof _class !== 'function') {
                code = _class.constructor.toString();
                if (code.includes('[native')) return;
                namespace = _class.constructor._namespace ? _class.constructor._namespace +'.' : '';
                code = namespace + 'Class(' + code + ', "static");';
            } else {
                namespace = _class._namespace ? _class._namespace+'.' : '';
                code = namespace + 'Class(' + _class.toString() + ');';
            }
        } else {
            code = _class.toString().replace('{', '!!!');
            code = code.split('!!!')[1];

            var splitChar = window._MINIFIED_ ? '=' : ' ';

            while (code.includes('this')) {
                var split = code.slice(code.indexOf('this.'));
                var name = split.split('this.')[1].split(splitChar)[0];
                code = code.replace('this', 'self');
                createMethod(name);
            }

            code = code.slice(0, -1);
        }

        _worker.postMessage({code: code});
    }

    function createMethod(name) {
        _this[name] = function(message = {}, callback) {
            let promise;
            if (callback === undefined) {
                promise = Promise.create();
                callback = promise.resolve;
            }

            _this.send(name, message, callback);
            return promise;
        };
    }
    
    //*** Event Handlers
    function addListeners() {
        _worker.addEventListener('message', workerMessage);
    }
    
    function workerMessage(e) {
        if (e.data.console) {

            console.log(e.data.message);

        } else if (e.data.id) {

            var callback = _callbacks[e.data.id];
            if (callback) callback(e.data.message);
            delete _callbacks[e.data.id];

        } else if (e.data.emit) {

            var callback = _callbacks[e.data.evt];
            if (callback) callback(e.data.msg);

        } else {

            var callback = _callbacks['transfer'];
            if (callback) callback(e.data);

        }

    }

    //*** Public methods
    this.on = function(evt, callback) {
        _callbacks[evt] = callback;
    }
    
    this.off = function(evt) {
        delete _callbacks[evt];
    }

    this.loadFunction = function() {
        let names = [];
        let load = code => {
            code = code.toString();
            code = code.replace('(', '!!!');
            var split = code.split('!!!');
            var name = split[0].split(' ')[1];
            code = 'self.'+name+' = function('+split[1];
            _worker.postMessage({code: code});
            createMethod(name);
            names.push(name);
        };
        for (var i = 0; i < arguments.length; i++) load(arguments[i]);
        return names;
    }
    
    this.importScript = function(path) {
        _worker.postMessage({path: Thread.absolutePath(path), importScript: true});
    }

    this.importCode = function(code) {
        _worker.postMessage({code});
    }

    this.importClass = function() {
        for (var i = 0; i < arguments.length; i++) {
            var code = arguments[i];
            importClass(code);
        }
    }

    this.importES6Class = function(name) {
        if (window._ES5_) {
            let Class = window[name];
            let base = Class.toString();
            let proto = [];

            Object.getOwnPropertyNames(Class.prototype).forEach(fn => {
                if (fn == 'constructor' || !Class.prototype[fn]) return;
                proto.push({key: fn, string: Class.prototype[fn].toString()});
            })
            _worker.postMessage({es5: base, name, proto});
        } else {
            _worker.postMessage({es6: `(${eval(name)})`, name});
        }
    }

    this.send = function(name, message, callback) {
        if (typeof name === 'string') {
            var fn = name;
            message = message || {};
            message.fn = name;    
        } else {
            callback = message;
            message = name;
        }

        var id = Utils.timestamp();
        if (callback) _callbacks[id] = callback;

        if (message.transfer) {
            message.msg.id = id;
            message.msg.fn = message.fn;
            message.msg.transfer = true;
            _worker.postMessage(message.msg, message.buffer);
        } else {
            _msg.message = message;
            _msg.id = id;
            _worker.postMessage(_msg);
        }
    }
    
    this.destroy = function() {
        if (_worker.terminate) _worker.terminate();
        if (this._destroy) return this._destroy();
    }
}, () => {
    Thread.PATH = '';

    Thread.absolutePath = function(path) {
        if (window.AURA) return path;
        let base;
        try {
            if (document.getElementsByTagName('base').length > 0) {
                var a = document.createElement('a');
                a.href = document.getElementsByTagName('base')[0].href;
                base = a.pathname;
            }
        } catch(e) {}
        let pathname = base || location.pathname;
        if (pathname.includes('/index.html')) pathname = pathname.replace('/index.html', '');
        let port = Number(location.port) > 1000 ? `:${location.port}` : '';
        return path.includes('http') ? path : location.protocol + '//' + (location.hostname + port + pathname + '/' + path).replace('//', '/');
    }

    Thread.cluster = function() {
        return new function() {
            let index = 0;
            let array = [];

            this.push = function(thread) {
                array.push(thread);
            }

            this.get = function() {
                let thread = array[index];
                index++;
                if (index >= array.length) index = 0;
                return thread;
            }

            this.array = array;
        }
    }

    Thread.upload = function(...args) {
        Thread.shared();
        let name;
        for (let i = 0; i < _shared.array.length; i++) {
            name = _shared.array[i].loadFunction(...args);
        }
        return name;
    }

    var _shared;
    Thread.shared = function(list) {
        if (!_shared) {
            _shared = Thread.cluster();
            let count = navigator.hardwareConcurrency || 4;
            for (let i = 0; i < count; i++) {
                _shared.push(new Thread());
            }
        }


        return list ? _shared : _shared.get();
    }
});
