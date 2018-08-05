/**
 * Native polyfills and extensions for Hydra
 * @name Polyfill
 */

if (typeof(console) === 'undefined') {
    window.console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = function() {};
}

window.performance = (function() {
    if (window.performance && window.performance.now) return window.performance;
    else return Date;
})();

Date.now = Date.now || function() { return +new Date; };

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            (function() {
                const start = Date.now();
                return function(callback) {
                    window.setTimeout(() => callback(Date.now() - start), 1000 / 60);
                }
            })();
    })();
}

/**
 * Temporary alias for Core. Gets overwritten when Timer instantiated.
 * @see Timer
 * @private
 */
window.defer = window.requestAnimationFrame;

/**
 * Extends clearTimeout to clear hydra timers as well as native setTimeouts
 * @name window.clearTimeout
 * @memberof Polyfill
 *
 * @function
 * @param {Number} ref
 * @example
 * let timer = _this.delayedCall(myFunc, 1000);
 * clearTimeout(timer);
 */
window.clearTimeout = (function() {
    if (!window.clearTimeout) return;
    const _clearTimeout = clearTimeout;
    return function(ref) {

        // If Timer exists, try and see if is a hydra timer ref otherwise run native
        if (window.Timer) return Timer.__clearTimeout(ref) || _clearTimeout(ref);
        return _clearTimeout(ref);
    }
})();

/**
 * Fires callback when framerate idles, else fire at max time. Alias of window.requestIdleCallback
 * @name window.onIdle
 * @memberof Polyfill
 *
 * @function
 * @param {Function} callback
 * @param {Number} max - Milliseconds
 * @example
 * onIdle(myFunc, 1000);
 */
window.requestIdleCallback = (function() {
    const _requestIdleCallback = window.requestIdleCallback;
    return function(callback, max) {
        if (_requestIdleCallback) {
            return _requestIdleCallback(callback, max ? {timeout: max} : null);
        }
        return defer(() => {
            callback({didTimeout: false});
        }, 0);
    }
})();

window.onIdle = window.requestIdleCallback;

if (typeof Float32Array == 'undefined') Float32Array = Array;

/**
 * @name Math.sign
 * @memberof Polyfill
 *
 * @function
 * @param  {Number} x
 * @return {Number} Returns 1.0 if above 0.0, or -1.0 if below
 */
Math.sign = function(x) {
    x = +x; // convert to a number
    if (x === 0 || isNaN(x)) return Number(x);
    return x > 0 ? 1 : -1;
};

/**
 * Returns rounded number, with decimal places equal to precision
 * @name Math.round
 * @memberof Polyfill
 *
 * @function
 * @param {Number} Value to be rounded
 * @param {Integer} [precision = 0] Number of decimal places to return. 0 for integers.
 * @returns {Number} Rounded number
 * @example
 * // Returns 3.14
 * Math.round(3.14854839, 2);
 */
Math._round = Math.round;
Math.round = function(value, precision = 0) {
    let p = Math.pow(10, precision);
    return Math._round(value * p) / p;
};

/**
 * Returns random number between min and max values inclusive, with decimal places equal to precision
 * @name Math.random
 * @memberof Polyfill
 *
 * @function
 * @param {Number} [min=0] Min possible returned value
 * @param {Number} [max=1] Max possible returned value - inclusive.
 * @param {Integer} [precision = 0] Number of decimal places to return. 0 for integers.
 * @returns {Number} Between min and max inclusive
 * @example
 * // Returns int between 3 and 5 inclusive
 * Math.random(3, 5, 0);
 */
Math._random = Math.random;
Math.rand = Math.random = function(min, max, precision = 0) {
    if (typeof min === 'undefined') return Math._random();
    if (min === max) return min;

    min = min || 0;
    max = max || 1;

    if (precision == 0) return Math.floor(Math._random() * ((max+1) - min) + min);
    return Math.round((min + Math._random() * (max - min)), precision);
};

/**
 * Converts radians into degrees
 * @name Math.degrees
 * @memberof Polyfill
 *
 * @function
 * @param {Number} radians
 * @returns {Number}
 */

Math.degrees = function(radians) {
    return radians * (180 / Math.PI);
};

/**
 * Converts degrees into radians
 * @name Math.radians
 * @memberof Polyfill
 *
 * @function
 * @param {Number} degrees
 * @returns {Number}
 */
Math.radians = function(degrees) {
    return degrees * (Math.PI / 180);
};

/**
 * Clamps value between min and max
 * @name Math.clamp
 * @memberof Polyfill
 *
 * @function
 * @param {Number} value
 * @param {Number} [min = 0]
 * @param {Number} [max = 1]
 * @returns {Number}
 */
Math.clamp = function(value, min = 0, max = 1) {
    return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
};

/**
 * Maps value from an old range onto a new range
 * @name Math.map
 * @memberof Polyfill
 *
 * @function
 * @param {Number} value
 * @param {Number} [oldMin = -1]
 * @param {Number} [oldMax = 1]
 * @param {Number} [newMin = 0]
 * @param {Number} [newMax = 1]
 * @param {Boolean} [isClamp = false]
 * @returns {Number}
 * @example
 * // Convert sine curve's -1.0 > 1.0 value to 0.0 > 1.0 range
 * let x = Math.map(Math.sin(time));
 * @example
 * // Shift range
 * let y = 80;
 * let x = Math.map(y, 0, 200, -10, 10);
 * console.log(x); // logs -2
 * @example
 * // Reverse direction and shift range
 * let y = 0.9;
 * let x = Math.map(y, 0, 1, 200, 100);
 * console.log(x); // logs 110
 */
Math.map = Math.range = function(value, oldMin = -1, oldMax = 1, newMin = 0, newMax = 1, isClamp) {
    const newValue = (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
    if (isClamp) return Math.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax));
    return newValue;
};

/**
 * Return blend between two values based on alpha paramater
 * @name Math.mix
 * @memberof Polyfill
 *
 * @function
 * @param {Number} a
 * @param {Number} b
 * @param {Number} alpha - Range of 0.0 to 1.0. Value of 0.0 returns a, value of 1.0 returns b
 * @returns {Number}
 * @example
 * console.log(Math.mix(0, 10, 0.4)); // logs 4
 */
Math.mix = function(a, b, alpha) {
    return a * (1.0 - alpha) + b * alpha;
};

/**
 * Returns 0.0 if value less than edge, 1.0 if greater.
 * @name Math.step
 * @memberof Polyfill
 *
 * @function
 * @param {Number} edge
 * @param {Number} value
 * @returns {Number}
 */
Math.step = function(edge, value) {
    return (value < edge) ? 0 : 1;
};

/**
 * Returns 0.0 if value less than min, 1.0 if greater than max. Otherwise the return value is interpolated between 0.0 and 1.0 using Hermite polynomials.
 * @name Math.smoothstep
 * @memberof Polyfill
 *
 * @function
 * @param {Number} min
 * @param {Number} max
 * @param {Number} value
 * @returns {Number}
 */
Math.smoothStep = function(min, max, value) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
};

/**
 * Returns fraction part of value
 * @name Math.fract
 * @memberof Polyfill
 *
 * @function
 * @param {Number} value
 * @returns {Number}
 */
Math.fract = function(value) {
    return value - Math.floor(value);
};

/**
 * Modulo limited to positive numbers
 * @name Math.mod
 * @memberof Polyfill
 *
 * @function
 * @param {Number} value
 * @param {Number} n
 * @returns {Number}
 */
Math.mod = function(value, n) {
    return ((value % n) + n) % n;
};

/**
 * Shuffles array
 * @name Array.prototype.shuffle
 * @memberof Polyfill
 *
 * @function
 * @returns {Array} shuffled 
 */
Array.prototype.shuffle = function() {
    let i = this.length - 1;
    let temp, r;
    while (i !== 0) {
        r = Math.random(0, i, 0);
        i -= 1;
        temp = this[i];
        this[i] = this[r];
        this[r] = temp;
    }
    return this;
};

Array.storeRandom = function(arr) {
    arr.randomStore = [];
};

/**
 * Returns random element. If range passed in, will not return same element again until function has been called enough times to surpass the value.
 * @name Array.prototype.random
 * @memberof Polyfill
 *
 * @function
 * @param {Integer} [range]
 * @returns {ArrayElement}
 * @example
 * let a = [1, 2, 3, 4];
 * for (let i = 0; i < 6; i++) console.log(a.random(4)); // logs 3, 1, 2, 4, 3, 1
 */
Array.prototype.random = function(range) {
    let value = Math.random(0, this.length - 1);
    if (arguments.length && !this.randomStore) Array.storeRandom(this);
    if (!this.randomStore) return this[value];
    if (range > this.length - 1) range = this.length;
    if (range > 1) {
        while (!!~this.randomStore.indexOf(value)) if ((value += 1) > this.length - 1) value = 0;
        this.randomStore.push(value);
        if (this.randomStore.length >= range) this.randomStore.shift();
    }
    return this[value];
};

