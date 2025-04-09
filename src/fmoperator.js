"use strict";

let vca; //master volume 


class VCA {
    constructor(audioContext) {
        this.audioContext = audioContext
        this.gain = this.audioContext.createGain();
        this.gain.connect(this.audioContext.destination);

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
            this.gain.gain.setValueAtTime(vcaInput.value, this.audioContext.currentTime);
        });
        vcaDiv.appendChild(vcaInput);
    }
};

class FMOperator {
    constructor(audioContext, baseFrequency = 440, ratio = 1.0, envelopeSettings = { attack: 0.3, decay: 0.3, sustain: 0.5, release: 1.0 }) {
        this.audioContext = audioContext;

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
        this.level.connect(vca.gain);
        this.envelope.connect(this.level);

        // Start the oscillator by default
        this.oscillator.start();



        // Control Sliders
        let ratioDiv = document.querySelector("#ratio");
        let ratioInput = document.createElement('input');
        ratioInput.type = 'number';
        ratioInput.value = ratio;
        ratioInput.addEventListener('change',()=>{this.setRatio(ratioInput.value);});
        ratioDiv.appendChild(ratioInput);

        // Output Level Sliders
        let levelDiv = document.querySelector("#level");
        let levelInput = document.createElement('input');
        levelInput.type = 'range';
        levelInput.title = '0.0';
        levelInput.min = 0;
        levelInput.max = 1;
        levelInput.step = 0.01;
        levelInput.value = this.level.gain.value;
        levelInput.addEventListener('change',()=>{
            levelInput.title = levelInput.value;
            this.setLevel(levelInput.value);
        });
        levelDiv.appendChild(levelInput);


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

    // Modulate another operator
    connectToOperator(operator) {
        this.envelope.connect(operator.oscillator.frequency);
    }

    // Unmodulate other operator
    disconnectFromOperator(operator) {
        this.envelope.disconnect(operator.oscillator.frequency);
    }

    // Trigger the envelope (Attack, Decay, Sustain, Release)
    triggerEnvelope() {
        const t = this.audioContext.currentTime;
        this.envelope.gain.cancelScheduledValues(t);
        this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
        this.envelope.gain.linearRampToValueAtTime(1, t + this.attackTime);
        this.envelope.gain.linearRampToValueAtTime(this.sustainLevel, t + this.attackTime + this.decayTime);
    }

    // Release the envelope
    releaseEnvelope() {
        const t = this.audioContext.currentTime;
        this.envelope.gain.cancelScheduledValues(t);
        this.envelope.gain.setValueAtTime(this.envelope.gain.value, t);
        this.envelope.gain.linearRampToValueAtTime(0.000, t + this.releaseTime);
    }

    // Disconnect the operator
    disconnect() {
        this.oscillator.stop();
        this.level.disconnect();
        this.envelope.disconnect();
    }
};

try{

let trigger = document.querySelector("#trigger");
let release = document.querySelector("#release");

const AudioContext = window.AudioContext || window.webkitAudioContext;

if (!AudioContext) {
  throw("Web Audio API is not supported in this browser.");
}

// Create an instance of AudioContext
const audioContext = new AudioContext({latencyHint: 'interactive',sampleRate:96000});
vca = new VCA(audioContext);

let operators = [];

for (let i = 0; i<4; i++){
    operators.push(new FMOperator(audioContext));
}


// create Mod Matrix //todo
operators.forEach(i=>{
    operators.forEach(j=>{
        let modmatrix = document.querySelector("#modmatrix");
        let slider = document.createElement('input');
        slider.type = 'range';
        modmatrix.appendChild(slider);
    });
});

trigger.addEventListener("click", (e)=>{
    if(audioContext.state === "suspended"){
        audioContext.resume().then(()=>{
            operators.forEach(o=>{o.triggerEnvelope()});
        });
    }else{
        operators.forEach(o=>{o.triggerEnvelope()});
    }
});

release.addEventListener("click", (e)=>{
    operators.forEach(o=>{o.releaseEnvelope()});
});

}catch(e){

alert(e);

}
