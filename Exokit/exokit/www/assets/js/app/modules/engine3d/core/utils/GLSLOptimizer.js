Module(function GLSLOptimizer() {

    function unrollLoops( string ) {
        let pattern = /#pragma unroll_loop[\s]+?for \(int i \= (\d+)\; i < (\d+)\; i\+\+\) \{([\s\S]+?)(?=\})\}/g;
        function replace( match, start, end, snippet ) {
            let unroll = '';
            for ( let i = parseInt( start ); i < parseInt( end ); i ++ ) {
                unroll += snippet.replace( /\[i\]/g, '['+ i +']' );
            }

            return unroll;
        }

        return string.replace(pattern, replace);
    }

    this.exports = function(code) {
        return unrollLoops(code);
    }
});