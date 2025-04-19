let recording = false;
let playing = false;
let recordingStartTime = 0;
let recordingStopTime = 0;
let noteEvents = [];

class NoteEvent{
    constructor(noteEvent, key, timestamp){
        this.noteEvent = noteEvent;    //'on' or 'off'
        this.key = key;
        this.timestamp = timestamp;
    }
}

function record(){
    if(!recording){
        noteEvents = [];
        recordingStartTime = voices[0].audioContext.currentTime;
        recording = true;
    }else if(recording){
        recording = false;
        recordingStopTime = voices[0].audioContext.currentTime;
    }
}

function play(){
    if(recording) return;
    if(playing) return;
    playing = true;
    noteEvents.forEach(e=>{
        let {noteEvent, key, timestamp} = e;
        if(noteEvent == 'on'){
            setTimeout(()=>{
                if(!playing) return;
                keyOn(key);
            }, timestamp * 1000);
        }else if(noteEvent == 'off'){
            setTimeout(()=>{
                keyOff(key);
            }, timestamp * 1000);
        }
    });
    setTimeout(()=>{
        if(!playing) return;
        playing = false;
        play();
    }, (recordingStopTime - recordingStartTime) * 1000);
}

function stop(){
    playing = false;
}
