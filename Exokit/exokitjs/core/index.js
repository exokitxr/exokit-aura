print("exokit core bootstrap");

const m11 = require("module1");
print(m11.exokit.module1(3));

const m22 = require("./a");
print(m22.fn(33));
