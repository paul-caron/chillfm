try{

const AudioContext = window.AudioContext || window.webkitAudioContext;

if (!AudioContext) {
  throw("Web Audio API is not supported in this browser.");
}

// Create an instance of AudioContext
const audioContext = new AudioContext({latencyHint: 'interactive',sampleRate:96000});

// Init Oscilloscope
initOscilloscope(audioContext);
requestAnimationFrame(oscilloscopeLoop);

// Init Synth
initSynth(audioContext, oscilloscope);

// Get patches list from local memory
updatePatchesList();

}catch(e){
    alert(e);
    throw (e);
}
