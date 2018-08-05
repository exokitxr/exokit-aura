(function() {
    try {
        eval('async () => {};');
        if (window.location.hash.toLowerCase().indexOf('_es5') > -1) return loadES5();
        loadES6();
    } catch(e) {
        loadES5();
    }

    function loadES6() {
        RUNTIME_CSS.forEach(createLink);
        RUNTIME_SCRIPTS.forEach(createScript);
    }

    function loadES5() {
        window._ES5_ = true;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://' + window.location.hostname + '/runtime/?' + window.location.href + '', true);
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                RUNTIME_CSS.forEach(createLink);
                createScript('assets/runtime/es5-polyfill.js');
                RUNTIME_SCRIPTS.forEach(createScript);

                var ready = setInterval(function() {
                    if (window.Hydra && window.Main) {
                        clearTimeout(ready);
                        setTimeout(function() {
                            Dev.checkForLeaks(false);
                            Hydra.__triggerReady();
                        }, 250);
                    }
                }, 100);
            }
        }
    }

    function createLink(href) {
        var l = document.createElement('link');
        l.href = href;
        l.type = 'text/css';
        l.rel = 'stylesheet';
        document.head.appendChild(l);
    }

    function createScript(src) {
        if (window._ES5_) src = src.replace('/js/', '/runtime/es5/');
        var s = document.createElement('script');
        s.src = src;
        s.async = false;
        document.head.appendChild(s);
    }
})();
