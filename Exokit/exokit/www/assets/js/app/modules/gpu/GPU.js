Class(function GPU() {
    Inherit(this, Component);
    var _this = this;
    var _split = {};

    Hydra.ready(() => {

        _this.detect = function (match) {
            if (!Device.graphics.webgl) return;
            return Device.graphics.webgl.detect(match);
        }

        _this.detectAll = function() {
            if (!Device.graphics.webgl) return;
            var match = true;
            for (var i = 0; i < arguments.length; i++) {
                if (!Device.graphics.webgl.detect(arguments[i])) match = false;
            }
            return match;
        }

        _this.matchGPU = function(str, min, max = 99999) {
            let num = splitGPU(str);
            return num >= min && num < max;
        }

        _this.gpu = Device.graphics.webgl ? Device.graphics.webgl.gpu : '';

        function splitGPU(string) {
            if (_split[string]) return _split[string];
            if (!_this.detect(string)) return -1;
            try {
                var num = Number(_this.gpu.split(string)[1].split(' ')[0]);
                _split[string] = num;
                return num;
            } catch (e) {
                return -1;
            }
        }

        Mobile.iOS = require('iOSDevices').find();

        _this.BLACKLIST = require('GPUBlacklist').match();

        _this.T0 = (function () {
            if (Device.mobile) return false;
            if (_this.BLACKLIST) return true;

            if (_this.detect('radeon(tm) r5')) return true;

            if (_this.detectAll('intel', 'hd')) {
                return _this.matchGPU('hd graphics ', 1000, 4400);
            }

            if (_this.gpu.toLowerCase() === 'intel iris opengl engine') return true;

            return false;
        })();

        _this.T1 = (function () {
            if (_this.BLACKLIST) return false;
            if (Device.mobile) return false;

            if (_this.matchGPU('iris(tm) graphics ', 540)) return true;
            if (_this.matchGPU('hd graphics ', 514, 1000)) return true;
            if (!_this.detect(['nvidia', 'amd', 'radeon', 'geforce']) && !_this.T0) return true;

            return false;
        })();

        _this.T2 = (function () {
            if (_this.BLACKLIST) return false;
            if (Device.mobile) return false;
            if (_this.detect(['nvidia', 'amd', 'radeon', 'geforce']) && !_this.T1 && !_this.T0) return true;
            return false;
        })();

        _this.T3 = (function () {
            if (_this.BLACKLIST) return false;
            if (Device.mobile) return false;
            if (_this.detect(['titan', 'amd radeon pro', 'quadro'])) return true;
            if (_this.matchGPU('gtx ', 940)) return true;
            if (_this.matchGPU('radeon (tm) rx ', 400)) return true;
            if (_this.matchGPU('radeon pro ', 420)) return true;
            return false;
        })();

        _this.T4 = (function () {
            if (_this.BLACKLIST) return false;
            if (Device.mobile) return false;
            if (_this.detect(['titan', 'quadro'])) return true;
            if (_this.matchGPU('gtx ', 1040)) return true;
            return false;
        })();

        _this.MT0 = (function () {
            if (!Device.mobile) return false;
            if (Mobile.iOS.includes(['legacy', 'ipad mini 1', '5x', 'ipad 4'])) return true;

            if (Device.system.os == 'android' && _this.detect('sgx')) return true;

            if (_this.detect('adreno')) return _this.matchGPU('adreno (tm) ', 0, 330);
            if (_this.detect('mali')) return _this.matchGPU('mali-t', 0, 628);

            return false;
        })();

        _this.MT1 = (function () {
            if (!Device.mobile) return false;
            if (Mobile.iOS.includes(['5s', 'ipad air 1'])) return true;
            if (Device.system.os == 'android' && !_this.MT0) return true;
            return false;
        })();

        _this.MT2 = (function () {
            if (!Device.mobile) return false;
            if (Mobile.iOS.includes(['6x', 'ipad air 2'])) return true;

            if (_this.detect('adreno')) return _this.matchGPU('adreno (tm) ', 399);
            if (_this.detect('mali-g')) return true;
            return false;
        })();

        _this.MT3 = (function () {
            if (!Device.mobile) return false;
            if (Mobile.iOS.includes(['6s', 'ipad pro', '7x'])) return true;

            if (_this.detect('nvidia tegra') && Device.detect('pixel c')) {
                return true;
            }

            if (_this.detect('adreno')) return _this.matchGPU('adreno (tm) ', 530);
            if (_this.detect('mali-g')) return _this.matchGPU('mali-g', 71);

            if (navigator.platform.toLowerCase().includes('mac')) return true;

            return false;
        })();

        _this.MT4 = (function () {
            if (!Device.mobile) return false;
            if (Device.system.os == 'ios' && _this.detect(['a10', 'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a17', 'a18'])) return true;

            if (_this.detect('adreno')) return _this.matchGPU('adreno (tm) ', 630);

            if (navigator.platform.toLowerCase().includes('mac')) return true;

            return false;
        })();

        _this.lt = function(num) {
            if (_this.TIER > -1) {
                return _this.TIER <= num;
            }
            return false;
        }

        _this.gt = function(num) {
            if (_this.TIER > -1) {
                return _this.TIER >= num;
            }
            return false;
        }

        _this.eq = function(num) {
            if (_this.TIER > -1) {
                return _this.TIER == num;
            }

            return false;
        }

        _this.mobileEq = function(num) {
            if (_this.M_TIER > -1) {
                return _this.M_TIER == num;
            }

            return false;
        }

        _this.mobileLT = function(num) {
            if (_this.M_TIER > -1) {
                return _this.M_TIER <= num;
            }
            return false;
        }

        _this.mobileGT = function(num) {
            if (_this.M_TIER > -1) {
                return _this.M_TIER >= num;
            }
            return false;
        }

        for (var key in _this) {
            if (key.charAt(0) == 'T' && _this[key] === true) _this.TIER = Number(key.charAt(1));
            if (key.slice(0, 2) == 'MT' && _this[key] === true) _this.M_TIER = Number(key.charAt(2));
        }

        _this.OVERSIZED = !Device.mobile && _this.TIER < 2 && Math.max(window.innerWidth, window.innerHeight) > 1440;

        _this.initialized = true;

    });

    this.ready = function() {
        let promise = Promise.create();
        _this.wait(() => promise.resolve(), _this, 'initialized');
        return promise;
    }
}, 'static');
