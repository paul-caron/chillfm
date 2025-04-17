"use strict";

// Globals
let lfo;
let voices = [];
let nVoices = 10;
let nOperatorsPerVoice = 4;
let oscillatorTypes = ['sine','sine','sine','sine'];
let tempSettings = [];
let octave = 0;
let mono = false;
let portamentoTime = 0;


// LFO

class LFO{
    constructor(audioContext){
        this.audioContext = audioContext;
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine';
        this.gain = this.audioContext.createGain();
        this.oscillator.connect(this.gain);
        this.oscillator.frequency.setValueAtTime(0.001, this.audioContext.currentTime);
        this.gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.oscillator.start();
    }
    connect(operatorRank){
        voices.map(v=>v.operators).flat().filter(o=>o.rank==operatorRank).forEach(o=>{lfo.gain.connect(o.oscillator.frequency);});
    }
    disconnect(operatorRank){
        voices.map(v=>v.operators).flat().filter(o=>o.rank==operatorRank).forEach(o=>{lfo.gain.disconnect(o.oscillator.frequency);});
    }
};


// HTML elements setup utils

function createLFOElements(){
    // lfo Slider
    let lfoDiv = document.querySelector("#lfo");
    let lfoSpeedInput = document.createElement('input');
    lfoSpeedInput.type = 'range';
    lfoSpeedInput.min = 0.01;
    lfoSpeedInput.max = 20;
    lfoSpeedInput.step = 0.01;
    lfoSpeedInput.value = 0.01;
    lfoSpeedInput.addEventListener('change',()=>{
        lfoSpeedInput.title = lfoSpeedInput.value;
        lfo.oscillator.frequency.setValueAtTime(lfoSpeedInput.value, lfo.audioContext.currentTime);
    });

    let lfoDepthInput = document.createElement('input');
    lfoDepthInput.type = 'range';
    lfoDepthInput.min = 0;
    lfoDepthInput.max = 1000;
    lfoDepthInput.step = 0.01;
    lfoDepthInput.value = 0;
    lfoDepthInput.addEventListener('change',()=>{
        lfoDepthInput.title = lfoDepthInput.value;
        lfo.gain.gain.setValueAtTime(lfoDepthInput.value, lfo.audioContext.currentTime);
    });

    for(let i=0;i<nOperatorsPerVoice;i++){
        let lfoDestinationInput = document.createElement('input');
        lfoDestinationInput.type = 'checkbox';
        lfoDestinationInput.rank = i;
        lfoDestinationInput.addEventListener('change',()=>{
            if(lfoDestinationInput.checked){
                lfo.connect(lfoDestinationInput.rank);
            }else{
                lfo.disconnect(lfoDestinationInput.rank);
            }
        });
        lfoDiv.appendChild(lfoDestinationInput);
    }

    lfoDiv.appendChild(lfoSpeedInput);
    lfoDiv.appendChild(lfoDepthInput);

}


function createFeedbackElement(){
    // feedback Slider
    let feedbackDiv = document.querySelector("#feedback");
    let feedbackInput = document.createElement('input');
    feedbackInput.type = 'range';
    feedbackInput.min = 0;
    feedbackInput.max = 1000;
    feedbackInput.step = 0.01;
    feedbackInput.value = 0;
    feedbackInput.addEventListener('change',()=>{
        feedbackInput.title = feedbackInput.value;
        voices.forEach(v=>{
            v.feedbackGain.gain.setValueAtTime(feedbackInput.value, v.audioContext.currentTime);
        });
    });
    feedbackDiv.appendChild(feedbackInput);
}

// HTML elements setup utils
function createOperatorsDetuneElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator, id)=>{
        // detune Sliders
        let detuneDiv = document.querySelector("#detune");
        let detuneInput = document.createElement('input');
        detuneInput.type = 'number';
        detuneInput.value = operator.detune;
        detuneInput.addEventListener('change',()=>{
            detuneInput.title = detuneInput.value;
            operators.filter((o)=>o.rank==id).forEach((o)=>{
                o.setDetune(parseFloat(detuneInput.value));
            });
        });
        detuneDiv.appendChild(detuneInput);
    });
}

function createOperatorsWaveformElements(){
    let operatorSets = voices.map(voice=>voice.operators);
    let operators = operatorSets.flat();
    // Control Sliders
    operatorSets[0].forEach((operator, id)=>{
        // release Time Sliders
        let waveformDiv = document.querySelector("#waveform");
        let waveformSelect = document.createElement('select');
        waveformSelect.id = "waveform-" + id;
        ['square','sawtooth','triangle','sine'].forEach((waveform) => {
            let option = document.createElement('option');
            option.innerText = waveform;
            option.value = waveform;
            waveformSelect.appendChild(option);
        });
        waveformSelect.value = operator.oscillator.type;
        waveformSelect.addEventListener('change', ()=>{
            oscillatorTypes[id] = waveformSelect.value;
            //save current settings into tempSettings
            let inputs = Array.from(document.querySelectorAll("#synth input"));
            tempSettings = inputs.map(i=>i.value);

            //redo entire synth after waveform change because oscillator types cannot be changed after creation
            initSynth(operator.master.audioContext, oscilloscope);

            //reload settings from tempSettings
            inputs = Array.from(document.querySelectorAll("#synth input"));
            inputs.forEach((input,i)=>{
                input.value = tempSettings[i];
                input.dispatchEvent(new Event('change'));
            });

        });
        waveformDiv.appendChild(waveformSelect);
    });
}

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
        releaseInput.min = 0.01;
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
        sustainInput.min = 0.01;
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
        decayInput.min = 0.01;
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
        attackInput.min = 0.01;
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
                let gainNode = voice.audioContext.createGain();
                gainNode.gain.setValueAtTime(0.0, voice.audioContext.currentTime);
                o.connect(gainNode);
                gainNode.connect(p.oscillator.frequency);
                sliderGainNodes.push(gainNode);
                voice.modmatrixGainNodes.push(gainNode);
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
        ratioInput.id = "ratio-" + id;
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
    constructor(audioContext, outputNode) {
        this.audioContext = audioContext
        this.gain = this.audioContext.createGain();
        this.gain.connect(outputNode);
    }
    disconnect(){
        this.gain.disconnect();
    }
};

