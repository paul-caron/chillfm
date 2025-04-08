class FMOperator {
    constructor(audioContext, carrierFrequency, envelopeSettings = { attack: 0.2, decay: 0.2, sustain: 0.2, release: 1.0 }) {
        this.audioContext = audioContext;

        // Envelope settings
        this.attackTime = envelopeSettings.attack;
        this.decayTime = envelopeSettings.decay;
        this.sustainLevel = envelopeSettings.sustain;
        this.releaseTime = envelopeSettings.release;

        // Create Level Gain Node for volume control
        this.level = this.audioContext.createGain();
        this.level.gain.setValueAtTime(1,this.audioContext.currentTime); // Start with zero gain

        // Create Oscillator Node
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine'; // Default waveform is sine
        this.oscillator.frequency.setValueAtTime(carrierFrequency, this.audioContext.currentTime);

        // Connect oscillator to gain node
        this.oscillator.connect(this.level);

        // Envelope: Gain control for Attack, Decay, Sustain, Release
        this.envelope = this.audioContext.createGain();
        this.level.connect(this.envelope); // Connect to envelope to modulate volume

        // Start the oscillator by default
        this.oscillator.start();
    }

    // Set frequency for this operator
    setFrequency(frequency) {
        this.oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
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
        this.envelope.gain.cancelScheduledValues(this.audioContext.currentTime);
//        this.envelope.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.envelope.gain.linearRampToValueAtTime(1, this.audioContext.currentTime + this.attackTime);
        this.envelope.gain.linearRampToValueAtTime(this.sustainLevel, this.audioContext.currentTime + this.attackTime + this.decayTime);
    }

    // Release the envelope
    releaseEnvelope() {
        this.envelope.gain.cancelScheduledValues(this.audioContext.currentTime);
//        this.envelope.gain.setTargetAtTime(0, this.audioContext.currentTime, this.releaseTime);
        this.envelope.gain.linearRampToValueAtTime(0.000, this.audioContext.currentTime + this.releaseTime);
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
  alert("Web Audio API is not supported in this browser.");
}

// Create an instance of AudioContext
const audioContext = new AudioContext({latencyHint: 'interactive',sampleRate:96000});

let operator1 = new FMOperator(audioContext, 440);
operator1.envelope.connect(audioContext.destination);


trigger.addEventListener("click", (e)=>{
    if(audioContext.state === "suspended"){
        audioContext.resume();
    }
    operator1.triggerEnvelope();
});

release.addEventListener("click", (e)=>{
    operator1.releaseEnvelope();
});


}catch(e){

alert(e);

}
