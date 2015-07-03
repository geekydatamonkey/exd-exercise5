// sketch.js
/*jshint newcap: false */

'use strict';
const $ = require('jquery');
const _ = require('lodash');
let p5 = require('p5');
p5.sound = require('p5/lib/addons/p5.sound.js');

let frameRate = 8;

let midiNotes = {
  'D': 62,
  'E': 64,
  'F#': 66,
  'G': 67,
  'A': 69,
  'B': 71,
  'C#': 73,
  'D2': 62 + 12,
  'E2': 64 + 12,
  'F#2': 66 + 12,
  'G2': 67 + 12,
  'A2': 69 + 12,
  'B2': 71 + 12,
  'C#2': 73 + 12,
  'D3': 74 + 12,
  'E3': 64 + 24,
  'F#3': 66 + 24,
  'G3': 67 + 24,
  'A3': 69 + 24,
  'B3': 71 + 24,
  'C#3': 73 + 24,
  'D4': 74 + 24,
  'E4': 64 + 36
};

let cannon = [
  {
    id: 'bass',
    color: [255,0,0,100],
    waveType: 'sine',
    notes: ['D2', 'A', 'B', 'F#', 'G', 'D', 'G', 'A'],
    amp: 0.25,
    beatsPerNote: 8,
    transpose: -24,
    beginAtBeat: 0,
    osc: null // two octaves lower
  },
  {
    id: 'tenor1',
    color: [0,255,0,100],
    waveType: 'sine',
    notes: ['F#2','E2','D2','C#','B', 'A', 'B', 'C#'],
    amp: 0.25,
    beatsPerNote: 8,
    transpose: -12,
    beginAtBeat: 8 * 8, // 8 measures in
    osc: null // two octaves lower
  },
  {
    id: 'tenor2',
    color: [0,255,255,100],
    waveType: 'sine',
    //notes: ['F#2','E2','D2','C#','B', 'A', 'B', 'C#'],
    notes: ['D2','C#','B','A','G', 'F#', 'G', 'A'],
    amp: 0.25,
    beatsPerNote: 8,
    transpose: -12,
    beginAtBeat: 16 * 8, // 8 measures in
    osc: null // two octaves lower
  },
  {
    id: 'soprano1',
    color: [255,0,255,100],
    waveType: 'sine',
    notes: ['A2','A2','F#2','G2',   'A2','A2','F#2','G2', //1
            'A2','A','B','C#',      'D2','E2','F#2','G2', //2
            'F#2','F#2','D2','E2',  'F#2','F#2','D2','E2', //3
            'A','B','A','G',        'F#','E','D','F#', //4
            'G','G','B','A',        'G','G','A', 'G', //5
            'F#','G','F#','E',       'D','E', 'F#', 'G', //6
            'A','B','C#','D2',      'E2', 'F#2', 'G2','A2', //7
            'B2','C#2','D3','E3',   'G3','A3', 'B3','C#3', //8
            'D4','E4','D4','E4',    'D4', 'E4', 'D4', 'D4', // 9
            null, null, null, null,  null, null, null, null, //10
            null, null, null, null,  null, null, null, null, //11
            null, null, null, null,  null, null, null, null, //12
            null, null, null, null,  null, null, null, null, //13
            null, null, null, null,  null, null, null, null, //14
            null, null, null, null,  null, null, null, null, //15
            null, null, null, null,  null, null, null, null //16
            ],     
    amp: 0.25,
    beatsPerNote: 1,
    transpose: 0,
    beginAtBeat: 40 * 8, // 8 measures in
    osc: null // two octaves lower
  },
  {
    id: 'alto',
    color: [255,255,0,100],
    waveType: 'sine',
    notes: ['D', 'F#', 'E', 'E',
            'D', 'F#', 'A', 'A',
            'B', 'G','A','F#',
            'B','G','C#','E2'],
    amp: 0.25,
    beatsPerNote: 4,
    transpose: 0,
    beginAtBeat: 24 * 8, // 8 measures in
    osc: null // two octaves lower
  },
];

function getMidiNote(noteName, transposeBy) {
  return midiNotes[noteName] + transposeBy;
}

let beats = 0;

function mySketch(s) {

  s.setup = function (){

    // create canvas and put in canvasWrapper
    let $canvasWrapper = $('.canvas-wrapper');

    s.createCanvas(
      $canvasWrapper.innerWidth(),
      $canvasWrapper.innerHeight()
    ).parent($canvasWrapper[0]);

    s.frameRate(frameRate);
    s.noFill();

    // set osc for each part in cannon
    _.each(cannon, function(part) {
      part.osc = new p5.Oscillator();
      part.fft = new p5.FFT();
      part.osc.setType(part.waveType);
      part.osc.amp(part.amp);
      //part.osc.start();
    });

  };

  s.draw = function() {
    s.background(255);

    _.each(cannon, function(part) {

      // should we start yet?
      if (beats < part.beginAtBeat) {
        return;
      }
      if (beats === part.beginAtBeat) {
        part.osc.start();
      }

      let relativeBeats = beats - part.beginAtBeat; // number of beats since we began
      let noteNum = Math.floor(relativeBeats/part.beatsPerNote) % part.notes.length; // which note are we on?
      if (part.notes[noteNum]) {
        part.osc.amp(part.amp); 
        let midiNote = getMidiNote(part.notes[noteNum], part.transpose);
        console.log(midiNote);
        let freq = s.midiToFreq(midiNote);
        part.osc.freq(freq);
      } else {
        part.osc.amp(0);
      }

      // show waveform
      s.push();
      s.stroke(part.color);
      let waveform = part.fft.waveform();  // analyze the waveform
      s.beginShape();
      s.strokeWeight(10);
      for (let i = 0; i < waveform.length; i++){
        let x = s.map(i, 0, waveform.length, 0, s.width);
        let y = s.map(waveform[i], 0, 255, s.height, 0);
        s.vertex(x, y);
      }
      s.endShape();
      s.pop();

    });

    beats += 1;

 


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