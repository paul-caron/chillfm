let recording = false;
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
    noteEvents.forEach(e=>{
        let {noteEvent, key, timestamp} = e;
        if(noteEvent == 'on'){
            setTimeout(()=>{
                keyOn(key);
            }, timestamp * 1000);
        }else if(noteEvent == 'off'){
            setTimeout(()=>{
                keyOff(key);
            }, timestamp * 1000);
        }
    });
    setTimeout(()=>{
        play();
    }, (recordingStopTime - recordingStartTime) * 1000);
}

function stop(){

}