class FMOperator {
    constructor(master, type = 'triangle', baseFrequency = 110, ratio = 1.0, envelopeSettings = { attack: 0.1, decay: 0.4, sustain: 0.7, release: 2.0 }) {
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
        this.detune = 0;
        this.oscillator.detune.setValueAtTime(this.detune, this.audioContext.currentTime);
        this.oscillator.type = type; // Default waveform is sine
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

    // set detune for this operator
    setDetune(d){
        this.detune = d;
        this.oscillator.detune.setValueAtTime(this.detune, this.audioContext.currentTime);
    }

    // Set frequency for this operator
    setBaseFrequency(frequency) {
        this.baseFrequency = frequency;
        this.oscillator.frequency.linearRampToValueAtTime(this.baseFrequency * this.ratio, this.audioContext.currentTime + parseFloat(portamentoTime));
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
        const baseFrequency = 130.81 * (2 ** octave) * (2 ** (noteNumber/12));
        this.setBaseFrequency(baseFrequency);
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
    disconnect(){
        this.envelope.disconnect();
        this.level.disconnect();
        this.oscillator.disconnect();
        this.oscillator.stop();
    }

};

class Voice{
    constructor(audioContext, outputNode){
        this.audioContext = audioContext;
        this.master = new Master(this.audioContext, outputNode);
        this.modmatrixGainNodes = [];
        this.operators = [];
        for (let i = 0; i < nOperatorsPerVoice; i++){
            let type = oscillatorTypes[i];
            let operator = new FMOperator(this.master, type);
            operator.rank = i;
            this.operators.push(operator);
        }

        // feedback loop for the last operator
        this.feedbackDelay = this.audioContext.createDelay();
        this.feedbackDelay.delayTime.setValueAtTime(0.001, this.audioContext.currentTime);
        this.feedbackGain = this.audioContext.createGain();
        this.feedbackGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        this.operators[3].envelope.connect(this.feedbackDelay);
        this.feedbackDelay.connect(this.feedbackGain);
        this.feedbackGain.connect(this.operators[3].oscillator.frequency);

        // boolean flag to check if voice is in use or not
        this.playing = false;
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
        this.playing = true; //voice is unavailable for reuse until flag is false
    }
    // note release
    rel(){
        this.operators.forEach(o=>{o.releaseEnvelope()});
        // get longuest releaseTime from all operators
        let rt = 0;
        this.operators.forEach(o=>{rt = Math.max(rt,o.releaseTime)});
        // reset 'playing' flag after release time
        setTimeout(()=>{this.playing = false;},rt*1000);
    }

    disconnect(){
        this.master.disconnect();
        this.operators.forEach(o=>{
            o.disconnect();
        })
        this.modmatrixGainNodes.forEach(g=>{
            g.disconnect();
        })
    }
};

function initVoices(audioContext, outputNode){
    if(voices.length){
        voices.forEach(v=>{v.disconnect()});
    }
    voices = [];
    for(let i = 0; i < nVoices; i++){
      let voice = new Voice(audioContext, outputNode);
      voices.push(voice);
    }
}

function initSynth(audioContext, outputNode){
  let inputs = Array.from(document.querySelectorAll('#synth input, #synth select, #synth br'));
  inputs.forEach(i=>{i.outerHTML = ''});

  // Init Voices
  initVoices(audioContext, oscilloscope);

  // LFO
  lfo = new LFO(audioContext);

  // HTML Elements Init
  createMasterElements();
  createOperatorsWaveformElements();
  createOperatorsRatioElements();
  createOperatorsLevelElements();
  createOperatorsModMatrixElements();
  createOperatorsAttackElements();
  createOperatorsDecayElements();
  createOperatorsSustainElements();
  createOperatorsReleaseElements();
  createOperatorsDetuneElements();
  createFeedbackElement();
  createLFOElements();
}


// voice allocator for polyphony
function getVoice(){
   if(mono) return voices[0];

   for(let i = 0 ; i < nVoices; i++){
       let v = voices[i];
       if(i.playing === false){
          voices.splice(i,1); // remove voice
          voices.push(v); // put voice at back of the queue
          return v;
       }
   }
   // if all voices are playing, pick first one
   let v = voices.shift();
   voices.push(v); // push at back of the queue
   return v;
}






