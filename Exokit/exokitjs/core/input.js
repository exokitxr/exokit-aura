var _touches = [];
var _touching = 0;

let preventDefault = window.ontouchstart = _ => {};

function convert(string) {
    let split = string.split('|');
    let touchArray = JSON.parse('[' + split[0].slice(0, -1) + ']');
    let prevTouchArray = JSON.parse('[' + split[1].slice(0, -1) + ']');
    let forceArray = JSON.parse('[' + split[2].slice(0, -1) + ']');

    let touches = [];
    let prevTouches = [];
    let forceIndex = 0;
    for (let i = 0; i < touchArray.length; i += 2) {
        let touch = {};
        touch.x = touchArray[i + 0];
        touch.y = touchArray[i + 1];
        touch.force = Math.min(forceArray[forceIndex++], 1);
        touches.push(touch);
    }

    for (let i = 0; i < prevTouchArray.length; i += 2) {
        let touch = {};
        touch.x = prevTouchArray[i + 0];
        touch.y = prevTouchArray[i + 1];
        prevTouches.push(touch);
    }

    return {touches, prevTouches};
}

EXOKIT.touchStart = string => {
    let {touches, prevTouches} = convert(string);
    touches.forEach(t => {
        t.id = Date.now();
        t.pageX = t.x;
        t.pageY = t.y;
        _touches.push(t);
    });

    ++_touching;

    let e = {isTrusted: true, touches: _touches, changedTouches: _touches, currentTarget: window, preventDefault, target: window};
    window.fireEvent('touchstart', e);
};

EXOKIT.touchEnd = string => {
    if (string == "resignActive") {
        _touching = 0;
        _touches.length = 0;
        let e = {isTrusted: true, touches: [], changedTouches: [{pageX: 0, pageY: 0}], currentTarget: window, preventDefault, target: window};
        window.fireEvent('touchend');
        return;
    }

    let changed = [];
    let {touches, prevTouches} = convert(string);
    touches.forEach((t, j) => {
        for (let i = 0; i < _touches.length; i++) {
            let touch = _touches[i];
            if (prevTouches[j].x == touch.x && prevTouches[j].y == touch.y) {
                changed.push(touch);
                _touches.splice(_touches.indexOf(touch), 1);
            }
        }
    });

    --_touching;
    if (!_touching) _touches.length = 0;

    let e = {isTrusted: true, touches: _touches, changedTouches: prevTouches, currentTarget: window, preventDefault, target: window};
    window.fireEvent('touchend', e);
};

EXOKIT.touchMove = string => {
    let {touches, prevTouches} = convert(string);
    touches.forEach((t, j) => {
        for (let i = 0; i < _touches.length; i++) {
            let touch = _touches[i];
            if (prevTouches[j].x == touch.x && prevTouches[j].y == touch.y) {
                touch.pageX = touch.x = t.x;
                touch.pageY = touch.y = t.y;
                touch.force = t.force;
            }
        }
    });

    let e = {isTrusted: true, touches: _touches, changedTouches: _touches, currentTarget: window, preventDefault, target: window};
    window.fireEvent('touchmove', e);
};
