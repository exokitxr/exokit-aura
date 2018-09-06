
exports.cycle_fn = function() {
    print("exported from cycle1");
}

var c2 = require("./cycle2");
c2.cycle_fn();


