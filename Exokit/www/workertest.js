self.addEventListener('message', msg => {
    console.log(msg);
    let array = new Float32Array(100);
    self.postMessage({from: 'thread', array}, [array.buffer]);
});

setTimeout(_ => {
    console.log('timer works!');
}, 1000);
