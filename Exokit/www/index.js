print("require module.js");
var m= require("./module.js");
var m2= require("mod");

print("------- module enumeration");
for( var i in m ) {
    print(i);
}
print("-------");

print(NodeOSBacking.getProcessorCount());

m.fn();
m2.fnabcd();

var m3= require("mod");
// must show the same message as before.
// modules are cached.
m2.fnabcd();

var sum = require("./a");
var mul = require("./a/b");

print( sum.b(9) );
print( mul.b(9) );
