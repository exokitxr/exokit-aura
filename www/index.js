let CMD = false;

window.addEventListener('keydown', e => {
    console.log(e.keyCode);
    if (e.keyCode == 93) CMD = true;
    let text;
    if (!CMD) return;
    switch (e.keyCode) {
        case 66: text = `Great! We're so glad you're a Beto supporter. We would love to send you a free Beto sticker so you can show off your support. Can you fill out this form so we can send you a sticker: https://act.betofortexas.com/signup/freesticker`; break;
        case 67: text = `Okay, we'll mark that down now. Have a great day!`; break;
        case 73: text = `Sorry about that! We'll mark that down now. Are you a Texas voter? May I ask who you'll be supporting for Senator in the November election?`; break;
        case 85: text = `I'm personally supporting Beto because he's the only candidate who will put Texans before special interests and be the voice we need in the Senate about issues like no PACs, term limits, and our public schools. Can I help answer any questions or clarify his platform for you?`; break;
    }

    if (text) {
        e.preventDefault();
        let input = document.getElementsByClassName('v2-form__text-input');
        input[0].value = text;
    }
});

window.addEventListener('keyup', e => {
    if (e.keyCode == 93) CMD = false;
});
