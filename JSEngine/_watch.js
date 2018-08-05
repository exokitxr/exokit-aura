const fs = require('fs');

fs.watch(__dirname, () => {
    update();
});

update();

function update() {
    let output = '';
    let files = walk(__dirname);
    files.forEach(file => {
        output += fs.readFileSync(file).toString() + '\n';
    });

    fs.writeFileSync(`${__dirname}/../Exokit/exokit/jsc/engine.js`, output);
}

function walk(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else {
            if (file.indexOf('.DS_') > -1) return;
            if (file.indexOf('_') > -1) return;
            results.push(file);
        }
    })
    return results;
}
