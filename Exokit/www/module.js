print("require module2.js");
var m2 = require("./module2");

print("module.js contents");

print("------- module2 enumeration");
for( var i in m2 ) {
    print(i);
}
print("-------");

// redeclare exports. must work.
exports= {
    fn :function() {
        m2.fn();
        print("fn from module");
    }
};
