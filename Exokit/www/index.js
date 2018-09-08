print("------- global enumeration ------");
for( var i in this ) {
    print(i);
}
print("-------");
print("\n\n\n\n\n");

for( var i in File ) {
    print(i)
}
print("-------");

if (typeof File!==void 0) {
    print("creating file abcd");
    const f = new File("www");
    print("name: "+f.filename+" exists:"+f.exists+" isDir:"+f.isDirectory);
    const f2 = new File("www/index.js");
    print("name: "+f2.filename+" exists:"+f2.exists+" isDir:"+f2.isDirectory+" size: "+f2.size);
    print(typeof f2.loadAsText)
    print("file contents: "+f2.loadAsText())

    try {
        const ff = new File();
        print("can't see this.")
    } catch(e) {
        print("catch error creating file: "+e)
    }
}

const core = require("module1");
print("from exokit core: "+core.exokit.module1(2));

print("require module.js");
const m= require("./module.js");
const m2= require("mod");


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

garbageCollect();
