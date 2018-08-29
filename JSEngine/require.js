(function() {
    let cache = {};
    // let

    global.require = function(key) {
        if (cache[key]) return cache[key];
        let code = RequireBacking.find(key);
    }

})();