/**
 * Finds and removes element value from array
 * @name Array.prototype.remove
 * @memberof Polyfill
 *
 * @function
 * @param {ArrayElement} element - Element to remove
 * @returns {Array} Array containing removed element
 * @example
 * let a = ['cat', 'dog'];
 * a.remove('cat');
 * console.log(a); // logs ['dog']
 */
Array.prototype.remove = function(element) {
    if (!this.indexOf) return;
    const index = this.indexOf(element);
    if (!!~index) return this.splice(index, 1);
};

/**
 * Returns last element
 * @name Array.prototype.last
 * @memberof Polyfill
 *
 * @function
 * @returns {ArrayElement}
 */
Array.prototype.last = function() {
    return this[this.length - 1]
};

window.Promise = window.Promise || {};

/**
 * Returns new Promise object
 * @name Promise.create
 * @memberof Polyfill
 *
 * @function
 * @returns {Promise}
 * @example
 * function waitOneSecond() {
 *     let p = Promise.create();
 *     _this.delayedCall(p.resolve, 1000);
 *     return p
 * }
 * waitOneSecond().then(() => console.log('happy days'));
 */
Promise.create = function() {
    const promise = new Promise((resolve, reject) => {
        this.temp_resolve = resolve;
        this.temp_reject = reject;
    });
    promise.resolve = this.temp_resolve;
    promise.reject = this.temp_reject;
    delete this.temp_resolve;
    delete this.temp_reject;
    return promise;
};

/**
 * Check if string contains phrase
 * @name String.prototype.includes
 * @memberof Polyfill
 *
 * @function
 * @param {String|String[]} str - Either a string or array of strings to check for
 * @returns {boolean}
 * @example
 * let userName = 'roger moore';
 * console.log(userName.includes(['steve', 'andrew', 'roger']); // logs true
 */
String.prototype.includes = function(str) {
    if (!Array.isArray(str)) return !!~this.indexOf(str);
    for (let i = str.length - 1; i >= 0; i--) {
        if (!!~this.indexOf(str[i])) return true;
    }
    return false;
};

String.prototype.strpos = function(str) {
    console.warn('strpos deprecated: use .includes()');
    return this.includes(str);
};


/**
 * Returns clipped string. Doesn't alter original string.
 * @name String.prototype.clip
 * @memberof Polyfill
 *
 * @function
 * @param {Number} num - character length to clip to
 * @param {String} [end] - add string to end, such as elipsis '...'
 * @returns {string} - clipped string
 */
String.prototype.clip = function(num, end) {
    return this.length > num ? this.slice(0, num) + end : this;
};

/**
 * Returns string with uppercase first letter. Doesn't alter original string.
 * @name String.prototype.capitalize
 * @memberof Polyfill
 *
 * @function
 * @returns {string}
 */
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * Replaces all occurrences within a string
 * @name String.prototype.replaceAll
 * @memberof Polyfill
 *
 * @function
 * @param {String} find - sub string to be replaced
 * @param {String} replace - sub string that replaces all occurrences
 * @returns {string}
 */
String.prototype.replaceAll = function(find, replace) {
    return this.split(find).join(replace);
};

/**
 * fetch API polyfill
 * @private
 */
