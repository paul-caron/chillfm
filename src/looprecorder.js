let noteEvents = [];

const NoteEvent = {
    NoteOn: 0,
    NoteOff: 1,
};

class noteEvent{
    constructor(noteEvent, noteNumber, timestamp){
        this.noteEvent = noteEvent;    //NoteOn or NoteOff
        this.noteNumber = noteNumber;
        this.timestamp = timestamp;
    }
}

function record(){
    noteEvents = [];
}

function play(){

}

function stop(){

}
