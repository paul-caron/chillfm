"use strict";

let voices = [];
let nVoices = 2;


// HTML elements setup

function createOperatorsModMatrixElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    let modmatrix = document.querySelector("#modmatrix");
    operatorSets[0].forEach((o,i)=>{
        operatorSets[0].forEach((p,j)=>{
            // there seems to be some limitations with feedback, so here i made some exceptions to the mod matrix for it to work
            if(o === p) return; //avoid feedback for now
            if(i < j) return; //avoid feedback for now

            let slider = document.createElement('input');
            slider.type = 'range';
            slider.min = 0;
            slider.max = 1000;
            slider.value = 0;
            slider.step = 1;
            slider.title = `${i}->${j}`;

            slider.dataset.from = i;
            slider.dataset.to = j;

            modmatrix.appendChild(slider);
        });
        let br = document.createElement('br');
        modmatrix.appendChild(br);
    });

    // Create Gain Nodes for each slider and hook up the operators
    let modmatrixSliders = Array.from(document.querySelectorAll("#modmatrix > input"));
    modmatrixSliders.forEach(slider => {
        let sliderGainNodes = [];
        let i = slider.dataset.from;
        let j = slider.dataset.to;
        voices.forEach(voice=>{
                let o = voice.operators[i];
                let p = voice.operators[j];
                let gainNode = o.audioContext.createGain();
                gainNode.gain.setValueAtTime(1.0, o.audioContext.currentTime);
                o.connect(gainNode);
                gainNode.connect(p.oscillator.frequency);
                sliderGainNodes.push(gainNode);
        });
        slider.addEventListener('change', ()=>{
            sliderGainNodes.forEach(gainNode=>{
                gainNode.gain.setValueAtTime(slider.value, voices[0].audioContext.currentTime);
            });
        });
    });


}


function createOperatorsLevelElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator, id)=>{
        // Output Level Sliders
        let levelDiv = document.querySelector("#level");
        let levelInput = document.createElement('input');
        levelInput.type = 'range';
        levelInput.title = '0.0';
        levelInput.min = 0;
        levelInput.max = 1;
        levelInput.step = 0.01;
        levelInput.value = operator.level.gain.value;
        levelInput.addEventListener('change',()=>{
            levelInput.title = levelInput.value;
            operators.filter((o)=>o.rank==id).forEach((o)=>{
                o.setLevel(levelInput.value);
            });
        });
        levelDiv.appendChild(levelInput);
    });
}


function createOperatorsRatioElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator,id)=>{
        let ratioDiv = document.querySelector("#ratio");
        let ratioInput = document.createElement('input');
        ratioInput.type = 'number';
        ratioInput.value = operator.ratio;
        ratioInput.addEventListener('change',()=>{
            ratioInput.title = ratioInput.value;
            operators.filter((o)=>o.rank==id).forEach((o)=>{
                o.setRatio(ratioInput.value);
            });
        });
        ratioDiv.appendChild(ratioInput);
    });
}

function createVCAElements(){
    let vcas = voices.map(voice=>voice.vca);

    // Control Sliders
    let vcaDiv = document.querySelector('#vca');
    let vcaInput = document.createElement('input');
    vcaInput.type = 'range';
    vcaInput.title = 'volume: 1.0';
    vcaInput.value = 1.0;
    vcaInput.step = 0.01;
    vcaInput.min = 0;
    vcaInput.max = 1.0;
    vcaInput.addEventListener('change',()=>{
        vcaInput.title = 'volume: ' + vcaInput.value;
        vcas.forEach(vca=>{
            vca.gain.gain.setValueAtTime(vcaInput.value, vca.audioContext.currentTime);
        });
    });
    vcaDiv.appendChild(vcaInput);
}

class VCA {
    constructor(audioContext) {
        this.audioContext = audioContext
        this.gain = this.audioContext.createGain();
        this.gain.connect(this.audioContext.destination);
    }
};

