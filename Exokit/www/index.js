print("require module.js");
var m= require("./module.js");

print("------- module enumeration");
for( var i in m ) {
    print(i);
}
print("-------");

print(NodeOSBacking.getProcessorCount());

m.fn();
