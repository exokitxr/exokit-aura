Class(function Firebase() {
    Inherit(this, Model);
    const _this = this;

    //*** Constructor
    (function () {
    })();

    function init() {
        firebase.initializeApp(Config.FIREBASE || {
            apiKey: "AIzaSyDYKxPUcQAx1dTSQ22PYTqYyHVrnoMESSk",
            authDomain: "active-theory.firebaseapp.com",
            databaseURL: "https://active-theory.firebaseio.com",
            storageBucket: "active-theory.appspot.com",
            messagingSenderId: "329576542899"
        });
        _this.dataReady = true;
    }

    //*** Public methods
    this.init = function() {
        AssetLoader.waitForLib('firebase', init);
    }

}, 'Static');