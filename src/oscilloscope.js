"use strict";

let canvas;
let canvasContext;
let dataArray = new Uint8Array(2048);
let oscilloscope;

function initOscilloscope(audioContext){
    // Create the output oscilloscope
    oscilloscope = audioContext.createAnalyser();
    oscilloscope.fftSize = 2048;
    oscilloscope.connect(audioContext.destination);

    canvas = document.querySelector("canvas");
    canvas.width = window.innerWidth / 2;
    canvas.height = canvas.width / 8;
    canvasContext = canvas.getContext("2d");
    canvasContext.fillStyle = "#afa";
    canvasContext.fillRect(0,0,canvas.width,canvas.height);
}

function oscilloscopeLoop(){
    oscilloscope.getByteTimeDomainData(dataArray);
    canvasContext.fillStyle = "#afa";
    canvasContext.fillRect(0,0,canvas.width,canvas.height);
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = '#464';
    canvasContext.beginPath();

    const dx = canvas.width / 2048;
    let x = 0;

    for(let i = 0; i < 2048; i++){
        let data = dataArray[i];
        const y = data / 255 * canvas.height;

        if(i == 0){
            canvasContext.moveTo(x,y);
        }else{
            canvasContext.lineTo(x,y);
        }

        x += dx;
    }

    canvasContext.stroke();
    requestAnimationFrame(oscilloscopeLoop);
}

