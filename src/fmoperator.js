"use strict";

// Globals

let voices = [];
let nVoices = 17;
let nOperatorsPerVoice = 4;

// HTML elements setup utils

function createOperatorsReleaseElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator, id)=>{
        // release Time Sliders
        let releaseDiv = document.querySelector("#release");
        let releaseInput = document.createElement('input');
        releaseInput.type = 'range';
        releaseInput.title = '0.0';
        releaseInput.min = 0.05;
        releaseInput.max = 3;
        releaseInput.step = 0.01;
        releaseInput.value = operator.releaseTime;
        releaseInput.addEventListener('change',()=>{
            releaseInput.title = releaseInput.value;
            operators.filter((o)=>o.rank==id).forEach((o)=>{
                o.releaseTime = parseFloat(releaseInput.value);
            });
        });
        releaseDiv.appendChild(releaseInput);
    });
}


function createOperatorsSustainElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator, id)=>{
        // sustain Time Sliders
        let sustainDiv = document.querySelector("#sustain");
        let sustainInput = document.createElement('input');
        sustainInput.type = 'range';
        sustainInput.title = '0.0';
        sustainInput.min = 0.02;
        sustainInput.max = 1.0;
        sustainInput.step = 0.01;
        sustainInput.value = operator.sustainLevel;
        sustainInput.addEventListener('change',()=>{
            sustainInput.title = sustainInput.value;
            operators.filter((o)=>o.rank==id).forEach((o)=>{
                o.sustainLevel = parseFloat(sustainInput.value);
            });
        });
        sustainDiv.appendChild(sustainInput);
    });
}

function createOperatorsDecayElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator, id)=>{
        // decay Time Sliders
        let decayDiv = document.querySelector("#decay");
        let decayInput = document.createElement('input');
        decayInput.type = 'range';
        decayInput.title = '0.0';
        decayInput.min = 0.05;
        decayInput.max = 3;
        decayInput.step = 0.01;
        decayInput.value = operator.decayTime;
        decayInput.addEventListener('change',()=>{
            decayInput.title = decayInput.value;
            operators.filter((o)=>o.rank==id).forEach((o)=>{
                o.decayTime = parseFloat(decayInput.value);
            });
        });
        decayDiv.appendChild(decayInput);
    });
}


function createOperatorsAttackElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator, id)=>{
        // Attack Time Sliders
        let attackDiv = document.querySelector("#attack");
        let attackInput = document.createElement('input');
        attackInput.type = 'range';
        attackInput.title = '0.0';
        attackInput.min = 0.05;
        attackInput.max = 3;
        attackInput.step = 0.01;
        attackInput.value = operator.attackTime;
        attackInput.addEventListener('change',()=>{
            attackInput.title = attackInput.value;
            operators.filter((o)=>o.rank==id).forEach((o)=>{
                o.attackTime = parseFloat(attackInput.value);
            });
        });
        attackDiv.appendChild(attackInput);
    });
}

function createOperatorsModMatrixElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    let modmatrix = document.querySelector("#modmatrix");
    operatorSets[0].forEach((o,i)=>{
        operatorSets[0].forEach((p,j)=>{
            // there seems to be some limitations with feedback,
            // feedback seems to make the audiocontext crash
            // so here i avoided feedback loop for the mod matrix for it to work
            if(o === p) return; //avoid feedback for now
            if(i < j) return; //avoid feedback for now

            // Control slider
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
        levelInput.value = operator.levelValue;
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

function createMasterElements(){
    let masters = voices.map(voice=>voice.master);

    // Control Sliders
    let masterDiv = document.querySelector('#master');
    let masterInput = document.createElement('input');
    masterInput.type = 'range';
    masterInput.title = 'volume: 1.0';
    masterInput.value = 1.0;
    masterInput.step = 0.01;
    masterInput.min = 0;
    masterInput.max = 1.0;
    masterInput.addEventListener('change',()=>{
        masterInput.title = 'volume: ' + masterInput.value;
        masters.forEach(master=>{
            master.gain.gain.setValueAtTime(masterInput.value, master.audioContext.currentTime);
        });
    });
    masterDiv.appendChild(masterInput);
}

// volume master, end node
class Master {
    constructor(audioContext) {
        this.audioContext = audioContext
        this.gain = this.audioContext.createGain();
        this.gain.connect(this.audioContext.destination);
    }
};

class FMOperator {
    constructor(master, baseFrequency = 110, ratio = 1.0, envelopeSettings = { attack: 0.1, decay: 0.4, sustain: 0.7, release: 2.0 }) {
        // the volume master end node
        this.master = master;

        // a reference to the audiocontext
        this.audioContext = this.master.audioContext;

        // Frequency settings
        this.baseFrequency = baseFrequency;

        // fm ratio (1,2,3,4,... or fractions also works like 0.5, 0.25, 0.125,...)
        this.ratio = ratio;

        // Envelope settings
        this.attackTime = envelopeSettings.attack;
        this.decayTime = envelopeSettings.decay;
        this.sustainLevel = envelopeSettings.sustain;
        this.releaseTime = envelopeSettings.release;

        // Create Oscillator Node
        this.oscillator = this.audioContext.createOscillator();
        this.detune = (Math.random() - 0.5) * 10;
        this.oscillator.detune.setValueAtTime(this.detune, this.audioContext.currentTime);
        this.oscillator.type = 'square'; // Default waveform is sine
        this.oscillator.frequency.setValueAtTime(this.baseFrequency*this.ratio, this.audioContext.currentTime);

        // Envelope: Gain control for Attack, Decay, Sustain, Release
        this.envelope = this.audioContext.createGain();
        this.envelope.gain.setValueAtTime(0,this.audioContext.currentTime);
        this.oscillator.connect(this.envelope);

        // Create Level Gain Node for output volume control
        this.levelValue = 0;
        this.level = this.audioContext.createGain();
        this.level.gain.setValueAtTime(this.levelValue, this.audioContext.currentTime);
        this.level.connect(this.master.gain);
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
        this.levelValue = level;
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
        this.master = new Master(this.audioContext);
        this.operators = [];
        for (let i = 0; i < nOperatorsPerVoice; i++){
            let operator = new FMOperator(this.master);
            operator.rank = i;
            this.operators.push(operator);
        }
    }

    // note trigger
    trig(noteNumber){
        if(this.audioContext.state === "suspended"){
            this.audioContext.resume().then(()=>{
                this.operators.forEach(o=>{o.triggerEnvelope(noteNumber)});
            });
        }else{
            this.operators.forEach(o=>{o.triggerEnvelope(noteNumber)});
        }
    }

    // note release
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
createMasterElements();
createOperatorsRatioElements();
createOperatorsLevelElements();
createOperatorsModMatrixElements();
createOperatorsAttackElements();
createOperatorsDecayElements();
createOperatorsSustainElements();
createOperatorsReleaseElements();


// EVENTS

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


// garbage for testing on my phone

let trigIndex =0;
let relIndex = 0;

window.addEventListener('touchstart', (event) => {
    let noteNumber = trigIndex * 12;
    relIndex = trigIndex;
    voices[trigIndex++].trig(noteNumber);
    trigIndex %= nVoices;
});

window.addEventListener('touchend', (event) => {
    voices[relIndex].rel();
});


// patches list
updatePatchesList();

}catch(e){
    alert(e);
    throw (e);
}
