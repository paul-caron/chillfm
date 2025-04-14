"use strict";

function main(){
    try{

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) {
        throw("Web Audio API is not supported in this browser.");
    }

    // Create an instance of AudioContext
    const actx = new AudioContext({latencyHint: 'interactive',sampleRate:96000});

    // Init Oscilloscope
    initOscilloscope(actx);
    requestAnimationFrame(oscilloscopeLoop);

    // Init Synth
    initSynth(actx, actx.destination);

    // Get patches list from local memory
    updatePatchesList();

    }catch(e){
        alert(e);
        throw (e);
    }
}
main();