class FMOperator {
    constructor(vca, baseFrequency = 110, ratio = 1.0, envelopeSettings = { attack: 0.4, decay: 0.4, sustain: 0.6, release: 1.0 }) {
        this.vca = vca;
        this.audioContext = this.vca.audioContext;

        // Frequency settings
        this.baseFrequency = baseFrequency;
        this.ratio = ratio;

        // Envelope settings
        this.attackTime = envelopeSettings.attack;
        this.decayTime = envelopeSettings.decay;
        this.sustainLevel = envelopeSettings.sustain;
        this.releaseTime = envelopeSettings.release;

        // Create Oscillator Node
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine'; // Default waveform is sine
        this.oscillator.frequency.setValueAtTime(this.baseFrequency*this.ratio, this.audioContext.currentTime);

        // Envelope: Gain control for Attack, Decay, Sustain, Release
        this.envelope = this.audioContext.createGain();
        this.envelope.gain.setValueAtTime(0,this.audioContext.currentTime);
        this.oscillator.connect(this.envelope);

        // Create Level Gain Node for output volume control
        this.level = this.audioContext.createGain();
        this.level.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.level.connect(this.vca.gain);
        this.envelope.connect(this.level);

        // Start the oscillator by default
        this.oscillator.start();

    }

    // Set frequency for this operator
    setBaseFrequency(frequency) {
        this.baseFrequency = frequency;
        this.oscillator.frequency.setValueAtTime(this.baseFrequency * this.ratio, this.audioContext.currentTime);
    }

    // Set frequency for this operator
    setRatio(ratio) {
        this.ratio = ratio;
        this.oscillator.frequency.setValueAtTime(this.baseFrequency * this.ratio, this.audioContext.currentTime);
    }

    // Set frequency for this operator
    setLevel(level) {
        this.level.gain.setValueAtTime(level, this.audioContext.currentTime);
    }

    // Connect to mod matrix gain
    connect(gainNode){
        this.envelope.connect(gainNode);
    }

    // Trigger the envelope (Attack, Decay, Sustain, Release)
    triggerEnvelope(noteNumber) {
        const baseFrequency = 110 * (2 ** (noteNumber/12));
        this.setBaseFrequency(baseFrequency);
        const t = this.audioContext.currentTime;
        this.envelope.gain.cancelScheduledValues(t);
        this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
        this.envelope.gain.linearRampToValueAtTime(1, t+0.01 + this.attackTime);
        this.envelope.gain.linearRampToValueAtTime(this.sustainLevel, t + this.attackTime + this.decayTime);
    }

    // Release the envelope
    releaseEnvelope() {
        const t = this.audioContext.currentTime;
        this.envelope.gain.cancelScheduledValues(t);
        this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
        this.envelope.gain.linearRampToValueAtTime(0.000, t+0.01 + this.releaseTime);
    }

};

class Voice{
    constructor(audioContext){
        this.audioContext = audioContext;
        this.vca = new VCA(this.audioContext);
        this.operators = [];
        for (let i = 0; i < 4; i++){
            let operator = new FMOperator(this.vca);
            operator.rank = i;
            this.operators.push(operator);
        }
    }

    trig(noteNumber){
        if(this.audioContext.state === "suspended"){
            this.audioContext.resume().then(()=>{
                this.operators.forEach(o=>{o.triggerEnvelope(noteNumber)});
            });
        }else{
            this.operators.forEach(o=>{o.triggerEnvelope(noteNumber)});
        }
    }

    rel(){
        this.operators.forEach(o=>{o.releaseEnvelope()});
    }


};

try{

const AudioContext = window.AudioContext || window.webkitAudioContext;

if (!AudioContext) {
  throw("Web Audio API is not supported in this browser.");
}

// Create an instance of AudioContext
const audioContext = new AudioContext({latencyHint: 'interactive',sampleRate:96000});



// Create Voices
for(let i = 0; i < nVoices; i++){
  let voice = new Voice(audioContext);
  voices.push(voice);
}



// HTML Elements Init
createVCAElements();
createOperatorsRatioElements();
createOperatorsLevelElements();
createOperatorsModMatrixElements();



// EVENTS
let pressedKeys = {};
window.addEventListener('keyup', (event) => {
    pressedKeys[event.key] = false;
    voices[0].rel();  //TODO SWITCH BETWEEN VOICES
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
    voices[0].trig(noteNumber); // TODO SWITCH BETWEEN VOICES
});

window.addEventListener('touchstart', (event) => {
    voices[1].trig(0);
});

window.addEventListener('touchend', (event) => {
    voices[1].rel();
});

}catch(e){
    alert(e);
    throw (e);
}
