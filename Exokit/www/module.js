print("require module2.js");
var m2 = require("./module2");

print("module.js contents");

// redeclare exports. must work.
exports= {
    fn :function() {
        m2.fn();
        print("fn from module");
    }
};

print(__dirname)
print(__filename)
