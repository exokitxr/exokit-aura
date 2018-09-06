print("require module.js");
const m= require("./module.js");
const m2= require("mod");

print("------- module enumeration");
for( let i in m ) {
    print(i);
}
print("-------");

print(NodeOSBacking.getProcessorCount());

m.fn();
m2.fnabcd();

const m3= require("mod");
// must show the same message as before.
// modules are cached.
m2.fnabcd();

const sum = require("./a");
const mul = require("./a/b");

print( sum.b(9) );
print( mul.b(9) );

// test cycle required modules.
var cycle = require("./cycle1");
cycle.cycle_fn();
