let pressedKeys = {};
window.addEventListener('keyup', (event) => {
    pressedKeys[event.key] = false;
    keyToVoice(event.key).rel();
});

window.addEventListener('keydown', (event) => {
    if(pressedKeys[event.key]) return;
    pressedKeys[event.key] = true;
    let noteNumber = 0;
    switch(event.key){
        case 'a': noteNumber = 0;break;
        case 'w': noteNumber = 1;break;
        case 's': noteNumber = 2;break;
        case 'e': noteNumber = 3;break;
        case 'd': noteNumber = 4;break;
        case 'f': noteNumber = 5;break;
        case 't': noteNumber = 6;break;
        case 'g': noteNumber = 7;break;
        case 'y': noteNumber = 8;break;
        case 'h': noteNumber = 9;break;
        case 'u': noteNumber = 10;break;
        case 'j': noteNumber = 11;break;
        case 'k': noteNumber = 12;break;
        case 'o': noteNumber = 13;break;
        case 'l': noteNumber = 14;break;
        case 'p': noteNumber = 15;break;
        case ';': noteNumber = 16;break;
    }
    keyToVoice(event.key).trig(noteNumber);
});

function keyToVoice(key){
    let vNumber = 0;
    switch(key){
        case 'a': vNumber = 0;break;
        case 'w': vNumber = 1;break;
        case 's': vNumber = 2;break;
        case 'e': vNumber = 3;break;
        case 'd': vNumber = 4;break;
        case 'f': vNumber = 5;break;
        case 't': vNumber = 6;break;
        case 'g': vNumber = 7;break;
        case 'y': vNumber = 8;break;
        case 'h': vNumber = 9;break;
        case 'u': vNumber = 10;break;
        case 'j': vNumber = 11;break;
        case 'k': vNumber = 12;break;
        case 'o': vNumber = 13;break;
        case 'l': vNumber = 14;break;
        case 'p': vNumber = 15;break;
        case ';': vNumber = 16;break;
    }
    return voices[vNumber];
}
