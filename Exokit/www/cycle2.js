
var cycle1 = require("./cycle1");
cycle1.cycle_fn();

exports = {
    cycle_fn : function() {
        print("exported from cycle2")
    }
}
