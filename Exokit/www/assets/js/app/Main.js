Class(function Main() {

    //*** Constructor
    (function() {
        Dev.checkForLeaks(false);
        init();
    })();

    function init() {
        GLUI.init();
        if (window.location.search.includes('p=')) return AssetLoader.loadAssets(Assets.list().filter(['data', 'shaders'])).then(Playground.instance);
        Container.instance();
    }

    //*** Event Handlers

    //*** Public methods
});