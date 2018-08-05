Class(function UILRemote() {
    Inherit(this, Component);
    const _this = this;

    const CONFIG = {
        apiKey: "AIzaSyDYKxPUcQAx1dTSQ22PYTqYyHVrnoMESSk",
        authDomain: "active-theory.firebaseapp.com",
        databaseURL: "https://active-theory.firebaseio.com",
        projectId: "active-theory",
        storageBucket: "active-theory.appspot.com",
        messagingSenderId: "329576542899"
    };
    const fb = firebase.initializeApp(window._FIREBASE_UIL_ || CONFIG, 'uil');
    const db = fb.database();

    async function populate() {
        let data = await get('assets/data/uil.json');
        await db.ref('uil').set(FirebaseDB.encode(data));
        console.log('UIL database was empty, populating with data from uil.json file');
        return data;
    }

    this.load = async function() {
        let snapshot = await db.ref('uil').once('value');
        let data = snapshot.val();
        if (!data) {
            data = await populate();
            return data;
        } else {
            return FirebaseDB.decode(data);
        }
    };

    this.save = function(sessionData, data) {
        db.ref('uil').update(FirebaseDB.encode(sessionData));
        Dev.writeFile('assets/data/uil.json', data);
    };
});