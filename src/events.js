let pressedKeys = {};

function keyToNoteNumber(key){
    let noteNumber = 0;
    switch(key){
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
    return noteNumber;
}

function keyOn(key){
    let noteNumber = keyToNoteNumber(key);
    let voice = getVoice();
    pressedKeys[key] = voice;
    voice.trig(noteNumber);
}

function keyOff(key){
    let voice = pressedKeys[key] ;
    pressedKeys[key] = null;
    if(voice) voice.rel();
}

window.addEventListener('keyup', (event) => {
    keyOff(event.key);
    if(recording){
        noteEvents.push(new NoteEvent('off', event.key, voices[0].audioContext.currentTime - recordingStartTime));
    }
});

window.addEventListener('keydown', (event) => {
    if(pressedKeys[event.key]) return;
    keyOn(event.key);
    if(recording){
        if(noteEvents.length === 0){
            recordingStartTime = voices[0].audioContext.currentTime;
        }
        noteEvents.push(new NoteEvent('on', event.key, voices[0].audioContext.currentTime - recordingStartTime));
    }
});

