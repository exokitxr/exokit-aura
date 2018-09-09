const parser = require('html-parser');

let file = new File('www/index.html');
console.log(" "+file.path+" "+file.isDirectory+" "+file.size+" "+file.exists)

let dir = new File('www');
console.log("Files in www folder: ")
dir.listFiles().forEach( file => {
    console.log(" "+file.path+" "+file.isDirectory+" "+file.size+" "+file.exists);
});

let dirDocs = new File('',1);
console.log("Files in root documents: ")
dirDocs.listFiles().forEach( file => {
    console.log(" "+file.path+" "+file.isDirectory+" "+file.size+" "+file.exists);
});


let newFile = new File("ibon",1);   // storage = documents.
console.log("result from create with text: "+newFile.createWithText("abcd"));     // should have also createWithArraybuffer ??
let newFileContents = newFile.loadAsText();
console.log("contents in memory and in file equal="+(newFileContents==="abcd"))
newFile.delete();

let newFile2 = new File("ibon",1);
console.log("previously deleted, must not exists. exists?="+newFile.exists);

console.log("");

let newDir = new File("dir",1);
if (newDir.makeDirectory()) {
    let f1 = new File( "dir/1", 1);
    f1.createWithText("abcd");
}
console.log("Files in "+newDir.path)
newDir.listFiles().forEach( file => {
    console.log(" "+file.path+" "+file.isDirectory+" "+file.size+" "+file.exists);
});

newDir.delete();
console.log(""+newDir.path+" must not exist. Exists?= "+(new File("dir",1).exists) );

//console.log(file.loadAsText());