if (!window.fetch || (window.nativeHydra && !window._AURA_)) window.fetch = function(url, options) {
    options = options || {};
    const promise = Promise.create();
    const request = new XMLHttpRequest();

    request.open(options.method || 'get', url);

    for (let i in options.headers) {
        request.setRequestHeader(i, options.headers[i]);
    }

    // request.withCredentials = options.credentials == 'include';

    request.onload = () => {
        promise.resolve(response());
    };

    request.onerror = promise.reject;

    request.send(options.body);

    function response() {
        let keys = [],
            all = [],
            headers = {},
            header;

        request.getAllResponseHeaders().replace(/^(.*?):\s*([\s\S]*?)$/gm, (m, key, value) => {
            keys.push(key = key.toLowerCase());
            all.push([key, value]);
            header = headers[key];
            headers[key] = header ? `${header},${value}` : value;
        });

        return {
            ok: (request.status/200|0) == 1,		// 200-399
            status: request.status,
            statusText: request.statusText,
            url: request.responseURL,
            clone: response,

            text: () => Promise.resolve(request.responseText),
            json: () => Promise.resolve(request.responseText).then(JSON.parse),
            xml: () => Promise.resolve(request.responseXML),
            blob: () => Promise.resolve(new Blob([request.response])),

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

/**
 * Send http GET request. Wrapper around native fetch api. Automatically parses json.
 * @name window.get
 * @memberof Polyfill
 *
 * @function
 * @param {String} url
 * @param {Object} options
 * @returns {Promise}
 * @example
 * get('assets/geometry/curves.json).then(d => console.log(d));
 */
window.get = function(url, options = {credentials: 'same-origin'}) {
    let promise = Promise.create();
    options.method = 'GET';

    fetch(url, options).then(handleResponse).catch(promise.reject);

    function handleResponse(e) {
        if (!e.ok) return promise.reject(e);
        e.text().then(text => {
            if (text.charAt(0).includes(['[', '{'])) {

                // Try to parse json, else return text
                try {
                    promise.resolve(JSON.parse(text));
                } catch (err) {
                    promise.resolve(text);
                }
            } else {
                promise.resolve(text);
            }
        });
    }

    return promise;
};

/**
 * Send http POST request. Wrapper around native fetch api.
 * @name window.post
 * @memberof Polyfill
 *
 * @function
 * @param {String} url
 * @param {Object} body
 * @param {Object} [options]
 * @returns {Promise}
 */
window.post = function(url, body, options = {}) {
    let promise = Promise.create();
    options.method = 'POST';
    if (body) options.body = JSON.stringify(body);

    fetch(url, options).then(handleResponse).catch(promise.reject);

    function handleResponse(e) {
        if (!e.ok) return promise.reject(e);
        e.text().then(text => {
            if (text.charAt(0).includes(['[', '{'])) {

                // Try to parse json, else return text
                try {
                    promise.resolve(JSON.parse(text));
                } catch (err) {
                    promise.resolve(text);
                }
            } else {
                promise.resolve(text);
            }
        });
    }

    return promise;
};
/**
 * Class creation and stucture.
 * @name Core
 */

/**
 * Class constructor
 * @name Class
 * @memberof Core
 *
 * @function
 * @param {Function} _class - main class function
 * @param {String|Function} [_type] - class type ('static' or 'singleton') or static function
 * @param {Function} [_static] - static function if type is passed through, useful for 'singleton' type
 * @example
 *
 * // Instance
 * Class(function Name() {
 *     //...
 * });
 *
 * new Name(); // or
 * _this.initClass(Name);
 * @example
 * // Static
 * Class(function Name() {
 *     //...
 * }, 'static');
 *
 * console.log(Name);
 * @example
 * // Singleton
 * Class(function Name() {
 *     //...
 * }, 'singleton');
 *
 * Name.instance();
 * @example
 * // Instance with Static function
 * Class(function Name() {
 *     //...
 * }, function() {
 *     // Static
 *     Name.EVENT_NAME = 'event_name';
 * });
 * @example
 * // Singleton with Static function
 * Class(function Name() {
 *     //...
 * }, 'singleton', function() {
 *     // Static
 * });

 */
window.Class = function(_class, _type, _static) {
    const _this = this || window;

    // Function.name ie12+ only
    const _name = _class.name || _class.toString().match(/function ?([^\(]+)/)[1];

    // Polymorphic if no type passed
    if (typeof _type === 'function') {
        _static = _type;
        _type = null;
    }

    _type = (_type || '').toLowerCase();

    // Instanced Class
    if (!_type) {
        _this[_name] = _class;

        // Initiate static function if passed through
        _static && _static();
    } else {

        // Static Class
        if (_type == 'static') {
            _this[_name] = new _class();

        // Singleton Class
        } else if (_type == 'singleton') {
            _this[_name] = _class;

            (function() {
                let _instance;

                _this[_name].instance = function(a, b, c) {
                    if (!_instance) _instance = new _class(a, b, c);
                    return _instance;
                };
            })();

            // Initiate static function if passed through
            _static && _static();
        }
    }

    // Giving namespace classes reference to namespace
    if (this && this !== window) this[_name]._namespace = this.__namespace;
};

/**
 * Inherit class
 * @name Inherit
 * @memberof Core
 *
 * @function
 * @param {Object} child
 * @param {Function} parent
 * @param {Array} [params]
 * @example
 * Class(function Parent() {
 *     this.method = function() {
 *         console.log(`I'm a Parent`);
 *     };
 * });
 *
 * Class(function Child() {
 *     Inherit(this, Parent);
 *
 *     // Call parent method
 *     this.method();
 *     // Logs 'I'm a Parent'
 *
 *     // Overwrite method
 *     this.method = function() {
 *         console.log(`I'm a Child`);
 *
 *         // Call overwritten method with _ prefix
 *         this._method();
 *     };
 * });
 *
 * let child = new Child();
 *
 * // Need to defer to wait for method overwrite
 * defer(child.method);
 * // Logs 'I'm a Child', 'I'm a Parent'
 */
window.Inherit = function(child, parent) {
    const args = [].slice.call(arguments, 2);
    parent.apply(child, args);

    // Store methods for super calls
    const save = {};
    for (let method in child) {
        save[method] = child[method];
    }

    // defer to wait for child to create of overwrite methods
    defer(() => {
        for (let method in child) {
            if (save[method] && child[method] !== save[method]) {
                // if (child['_' + method]) throw `Attempt to overwrite ${method} method twice in ${child.constructor.name}`;
                child['_' + method] = save[method];
            }
        }
    });
};

/**
 * Create class namespace for hydra
 * @name Namespace
 * @memberof Core
 *
 * @function
 * @param {Object|String} obj
 * @example
 * // Example using object
 * Class(function Baby() {
 *     Namespace(this);
 * }, 'static');
 *
 * Baby.Class(function Powder() {});
 *
 * new Baby.Powder();
 * @example
 * // Example using string
 * Class(function Baby() {
 *     Namespace('Talcum');
 * }, 'static');
 *
 * Talcum.Class(function Powder() {});
 *
 * new Talcum.Powder();
 */
window.Namespace = function(obj) {
    if (typeof obj === 'string') {
        if (!window[obj]) window[obj] = {Class, __namespace: obj};
    } else {
        obj.Class = Class;
        obj.__namespace = obj.constructor.name || obj.constructor.toString().match(/function ([^\(]+)/)[1];
    }
};

/**
 * Object to attach global properties
 * @name window.Global
 * @memberof Core
 *
 * @example
 * Global.PLAYGROUND = true;
 */
window.Global = {};

/**
 * Boolean for if Hydra is running on a thread
 * @name window.THREAD
 * @memberof Core
 */
window.THREAD = false;

/**
 * Hydra namespace. Fires ready callbacks and kicks off Main class once loaded.
 * @name Hydra
 */

Class(function Hydra() {
    const _readyPromise = Promise.create();

    this.HASH = window.location.hash.slice(1);
    this.LOCAL = !window._BUILT_ && (location.hostname.indexOf('local') > -1 || location.hostname.split('.')[0] == '10' || location.hostname.split('.')[0] == '192');

    (function() {
        initLoad();
    })();

    function initLoad() {
        if (!document || !window) return setTimeout(initLoad, 1);
        if (window._NODE_) return setTimeout(loaded, 1);

        if (window._AURA_) {
            if (!window.Main) return setTimeout(initLoad, 1);
            else return setTimeout(loaded, 1);
        }

        window.addEventListener('load', loaded, false);
    }

    function loaded() {
        window.removeEventListener('load', loaded, false);
        _readyPromise.resolve();

        // Initiate app
        if (window.Main) {
            if (window._AURA_) {
                setTimeout(() => Hydra.Main = new window.Main(), 50);
                return;
            }

            _readyPromise.then(() => Hydra.Main = new window.Main());
        }
    }

    /**
     * Trigger page load callback
     * @memberof Hydra
     * @private
     */
    this.__triggerReady = function() {
        loaded();
    };

    /**
     * Attachment for ready event
     * @name Hydra.ready
     * @memberof Hydra
     *
     * @function
     * @param {Function} [callback] Function to trigger upon page load
     * @returns {Promise} - Returns promise if no callback passed in
     * @example
     * // either
     * Hydra.ready(init);
     * // or
     * Hydra.ready().then(init);
     * function init() {}
     */
    this.ready = function(callback) {
        if (!callback) return _readyPromise;
        _readyPromise.then(callback);
    };

}, 'Static');
/**
 * Hydra tool-belt
 * @name Utils
 */

Class(function Utils() {

    /**
     * Parse URL queries
     * @name Utils.query
     * @memberof Utils
     *
     * @function
     * @param {String} key
     * @returns {string}
     * @example
     * // url is myProject/HTML?dev=1
     * console.log(Utls.query('dev')); // logs '1'
     * @example
     * // url is myProject/HTML?dev=0
     * console.log(Utls.query('dev')); // logs false
     * // Also logs false for ?dev=false or ?dev=
     */
    this.query = function(key) {
        const str = decodeURI(window.location.search.replace(new RegExp('^(?:.*[&\\?]' + encodeURI(key).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'));
        if (str == '0') return 0;
        if (!str.length || str == 'false') return location.search.includes(key);
        return str;
    };

    // Object utils

    /**
     * Get class constructor name
     * @name Utils.getConstructorName
     * @memberof Utils
     *
     * @function
     * @param {Object} obj
     * @returns {String}
     */
    this.getConstructorName = function(obj) {
        if (!obj) return obj;
        return obj.constructor.name || obj.constructor.toString().match(/function ([^\(]+)/)[1];
    };

    /**
     * Nullify object's properties
     * @name Utils.nullObject
     * @memberof Utils
     *
     * @function
     * @param {Object} object
     * @returns {null}
     */
    this.nullObject = function(object) {
        if (object.destroy || object.div) {
            for (var key in object) {
                if (typeof object[key] !== 'undefined') object[key] = null;
            }
        }
        return null;
    };

    /**
     * Clone object
     * @name Utils.cloneObject
     * @memberof Utils
     *
     * @function
     * @param {Object} obj
     * @returns {Object}
     */
    this.cloneObject = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Return one of two parameters randomly
     * @name Utils.headsTails
     * @memberof Utils
     *
     * @function
     * @param {Number} n0
     * @param {Number} n1
     * @returns {Object}
     */
    this.headsTails = function(n0, n1) {
        return Math.random(0, 1) ? n1 : n0;
    };

    /**
     * Merge objects. Takes all arguments and merges them into one object.
     * @name Utils.mergeObject
     * @memberof Utils
     *
     * @function
     * @param {Object} Object - Any number of object paramaters
     * @returns {Object}
     */
    this.mergeObject = function() {
        var obj = {};
        for (var i = 0; i < arguments.length; i++) {
            var o = arguments[i];
            for (var key in o) {
                obj[key] = o[key];
            }
        }

        return obj;
    };

    // Mathematical utils

    /**
     * Returns unique timestamp
     * @name Utils.timestamp
     * @memberof Utils
     *
     * @function
     * @returns {string}
     */
    this.timestamp = function() {
        var num = Date.now() + Math.random(0, 99999, 0);
        return num.toString();
    };

    /**
     * Returns random Hex color value
     * @name Utils.randomColor
     * @memberof Utils
     *
     * @function
     * @returns {string} - Hex color value
     */
    this.randomColor = function() {
        var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        if (color.length < 7) color = this.randomColor();
        return color;
    };

    /**
     * Turn number into comma-delimited string
     * @name Utils.numberWithCommas
     * @memberof Utils
     *
     * @function
     * @param {Number} num
     * @returns {String} - String of value with comma delimiters
     */
    this.numberWithCommas = function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    /**
     * Pads number with 0s to match digits amount
     * @name Utils.padInt
     * @memberof Utils
     *
     * @function
     * @param {Number} num - Number value to convert to pad
     * @param {Integer} [digits] - Number of digits to match
     * @param {Boolean} [isLimit] limit to digit amount of 9s
     * @returns {string} - Padded value
     */
    this.padInt = function(num, digits, isLimit) {
        if (isLimit) num = Math.min(num, Math.pow(10, digits) - 1);
        let str = Math.floor(num).toString();
        return Math.pow(10, Math.max(0, digits - str.length)).toString().slice(1) + str;
    };

}, 'Static');
/**
 * Single global requestAnimationFrame render loop to which all other classes attach their callbacks to be triggered every frame
 * @name Render
 */

Class(function Render() {
    const _this = this;
    const _render = [];
    let _last = performance.now();
    let _skipLimit = 200;

    var rAF = requestAnimationFrame;

    (function() {
        if (THREAD) return;
        rAF(render);
    })();

    function render() {
        let tsl = performance.now();
        let delta = tsl - _last;
        delta = Math.min(_skipLimit, delta);
        _last = tsl;

        _this.TIME = tsl;
        _this.DELTA = delta;

        for (let i = _render.length - 1; i >= 0; i--) {
            var callback = _render[i];
            if (!callback) {
                _render.remove(callback);
                continue;
            }
            if (callback.fps) {
                if (tsl - callback.last < 1000 / callback.fps) continue;
                callback(++callback.frame);
                callback.last = tsl;
                continue;
            }
            callback(tsl, delta);
        }

        if (_this.drawFrame) _this.drawFrame(tsl, delta);

        if (!THREAD && !_this.isPaused) rAF(render);
    }

    /**
     * Add callback to render queue
     * @name Render.start
     * @memberof Render
     *
     * @function
     * @param {Function} callback - Function to call
     * @param {Integer} [fps] - Optional frames per second callback rate limit
     * @example
     * // Warp time using multiplier
     * Render.start(loop);
     * let _timewarp = 0;
     * function loop(t, delta) {
     *     console.log(_timewarp += delta * 0.001);
     * }
     * @example
     * // Limits callback rate to 5
     * Render.start(tick, 5);
     *
     * // Frame count is passed to callback instead of time information
     * function tick(frame) {
     *     console.log(frame);
     * }
     */
    this.start = function(callback, fps) {
        if (fps) {
            callback.fps = fps;
            callback.last = -Infinity;
            callback.frame = -1;
        }

        // unshift as render queue works back-to-front
        if (!~_render.indexOf(callback)) _render.unshift(callback);
    };

    /**
     * Remove callback from render queue
     * @name Render.stop
     * @memberof Render
     *
     * @function
     * @param {Function} callback
     */
    this.stop = function(callback) {
        _render.remove(callback);
    };

    /**
     * Force render - for use in threads
     * @name Render.tick
     * @memberof Render
     *
     * @function
     */
    this.tick = function() {
        if (!THREAD) return;
        this.TIME = performance.now();
        render(this.TIME);
    };

    /**
     * Distributed worker constuctor
     * @name Render.Worker
     * @memberof Render

     * @constructor
     * @param {Function} _callback
     * @param {Number} [_budget = 4]
     * @example
     * const worker = _this.initClass(Render.Worker, compute, 1);
     * function compute() {console.log(Math.sqrt(Math.map(Math.sin(performance.now()))))};
     * _this.delayedCall(worker.stop, 1000)
     *
     */
    this.Worker = function(_callback, _budget = 4) {
        Inherit(this, Component);
        let _scope = this;
        let _elapsed = 0;
        this.startRender(loop);
        function loop() {
            while (_elapsed < _budget) {
                if (_scope.dead) return;
                const start = performance.now();
                _callback && _callback();
                _elapsed += performance.now() - start;
            }
            _elapsed = 0;
        }

        this.stop = function() {
            this.dead = true;
            this.stopRender(loop);
            //defer(_ => _scope.destroy());
        }

        this.pause = function() {
            this.stopRender(loop);
        }

        this.resume = function() {
            this.startRender(loop);
        }
    };

    /**
     * Pause global render loop
     * @name Render.pause
     * @memberof Render
     *
     * @function
     */
    this.pause = function() {
        _this.isPaused = true;
    };

    /**
     * Resume global render loop
     * @name Render.resume
     * @memberof Render
     *
     * @function
     */
    this.resume = function() {
        if (!_this.isPaused) return;
        _this.isPaused = false;
        rAF(render);
    };

    /**
     * Use an alternative requestAnimationFrame function (for VR)
     * @name Render.useRAF
     * @param {Function} _callback
     * @memberof Render
     *
     * @function
     */
    this.useRAF = function(raf) {
        rAF = raf;
        rAF(render);
    }

}, 'Static');

/**
 * Timer class that uses hydra Render loop, which has much less overhead than native setTimeout
 * @name Timer
 */

Class(function Timer() {
    const _this = this;
    const _callbacks = [];
    const _discard = [];

    (function() {
        Render.start(loop);
    })();


    function loop(t, delta) {
        for (let i = _discard.length - 1; i >= 0; i--) {
            let obj = _discard[i];
            obj.callback = null;
            _callbacks.remove(obj);
        }
        if (_discard.length) _discard.length = 0;

        for (let i = _callbacks.length - 1; i >= 0; i--) {
            let obj = _callbacks[i];
            if (!obj) {
                _callbacks.remove(obj);
                continue;
            }

            if ((obj.current += delta) >= obj.time) {
                obj.callback && obj.callback.apply(this, obj.args);
                _discard.push(obj);
            }
        }
    }

    function find(ref) {
        for (let i = _callbacks.length - 1; i > -1; i--) if (_callbacks[i].ref == ref) return _callbacks[i];
    }

    //*** Event handlers

    //*** Public methods

    /**
     *
     * @private
     *
     * @param ref
     * @returns {boolean}
     */
    this.__clearTimeout = function(ref) {
        const obj = find(ref);
        if (!obj) return false;
        obj.callback = null;
        _callbacks.remove(obj);
        return true;
    };

    /**
     * Create timer
     * @name Timer.create
     * @memberof Timer
     *
     * @function
     * @param {Function} callback
     * @param {Number} time
     * @returns {Number} Returns timer reference for use with window.clearTimeout
     */
    this.create = function(callback, time) {
        if (window._NODE_) return setTimeout(callback, time);
        const obj = {
            time: Math.max(1, time || 1),
            current: 0,
            ref: Utils.timestamp(),
            callback: callback,
            args: [].slice.call(arguments, 2),
        };
        _callbacks.unshift(obj);
        return obj.ref;
    };

    /**
     * Defer callback until next frame
     * @name window.defer
     * @memberof Timer
     *
     * @function
     * @param {Function} callback
     */
    window.defer = this.defer = function(callback) {
        if (!callback) {
            let promise = Promise.create();
            _this.create(promise.resolve, 1);
            return promise;
        }

        _this.create(callback, 1);
    };

}, 'static');
/**
 * Events class
 * @name Events
 */

Class(function Events() {
    this.events = {};

    const _e = {};
    const _linked = [];
    let _emitter;

    /**
     * Add event listener
     * @name this.events.sub
     * @memberof Events
     *
     * @function
     * @param {Object} [obj] - Optional local object to listen upon, prevents event from going global
     * @param {String} evt - Event string
     * @param {Function} callback - Callback function
     * @returns {Function} callback - Returns callback to be immediately triggered
     * @example
     * // Global event listener
     * _this.events.sub(Events.RESIZE, resize);
     * function resize(e) {};
     * @example
     * // Local event listener
     * _this.events.sub(_someClass, Events.COMPLETE, loaded);
     * function loaded(e) {};
     * @example
     * // Custom event
     * MyClass.READY = 'my_class_ready';
     * _this.events.sub(MyClass.READY, ready);
     * function ready(e) {};
     */
    this.events.sub = function(obj, evt, callback) {
        if (typeof obj !== 'object') {
            callback = evt;
            evt = obj;
            obj = null;
        }

        if (!obj) {
            Events.emitter._addEvent(evt, !!callback.resolve ? callback.resolve : callback, this);
            return callback;
        }

        let emitter = obj.events.emitter();
        emitter._addEvent(evt, !!callback.resolve ? callback.resolve : callback, this);
        emitter._saveLink(this);
        _linked.push(emitter);

        return callback;
    };

    /**
     * Remove event listener
     * @name this.events.unsub
     * @memberof Events
     *
     * @function
     * @param {Object} [obj] - Optional local object
     * @param {String} evt - Event string
     * @param {Function} callback - Callback function
     * @example
     * // Global event listener
     * _this.events.unsub(Events.RESIZE, resize);
     * @example
     * // Local event listener
     * _this.events.unsub(_someClass, Events.COMPLETE, loaded);
     */
    this.events.unsub = function(obj, evt, callback) {
        if (typeof obj !== 'object') {
            callback = evt;
            evt = obj;
            obj = null;
        }

        if (!obj) return Events.emitter._removeEvent(evt, !!callback.resolve ? callback.resolve : callback);
        obj.events.emitter()._removeEvent(evt, !!callback.resolve ? callback.resolve : callback);
    };

    /**
     * Fire event
     * @name this.events.fire
     * @memberof Events
     *
     * @function
     * @param {String} evt - Event string
     * @param {Object} [obj] - Optional passed data
     * @param {Boolean} [isLocalOnly] - If true, prevents event from going global if no-one is listening locally
     * @example
     * // Passing data with event
     * const data = {};
     * _this.events.fire(Events.COMPLETE, {data});
     * _this.events.sub(Events.COMPLETE, e => console.log(e.data);
     * @example
     * // Custom event
     * MyClass.READY = 'my_class_ready';
     * _this.events.fire(MyClass.READY);
     */
    this.events.fire = function(evt, obj, isLocalOnly) {
        obj = obj || _e;
        obj.target = this;
        Events.emitter._check(evt);
        if (_emitter && _emitter._fireEvent(evt, obj)) return;
        if (isLocalOnly) return;
        Events.emitter._fireEvent(evt, obj);
    };

    /**
     * Bubble up local event - subscribes locally and re-emits immediately
     * @name this.events.bubble
     * @memberof Events
     *
     * @function
     * @param {Object} obj - Local object
     * @param {String} evt - Event string
     * @example
     * _this.events.bubble(_someClass, Events.COMPLETE);
     */
    this.events.bubble = function(obj, evt) {
        let _this = this;
        _this.sub(obj, evt, e => _this.fire(evt, e));
    };

    /**
     * Destroys all events and notifies listeners to remove reference
     * @private
     * @name this.events.destroy
     * @memberof Events
     *
     * @function
     * @returns {null}
     */
    this.events.destroy = function() {
        Events.emitter._destroyEvents(this);
        if (_linked) _linked.forEach(emitter => emitter._destroyEvents(this));
        if (_emitter && _emitter.links) _emitter.links.forEach(obj => obj.events && obj.events._unlink(_emitter));
        return null;
    };

    /**
     * Gets and creates local emitter if necessary
     * @private
     * @name this.events.emitter
     * @memberof Events
     *
     * @function
     * @returns {Emitter}
     */
    this.events.emitter = function() {
        if (!_emitter) _emitter = Events.emitter.createLocalEmitter();
        return _emitter;
    };

    /**
     * Unlink reference of local emitter upon its destruction
     * @private
     * @name this.events._unlink
     * @memberof Events
     *
     * @function
     * @param {Emitter} emitter
     */
    this.events._unlink = function(emitter) {
        _linked.remove(emitter);
    };
}, () => {

    /**
     * Global emitter
     * @private
     * @name Events.emitter
     * @memberof Events
     */
    Events.emitter = new Emitter();

    Events.VISIBILITY = 'hydra_visibility';
    Events.HASH_UPDATE = 'hydra_hash_update';
    Events.COMPLETE = 'hydra_complete';
    Events.PROGRESS = 'hydra_progress';
    Events.UPDATE = 'hydra_update';
    Events.LOADED = 'hydra_loaded';
    Events.END = 'hydra_end';
    Events.FAIL = 'hydra_fail';
    Events.SELECT = 'hydra_select';
    Events.ERROR = 'hydra_error';
    Events.READY = 'hydra_ready';
    Events.RESIZE = 'hydra_resize';
    Events.CLICK = 'hydra_click';
    Events.HOVER = 'hydra_hover';
    Events.MESSAGE = 'hydra_message';
    Events.ORIENTATION = 'orientation';
    Events.BACKGROUND = 'background';
    Events.BACK = 'hydra_back';
    Events.PREVIOUS = 'hydra_previous';
    Events.NEXT = 'hydra_next';
    Events.RELOAD = 'hydra_reload';
    Events.FULLSCREEN = 'hydra_fullscreen';

    const _e = {};

    function Emitter() {
        const prototype = Emitter.prototype;
        this.events = [];

        if (typeof prototype._check !== 'undefined') return;
        prototype._check = function(evt) {
            if (typeof evt == 'undefined') throw 'Undefined event';
        };

        prototype._addEvent = function(evt, callback, object) {
            this._check(evt);
            this.events.push({evt, object, callback});
        };

        prototype._removeEvent = function(eventString, callback) {
            this._check(eventString);

            let _this = this;
            let marked = false;

            for (let i = this.events.length - 1; i >= 0; i--) {
                if (this.events[i].evt == eventString && this.events[i].callback == callback) {
                    this.events[i].markedForDeletion = true;
                    marked = true;
                }
            }
            if (marked) defer(() => _this._sweepEvents());
        };

        prototype._sweepEvents = function() {
            for (let i = 0; i < this.events.length; i++) {
                if (this.events[i].markedForDeletion) this.events.remove(this.events[i]);
            }
        }

        prototype._fireEvent = function(eventString, obj) {
            if (this._check) this._check(eventString);
            obj = obj || _e;
            let called = false;
            for (let i = 0; i < this.events.length; i++) {
                let evt = this.events[i];
                if (evt.evt == eventString && !evt.markedForDeletion) {
                    evt.callback(obj);
                    called = true;
                }
            }
            return called;
        };

        prototype._destroyEvents = function(object) {
            for (var i = this.events.length - 1; i >= 0; i--) {
                if (this.events[i].object == object) this.events.splice(i, 1)[0] = null;
            }
        };

        prototype._saveLink = function(obj) {
            if (!this.links) this.links = [];
            if (!~this.links.indexOf(obj)) this.links.push(obj);
        };

        prototype.createLocalEmitter = function() {
            return new Emitter();
        };
    }

    // Global Events
    Hydra.ready(() => {

        /**
         * Visibility event handler
         * @private
         */
        (function() {
            let _lastTime = performance.now();
            let _last;

            Timer.create(addVisibilityHandler, 250);

            function addVisibilityHandler() {
                let hidden, eventName;
                [
                    ['msHidden', 'msvisibilitychange'],
                    ['webkitHidden', 'webkitvisibilitychange'],
                    ['hidden', 'visibilitychange']
                ].forEach(d => {
                    if (typeof document[d[0]] !== 'undefined') {
                        hidden = d[0];
                        eventName = d[1];
                    }
                });

                if (!eventName) {
                    const root = Device.browser == 'ie' ? document : window;
                    root.onfocus = onfocus;
                    root.onblur = onblur;
                    return;
                }

                document.addEventListener(eventName, () => {
                    const time = performance.now();
                    if (time - _lastTime > 10) {
                        if (document[hidden] === false) onfocus();
                        else onblur();
                    }
                    _lastTime = time;
                });
            }

            function onfocus() {
                if (_last != 'focus') Events.emitter._fireEvent(Events.VISIBILITY, {type: 'focus'});
                _last = 'focus';
            }

            function onblur() {
                if (_last != 'blur') Events.emitter._fireEvent(Events.VISIBILITY, {type: 'blur'});
                _last = 'blur';
            }
        })();

        window.Stage = window.Stage || {};
        updateStage();

        window.onresize = function() {
            updateStage();
            Events.emitter._fireEvent(Events.RESIZE);
        };

        window.onorientationchange = window.onresize;

        // Call initially
        defer(window.onresize);

        function updateStage() {
            Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
            Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;
        }
    });
});
/**
 * Simple one-to-one communication board for unrelated classes where global events are not suitable.
 * @name Dispatch
 */

Class(function Dispatch() {
    const _instances = {};

    /**
     * Add class instance to the dispatch board for other classes to reference. Only one instance of each class type allowed.
     * @name Dispatch.registerInstance
     * @memberof Dispatch
     *
     * @function
     * @param {Object} object
     */
    this.registerInstance = function(object) {
        let ref = Utils.getConstructorName(object);
        _instances[ref] = object;
        object.removeDispatch = function() {
            delete _instances[ref];
        };
    };

    /**
     * Find class instance or method from the dispatch board
     * @name Dispatch.lookup
     * @memberof Dispatch
     *
     * @function
     * @param {Function} _class
     * @param {String} [_method] - If method passed in, will search dispatch method board, else will search instance board
     * @returns {Object|Function} Returns either instance or function from relevant dispatch board.
     */
    this.lookup = function(_class) {
        let name = _class.toString().match(/function ([^\(]+)/)[1];

        return _instances[name] || console.error(`No instance ${name} found`);
    };

}, 'static');
/**
 * Read-only class with device-specific information and exactly what's supported.
 * Information split into: system, mobile, media, graphics, style, tween.
 * @name Device
 */

Class(function Device() {
    var _this = this;

    /**
     * Stores user agent as string
     * @name Device.agent
     * @memberof Device
     */
    this.agent = navigator.userAgent.toLowerCase();

    /**
     * Checks user agent against match query
     * @name Device.detect
     * @memberof Device
     *
     * @function
     * @param {String|String[]} match - Either string or array of strings to test against
     * @returns {Boolean}
     */
    this.detect = function(match) {
        return this.agent.includes(match)
    };

    /**
     * Boolean
     * @name Device.touchCapable
     * @memberof Device
     */
    this.touchCapable = !!('ontouchstart' in window);

    /**
     * Alias of window.devicePixelRatio
     * @name Device.pixelRatio
     * @memberof Device
     */
    this.pixelRatio = window.devicePixelRatio;

    //==================================================================================//
    //===// System //===================================================================//

    this.system = {};

    /**
     * Boolean. True if devicePixelRatio greater that 1.0
     * @name Device.system.retina
     * @memberof Device
     */
    this.system.retina = window.devicePixelRatio > 1;

    /**
     * Boolean
     * @name Device.system.webworker
     * @memberof Device
     */
    this.system.webworker = typeof window.Worker !== 'undefined';
    

    /**
     * Boolean
     * @name Device.system.geolocation
     * @memberof Device
     */
    if (!window._NODE_) this.system.geolocation = typeof navigator.geolocation !== 'undefined';

    /**
     * Boolean
     * @name Device.system.pushstate
     * @memberof Device
     */
    if (!window._NODE_) this.system.pushstate = typeof window.history.pushState !== 'undefined';

    /**
     * Boolean
     * @name Device.system.webcam
     * @memberof Device
     */
    this.system.webcam = !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia);

    /**
     * String of user's navigator language
     * @name Device.system.language
     * @memberof Device
     */
    this.system.language = window.navigator.userLanguage || window.navigator.language;

    /**
     * Boolean
     * @name Device.system.webaudio
     * @memberof Device
     */
    this.system.webaudio = typeof window.AudioContext !== 'undefined';

    /**
     * Boolean
     * @name Device.system.xr
     * @memberof Device
     */
    this.system.xr = navigator.getVRDisplays || navigator.xr;

    /**
     * Boolean
     * @name Device.system.localStorage
     * @memberof Device
     */
    try {
        this.system.localStorage = typeof window.localStorage !== 'undefined';
    } catch (e) {
        this.system.localStorage = false;
    }

    /**
     * Boolean
     * @name Device.system.fullscreen
     * @memberof Device
     */
    this.system.fullscreen = document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;

    /**
     * String of operating system. Returns 'ios', 'android', 'blackberry', 'mac', 'windows', 'linux' or 'unknown'.
     * @name Device.system.os
     * @memberof Device
     */
    this.system.os = (function() {
        if (_this.detect(['ipad', 'iphone'])) return 'ios';
        if (_this.detect(['android', 'kindle'])) return 'android';
        if (_this.detect(['blackberry'])) return 'blackberry';
        if (_this.detect(['mac os'])) return 'mac';
        if (_this.detect(['windows', 'iemobile'])) return 'windows';
        if (_this.detect(['linux'])) return 'linux';
        return 'unknown';
    })();

    /**
     * Mobile os version. Currently only applicable to mobile OS.
     * @name Device.system.version
     * @memberof Device
     */
    this.system.version = (function() {
        try {
            if (_this.system.os == 'ios') {
                var num = _this.agent.split('os ')[1].split('_');
                var main = num[0];
                var sub = num[1].split(' ')[0];
                return Number(main + '.' + sub);
            }
            if (_this.system.os == 'android') {
                var version = _this.agent.split('android ')[1].split(';')[0];
                if (version.length > 3) version = version.slice(0, -2);
                if (version.charAt(version.length-1) == '.') version = version.slice(0, -1);
                return Number(version);
            }
            if (_this.system.os == 'windows') {
                if (_this.agent.includes('rv:11')) return 11;
                return Number(_this.agent.split('windows phone ')[1].split(';')[0]);
            }
        } catch(e) {}
        return -1;
    })();

    /**
     * String of browser. Returns, 'social, 'chrome', 'safari', 'firefox', 'ie', 'browser' (android), or 'unknown'.
     * @name Device.system.browser
     * @memberof Device
     */
    this.system.browser = (function() {
        if (_this.system.os == 'ios') {
            if (_this.detect(['twitter', 'fbios'])) return 'social';
            if (_this.detect(['crios'])) return 'chrome';
            if (_this.detect(['safari'])) return 'safari';
            return 'unknown';
        }
        if (_this.system.os == 'android') {
            if (_this.detect(['twitter', 'fb', 'facebook'])) return 'social';
            if (_this.detect(['chrome'])) return 'chrome';
            if (_this.detect(['firefox'])) return 'firefox';
            return 'browser';
        }
        if (_this.detect(['msie'])) return 'ie';
        if (_this.detect(['trident']) && _this.detect(['rv:'])) return 'ie';
        if (_this.detect(['windows']) && _this.detect(['edge'])) return 'ie';
        if (_this.detect(['chrome'])) return 'chrome';
        if (_this.detect(['safari'])) return 'safari';
        if (_this.detect(['firefox'])) return 'firefox';

        // TODO: test windows phone and see what it returns
        //if (_this.os == 'Windows') return 'ie';
        return 'unknown';
    })();

    /**
     * Number value of browser version
     * @name Device.browser.browserVersion
     * @memberof Device
     */
    this.system.browserVersion = (function() {
        try {
            if (_this.system.browser == 'chrome') return Number(_this.agent.split('chrome/')[1].split('.')[0]);
            if (_this.system.browser == 'firefox') return Number(_this.agent.split('firefox/')[1].split('.')[0]);
            if (_this.system.browser == 'safari') return Number(_this.agent.split('version/')[1].split('.')[0].split('.')[0]);
            if (_this.system.browser == 'ie') {
                if (_this.detect(['msie'])) return Number(_this.agent.split('msie ')[1].split('.')[0]);
                if (_this.detect(['rv:'])) return Number(_this.agent.split('rv:')[1].split('.')[0]);
                return Number(_this.agent.split('edge/')[1].split('.')[0]);
            }
        } catch(e) {
            return -1;
        }
    })();

    //==================================================================================//
    //===// Mobile //===================================================================//

    /**
     * Object that only exists if device is mobile or tablet
     * @name Device.mobile
     * @memberof Device
     */
    this.mobile = !window._NODE_ && (!!(('ontouchstart' in window) || ('onpointerdown' in window)) && this.detect(['ios', 'iphone', 'ipad', 'windows phone', 'android', 'blackberry'])) ? {} : false;
    if (this.mobile && this.detect(['windows']) && !this.detect(['touch'])) this.mobile = false;
    if (this.mobile) {

        /**
         * Boolean
         * @name Device.mobile.tablet
         * @memberof Device
         */
        this.mobile.tablet = Math.max(window.screen ? screen.width : window.innerWidth, window.screen ? screen.height : window.innerHeight) > 1000;

        /**
         * Boolean
         * @name Device.mobile.phone
         * @memberof Device
         */
        this.mobile.phone = !this.mobile.tablet;

        /**
         * Boolean
         * @name Device.mobile.pwa
         * @memberof Device
         */
        this.mobile.pwa = (function() {
            if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
            if (window.navigator.standalone) return true;
            return false;
        })();

        /**
         * Boolean. Only available after Hydra is ready
         * @name Device.mobile.native
         * @memberof Device
         */
        Hydra.ready(() => {
            _this.mobile.native = (function() {
                if (Mobile.NativeCore && Mobile.NativeCore.active) return true;
                if (window._AURA_) return true;
                return false;
            })();
        });
    }

    //=================================================================================//
    //===// Media //===================================================================//

    this.media = {};

    /**
     * String for preferred audio format ('ogg' or 'mp3'), else false if unsupported
     * @name Device.media.audio
     * @memberof Device
     */
    this.media.audio = (function() {
        if (!!document.createElement('audio').canPlayType) {
            return _this.detect(['firefox', 'opera']) ? 'ogg' : 'mp3';
        } else {
            return false;
        }
    })();

    /**
     * String for preferred video format ('webm', 'mp4' or 'ogv'), else false if unsupported
     * @name Device.media.video
     * @memberof Device
     */
    this.media.video = (function() {
        var vid = document.createElement('video');
        if (!!vid.canPlayType) {
            if (vid.canPlayType('video/webm;')) return 'webm';
            return 'mp4';
        } else {
            return false;
        }
    })();

    /**
     * Boolean
     * @name Device.media.webrtc
     * @memberof Device
     */
    this.media.webrtc = !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.msRTCPeerConnection || window.oRTCPeerConnection || window.RTCPeerConnection);

    //====================================================================================//
    //===// Graphics //===================================================================//

    this.graphics = {};

    /**
     * Object with WebGL-related information. False if WebGL unsupported.
     * @name Device.graphics.webgl
     * @memberof Device
     * @example
     * Device.graphics.webgl.renderer
     * Device.graphics.webgl.version
     * Device.graphics.webgl.glsl
     * Device.graphics.webgl.extensions
     * Device.graphics.webgl.gpu
     * Device.graphics.webgl.extensions
     */
    this.graphics.webgl = (function() {
        let DISABLED = false;

        Object.defineProperty(_this.graphics, 'webgl', {
           get: () => {
               if (DISABLED) return false;

               if (window.EXOKIT) {
                   _this.graphics._webglContext = {detect: _ => {
                       return false;
                   }, gpu: ''};
                   return _this.graphics._webglContext;
               }

               if (_this.graphics._webglContext) return _this.graphics._webglContext;

               try {
                   const names = ['webgl2', 'webgl', 'experimental-webgl'];
                   const canvas = document.createElement('canvas');
                   let gl;
                   for (let i = 0; i < names.length; i++) {
                       gl = canvas.getContext(names[i]);
                       if (gl) break;
                   }

                   let info = gl.getExtension('WEBGL_debug_renderer_info');
                   let output = {};
                   if (info) {
                       let gpu = info.UNMASKED_RENDERER_WEBGL;
                       output.gpu = gl.getParameter(gpu).toLowerCase();
                   }

                   output.renderer = gl.getParameter(gl.RENDERER).toLowerCase();
                   output.version = gl.getParameter(gl.VERSION).toLowerCase();
                   output.glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION).toLowerCase();
                   output.extensions = gl.getSupportedExtensions();
                   output.webgl2 = output.version.includes(['webgl 2', 'webgl2']);

                   output.detect = function(matches) {
                       if (output.gpu && output.gpu.toLowerCase().includes(matches)) return true;
                       if (output.version && output.version.toLowerCase().includes(matches)) return true;

                       for (let i = 0; i < output.extensions.length; i++) {
                           if (output.extensions[i].toLowerCase().includes(matches)) return true;
                       }
                       return false;
                   };

                   _this.graphics._webglContext = output;
                   return output;
               } catch(e) {
                   return false;
               }
           },

            set: v => {
               if (v === false) DISABLED = true;
            }
        });
    })();

    /**
     * Boolean
     * @name Device.graphics.canvas
     * @memberof Device
     */
    this.graphics.canvas = (function() {
        var canvas = document.createElement('canvas');
        return canvas.getContext ? true : false;
    })();

    //==================================================================================//
    //===// Styles //===================================================================//

    const checkForStyle = (function() {
        let _tagDiv;
        return function (prop) {
            _tagDiv = _tagDiv || document.createElement('div');
            const vendors = ['Khtml', 'ms', 'O', 'Moz', 'Webkit']
            if (prop in _tagDiv.style) return true;
            prop = prop.replace(/^[a-z]/, val => {return val.toUpperCase()});
            for (let i = vendors.length - 1; i >= 0; i--) if (vendors[i] + prop in _tagDiv.style) return true;
            return false;
        }
    })();

    this.styles = {};

    /**
     * Boolean
     * @name Device.styles.filter
     * @memberof Device
     */
    this.styles.filter = checkForStyle('filter');

    /**
     * Boolean
     * @name Device.styles.blendMode
     * @memberof Device
     */
    this.styles.blendMode = checkForStyle('mix-blend-mode');

    //=================================================================================//
    //===// Tween //===================================================================//

    this.tween = {};

    /**
     * Boolean
     * @name Device.tween.transition
     * @memberof Device
     */
    this.tween.transition = checkForStyle('transition');

    /**
     * Boolean
     * @name Device.tween.css2d
     * @memberof Device
     */
    this.tween.css2d = checkForStyle('transform');

    /**
     * Boolean
     * @name Device.tween.css3d
     * @memberof Device
     */
    this.tween.css3d = checkForStyle('perspective');

}, 'Static');
/**
 * Class structure tool-belt that cleans up after itself upon class destruction.
 * @name Component
 */

Class(function Component() {
    Inherit(this, Events);
    const _this = this;
    const _setters = {};
    const _flags = {};
    const _timers = [];
    const _loops = [];

    this.classes = {};

    function defineSetter(_this, prop) {
        _setters[prop] = {};
        Object.defineProperty(_this, prop, {
            set: function(v) {
                if (_setters[prop] && _setters[prop].s) _setters[prop].s.call(_this, v);
                v = null;
            },

            get: function() {
                if (_setters[prop] && _setters[prop].g) return _setters[prop].g.apply(_this);
            }
        });
    }

    /**
     * Define setter for class property
     * @name this.set
     * @memberof Component
     *
     * @function
     * @param {String} prop
     * @param {Function} callback
     */
    this.set = function(prop, callback) {
        if (!_setters[prop]) defineSetter(this, prop);
        _setters[prop].s = callback;
    };

    /**
     * Define getter for class property
     * @name this.get
     * @memberof Component
     *
     * @function
     * @param {String} prop
     * @param {Function} callback
     */
    this.get = function(prop, callback) {
        if (!_setters[prop]) defineSetter(this, prop);
        _setters[prop].g = callback;
    };

    /**
     * Helper to initialise class and keep reference for automatic cleanup upon class destruction
     * @name this.initClass
     * @memberof Component
     *
     * @function
     * @param {Function} clss - class to initialise
     * @param {*} arguments - All additional arguments passed to class constructor
     * @returns {Object} - Instanced child class
     * @example
     * Class(function BigButton(_color) {
     *     console.log(`${this.parent} made me ${_color}); //logs [parent object] made me red
     * });
     * const bigButton _this.initClass(BigButton, 'red');
     */
    this.initClass = function(clss) {
        if (!clss) throw `unable to locate class`;

        const args = [].slice.call(arguments, 1);
        const child = Object.create(clss.prototype);
        child.parent = this;
        clss.apply(child, args);

        // Store reference if child is type Component
        if (child.destroy) {
            const id = Utils.timestamp();
            this.classes[id] = child;
            this.classes[id].__id = id;
        }

        // Automatically attach HydraObject elements
        if (child.element) {
            const last = arguments[arguments.length - 1];
            if (Array.isArray(last) && last.length == 1 && last[0] instanceof HydraObject) last[0].add(child.element);
            else if (this.element && last !== null) this.element.add(child.element);
        }

        // Automatically attach 3D groups
        if (child.group) {
            const last = arguments[arguments.length - 1];
            if (this.group && last !== null) this.group.add(child.group);
        }

        return child;
    };

    /**
     * Create timer callback with automatic cleanup upon class destruction
     * @name this.delayedCall
     * @memberof Component
     *
     * @function
     * @param {Function} callback
     * @param {Number} time
     * @param {*} [args] - any number of arguments can be passed to callback
     */
    this.delayedCall = function(callback, time) {
        const args = [].slice.call(arguments, 2);
        const timer = Timer.create(() => {
            if (!_this || !_this.destroy) return;
            callback && callback.apply(this, args);
        }, time);

        _timers.push(timer);

        // Limit in case dev using a very large amount of timers, so not to local reference
        if (_timers.length > 50) _timers.shift();

        return timer;
    };

    /**
     * Clear all timers linked to this class
     * @name this.clearTimers
     * @memberof Component
     *
     * @function
     */
    this.clearTimers = function() {
        for (let i = _timers.length - 1; i >= 0; i--) clearTimeout(_timers[i]);
        _timers.length = 0;
    };

    /**
     * Start render loop. Stored for automatic cleanup upon class destruction
     * @name this.startRender
     * @memberof Component
     *
     * @function
     * @param {Function} callback
     * @param {Number} [fps] Limit loop rate to number of frames per second. eg Value of 1 will trigger callback once per second
     */
    this.startRender = function(callback, fps) {
        let loop = (a, b, c, d) => {
            let p = _this;
            while (p) {
                if (p.visible === false) return;
                if (p.group && p.group.visible === false) return;
                p = p.parent;
            }

            callback(a, b, c, d);
        };
        _loops.push({callback, loop});
        Render.start(loop, fps);
    };

    /**
     * Stop and cleat render loop linked to callback
     * @name this.stopRender
     * @memberof Component
     *
     * @function
     * @param {Function} callback
     */
    this.stopRender = function(callback) {
        for (let i = 0; i < _loops.length; i++) {
            if (_loops[i].callback == callback) {
                Render.stop(_loops[i].loop);
                _loops.splice(i, 1);
            }
        }
    };

    /**
     * Clear all render loops linked to this class
     * @name this.clearRenders
     * @memberof Component
     *
     * @function
     */
    this.clearRenders = function() {
        for (let i = 0; i < _loops.length; i++) {
            Render.stop(_loops[i].loop);
        }

        _loops.length = 0;
    };

    /**
     * Get callback when object key exists. Uses internal render loop so automatically cleaned up.
     * @name this.wait
     * @memberof Component
     *
     * @function
     * @param {Object} object
     * @param {String} key
     * @param {Function} [callback] - Optional callback
     * @example
     * // Using promise syntax
     * this.wait(this, 'loaded').then(() => console.log('LOADED'));
     * @example
     * // Using callback
     * this.wait(this, 'loaded', () => console.log('LOADED'));
     */
    this.wait = function(object, key, callback) {
        const promise = Promise.create();

        if (typeof object === 'number' && !key) {
            _this.delayedCall(promise.resolve, object);
            return promise;
        }

        // To catch old format of first param being callback
        if (typeof object == 'function' && typeof callback !== 'function') {
            let _object = object;
            object = key;
            key = callback;
            callback = _object;
        }

        callback = callback || promise.resolve;

        Render.start(test);
        function test() {
            if (!object) return Render.stop(test);
            if (!!object[key]) {
                callback();
                Render.stop(test);
            }
        }

        return promise;
    };

    /**
     * Set or get boolean
     * @name this.flag
     * @memberof Component
     *
     * @function
     * @param {String} name
     * @param {Boolean} [value] if no value passed in, current value returned
     * @param {Number} [time] - Optional delay before toggling the value to the opposite of its current value
     * @returns {*} Returns with current value if no value passed in
     */
    this.flag = function(name, value, time) {
        if (typeof value !== 'undefined') {
            _flags[name] = value;

            if (time) {
                clearTimeout(_flags[name+'_timer']);
                _flags[name+'_timer'] = this.delayedCall(() => {
                    _flags[name] = !_flags[name];
                }, time);
            }
        } else {
            return _flags[name];
        }
    };

    /**
     * Destroy class and all of its attachments: events, timers, render loops, children.
     * @name this.destroy
     * @memberof Component
     *
     * @function
     */
    this.destroy = function() {
        if (this.removeDispatch) this.removeDispatch();
        if (this.onDestroy) this.onDestroy();

        for (let id in this.classes) {
            var clss = this.classes[id];
            if (clss && clss.destroy) clss.destroy();
        }
        this.classes = null;

        this.clearRenders && this.clearRenders();
        this.clearTimers && this.clearTimers();

        if (this.events) this.events = this.events.destroy();
        if (this.parent && this.parent.__destroyChild) this.parent.__destroyChild(this.__id);

        return Utils.nullObject(this);
    };

    /**
     * Called from child class to notify of its destruction so the reference can be removed.
     * @private
     * @name this.__destroyChild
     * @memberof Component
     *
     * @function
     * @param name
     */
    this.__destroyChild = function(name) {
        delete this.classes[name];
    };

});
/**
 * Class structure tool-belt that helps with loading and storing data.
 * @name Model
 */

Class(function Model() {
    Inherit(this, Component);
    Namespace(this);

    const _this = this;
    const _storage = {};
    let _data = 0;
    let _triggered = 0;

    /**
     * @name this.push
     * @memberof Model
     *
     * @function
     * @param {String} name
     * @param {*} val
     */
    this.push = function(name, val) {
        _storage[name] = val;
    };

    /**
     * @name this.pull
     * @memberof Model
     *
     * @function
     * @param {String} name
     * @returns {*}
     */
    this.pull = function(name) {
        return _storage[name];
    };

    /**
     * @name this.promiseData
     * @memberof Model
     *
     * @function
     * @param {Number} [num = 1]
     */
    this.waitForData = this.promiseData = function(num = 1) {
        _data += num;
    };

    /**
     * @name this.resolveData
     * @memberof Model
     *
     * @function
     */
    this.fulfillData = this.resolveData = function() {
        _triggered++;
        if (_triggered == _data) {
            _this.dataReady = true;
        }
    };

    /**
     * @name this.ready
     * @memberof Model
     *
     * @function
     * @param {Function} [callback]
     * @returns {Promise}
     */
    this.ready = function(callback) {
        let promise = Promise.create();
        if (callback) promise.then(callback);
        _this.wait(_this, 'dataReady').then(promise.resolve);
        return promise;
    };

    /**
     * Calls init() on object member is exists, and then on self once completed.
     * @name this.initWithData
     * @memberof Model
     *
     * @function
     * @param {Object} data
     */
    this.initWithData = function(data) {
        _this.STATIC_DATA = data;

        for (var key in _this) {
            var model = _this[key];
            var init = false;

            for (var i in data) {
                if (i.toLowerCase().replace(/-/g, "") == key.toLowerCase()) {
                    init = true;
                    if (model.init) model.init(data[i]);
                }
            }

            if (!init && model.init) model.init();
        }

        _this.init && _this.init(data);
    };

    /**
     * Loads url with salt, then calls initWithData on object received
     * @name this.loadData
     * @memberof Model
     *
     * @function
     * @param {String} url
     * @param {Function} [callback]
     * @returns {Promise}
     */
    this.loadData = function(url, callback) {
        let promise = Promise.create();
        if (!callback) callback = promise.resolve;

        var _this = this;
        get(url + '?' + Utils.timestamp()).then( d => {
            defer(() => {
                _this.initWithData(d);
                callback(d);
            });
        });

        return promise;
    };

});

/**
 * @name Modules
 */

Class(function Modules() {
    const _modules = {};

    //*** Constructor
    (function () {
        defer(exec);
    })();

    function exec() {
        for (let m in _modules) {
            for (let key in _modules[m]) {
                let module = _modules[m][key];
                if (module._ready) continue;
                module._ready = true;
                if (module.exec) module.exec();
            }
        }
    }

    function requireModule(root, path) {
        let module = _modules[root];
        if (!module) throw `Module ${root} not found`;
        module = module[path];

        if (!module._ready) {
            module._ready = true;
            if (module.exec) module.exec();
        }

        return module;
    }

    //*** Public methods

    /**
     * @name window.Module
     * @memberof Modules
     *
     * @function
     * @param {Constructor} module
     */
    this.Module = function(module) {
        let m = new module();

        let name = module.toString().slice(0, 100).match(/function ([^\(]+)/);

        if (name) {
            m._ready = true;
            name = name[1];
            _modules[name] = {index: m};
        } else {
            if (!_modules[m.module]) _modules[m.module] = {};
            _modules[m.module][m.path] = m;
        }
    };

    /**
     * @name window.require
     * @memberof Modules
     *
     * @function
     * @param {String} path
     * @returns {*}
     */
    this.require = function(path) {
        let root;
        if (!path.includes('/')) {
            root = path;
            path = 'index';
        } else {
            root = path.split('/')[0];
            path = path.replace(root+'/', '');
        }

        return requireModule(root, path).exports;
    };

    window.Module = this.Module;

    if (!window._NODE_ || window.EJECTA) {
        window.requireNative = window.require;
        window.require = this.require;
    }
}, 'Static');
/**
 * @name LinkedList
 *
 * @constructor
 */

Class(function LinkedList() {
    var prototype = LinkedList.prototype;

    /**
     * @name length
     * @memberof LinkedList
     */
    this.length = 0;
    this.first = null;
    this.last = null;
    this.current = null;
    this.prev = null;

    if (typeof prototype.push !== 'undefined') return;

    /**
     * @name push
     * @memberof LinkedList
     *
     * @function
     * @param {*} obj
     */
    prototype.push = function(obj) {
        if (!this.first) {
            this.first = obj;
            this.last = obj;
            obj.__prev = obj;
            obj.__next = obj;
        } else {
            obj.__next = this.first;
            obj.__prev = this.last;
            this.last.__next = obj;
            this.last = obj;
        }

        this.length++;
    };

    /**
     * @name remove
     * @memberof LinkedList
     *
     * @function
     * @param {*} obj
     */
    prototype.remove = function(obj) {
        if (!obj || !obj.__next) return;

        if (this.length <= 1) {
            this.empty();
        } else {
            if (obj == this.first) {
                this.first = obj.__next;
                this.last.__next = this.first;
                this.first.__prev = this.last;
            } else if (obj == this.last) {
                this.last = obj.__prev;
                this.last.__next = this.first;
                this.first.__prev = this.last;
            } else {
                obj.__prev.__next = obj.__next;
                obj.__next.__prev = obj.__prev;
            }

            this.length--;
        }

        obj.__prev = null;
        obj.__next = null;
    };

    /**
     * @name empty
     * @memberof LinkedList
     *
     * @function
     */
    prototype.empty = function() {
        this.first = null;
        this.last = null;
        this.current = null;
        this.prev = null;
        this.length = 0;
    };

    /**
     * @name start
     * @memberof LinkedList
     *
     * @function
     * @return {*}
     */
    prototype.start = function() {
        this.current = this.first;
        this.prev = this.current;
        return this.current;
    };

    /**
     * @name next
     * @memberof LinkedList
     *
     * @function
     * @return {*}
     */
    prototype.next = function() {
        if (!this.current) return;
        this.current = this.current.__next;
        if (this.length == 1 || this.prev.__next == this.first) return;
        this.prev = this.current;
        return this.current;
    };

    /**
     * @name destroy
     * @memberof LinkedList
     *
     * @function
     * @returns {Null}
     */
    prototype.destroy = function() {
        Utils.nullObject(this);
        return null;
    };

});
/**
 * @name ObjectPool
 *
 * @constructor
 * @param {Constructor} [_type]
 * @param {Number} [_number = 10] - Only applied if _type argument exists
 */

Class(function ObjectPool(_type, _number = 10) {
    var _pool = [];

    /**
     * Pool array
     * @name array
     * @memberof ObjectPool
     */
    this.array = _pool;

    //*** Constructor
    (function() {
        if (_type) for (var i = 0; i < _number; i++) _pool.push(new _type());
    })();

    //*** Public Methods

    /**
     * Retrieve next object from pool
     * @name get
     * @memberof ObjectPool
     *
     * @function
     * @returns {ArrayElement|null}
     */
    this.get = function() {
        return _pool.shift() || (_type ? new _type() : null);
    };

    /**
     * Empties pool array
     * @name empty
     * @memberof ObjectPool
     *
     * @function
     */
    this.empty = function() {
        _pool.length = 0;
    };

    /**
     * Place object into pool
     * @name put
     * @memberof ObjectPool
     *
     * @function
     * @param {Object} obj
     */
    this.put = function(obj) {
        if (obj) _pool.push(obj);
    };

    /**
     * Insert array elements into pool
     * @name insert
     * @memberof ObjectPool
     *
     * @function
     * @param {Array} array
     */
    this.insert = function(array) {
        if (typeof array.push === 'undefined') array = [array];
        for (var i = 0; i < array.length; i++) _pool.push(array[i]);
    };

    /**
     * Retrieve pool length
     * @name length
     * @memberof ObjectPool
     *
     * @function
     * @returns {Number}
     */
    this.length = function() {
        return _pool.length;
    };

    /**
     * Calls destroy method on all members if exists, then removes reference.
     * @name destroy
     * @memberof ObjectPool
     *
     * @function
     * @returns {null}
     */
    this.destroy = function() {
        for (let i = _pool.length - 1; i >= 0; i--) if (_pool[i].destroy) _pool[i].destroy();
        return _pool = null;
    };
}); 
