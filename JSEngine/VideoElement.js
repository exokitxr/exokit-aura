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
