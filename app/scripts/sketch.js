// sketch.js
/*jshint newcap: false */

'use strict';
const $ = require('jquery');
const _ = require('lodash');
let p5 = require('p5');
p5.sound = require('p5/lib/addons/p5.sound.js');

let midiNotes = {
  'D': 62,
  'E': 64,
  'F#': 66,
  'G': 67,
  'A': 69,
  'B': 71,
  'C#': 73,
  'D2': 74
};

let cannon = [
  {
    id: 'bass',
    notes: ['D2', 'A', 'B', 'F#', 'G', 'D', 'G', 'A'],
    notesPerMeasure: 1,
    transpose: -24,
    osc: null // two octaves lower  
  }
];

function getMidiNote(noteName) {
  return midiNotes[noteName];
}

let metronome = 0;

function mySketch(s) {

  s.setup = function (){

    // create canvas and put in canvasWrapper
    let $canvasWrapper = $('.canvas-wrapper');

    s.createCanvas(
      $canvasWrapper.innerWidth(),
      $canvasWrapper.innerHeight()
    ).parent($canvasWrapper[0]);

    s.frameRate(1);

    // set osc for each part in cannon
    _.each(cannon, function(part) {

      part.osc = new p5.Oscillator();
      part.osc.setType('sine');
      part.osc.amp(0.5);
      part.osc.start();
    });

  };

  s.draw = function() {

    _.each(cannon, function(part) {
      let beat = metronome % part.notes.length; 
      let midiNote = getMidiNote(part.notes[beat]);
      let freq = s.midiToFreq(midiNote);
      part.osc.freq(freq);
    });

    metronome += 1;

    // s.background(255);
    // let waveform = fft.waveform();  // analyze the waveform
    // s.beginShape();
    // s.strokeWeight(5);
    // for (let i = 0; i < waveform.length; i++){
    //   let x = s.map(i, 0, waveform.length, 0, s.width);
    //   let y = s.map(waveform[i], 0, 255, s.height, 0);
    //   // console.log(waveform[i]);
    //   // console.log(x,y);
    //   s.vertex(x, y);
    // }
    // s.endShape();


  };

  s.mouseClicked = function() {
    // if (s.mouseX > 0 && s.mouseX < s.width && s.mouseY < s.height && s.mouseY > 0) {
    //   if (!playing) {
    //     // ramp amplitude to 0.5 over 0.1 seconds
    //     osc.amp(0.5, 0.05);
    //     playing = true;
    //     backgroundColor = s.color(0,255,255);
    //   } else {
    //     // ramp amplitude to 0 over 0.5 seconds
    //     osc.amp(0, 0.5);
    //     playing = false;
    //     backgroundColor = s.color(255,0,255);
    //   }
    // }
  };


  s.windowResized = function() {
    let $canvasWrapper = $('.canvas-wrapper');

    let w = $canvasWrapper.innerWidth();
    let h = $canvasWrapper.height();

    // put in canvasWrapper
    s.resizeCanvas(w,h-3);
  };

}

function init() {
  return new p5(mySketch);
}

module.exports = {
  init
};