var currentChord = [];
var currentStep = 0;
var correctNote = 0;
var correctType = '';
var chordSymbols = [
  {
    "name": 'C',
    "note": 0
  },
  {
    "name": 'Cis',
    "note": 1
  },
  {
    "name": 'Des',
    "note": 1
  },
  {
    "name": 'D',
    "note": 2
  },
  {
    "name": 'Es',
    "note": 3
  },
  {
    "name": 'E',
    "note": 4
  },
  {
    "name": 'F',
    "note": 5
  },
  {
    "name": 'Fis',
    "note": 6
  },
  {
    "name": 'Ges',
    "note": 6
  },
  {
    "name": 'G',
    "note": 7
  },
  {
    "name": 'As',
    "note": 8
  },
  {
    "name": 'A',
    "note": 9
  },
  {
    "name": 'B',
    "note": 10
  },
  {
    "name": 'H',
    "note": 11
  },
  {
    "name": 'Ces',
    "note": 11
  }
];

var chordTypes = [
  {
    "name": 'dur postać zasadnicza',
    "intervals": [4, 3],
    "tonicIndex": 0
  },
  {
    "name": 'moll postać zasadnicza',
    "intervals": [3, 4],
    "tonicIndex": 0
  },
  {
    "name": 'dur I przewrót',
    "intervals": [3, 5],
    "tonicIndex": 2
  },
  {
    "name": 'moll I przewrót',
    "intervals": [4, 5],
    "tonicIndex": 2
  },
  {
    "name": 'dur II przewrót',
    "intervals": [5, 4],
    "tonicIndex": 1
  },
  {
    "name": 'moll II przewrót',
    "intervals": [5, 3],
    "tonicIndex": 1
  },
];

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  document.querySelector('#info').innerText = "This Browser doesn't support WebMIDI";
}

function onMIDIFailure() {
  document.querySelector('#info').innerText = "Couldn't find any MIDI devices";
}

function onMIDISuccess(midiAccess) {
	for (var input of midiAccess.inputs.values()) {
		input.onmidimessage = getMIDIMessage;
	}
  document.querySelector('#info').innerText = "Press any key to start";
}

function getMIDIMessage(message) {
 	var command = message.data[0];
	var note = message.data[1];
	var velocity = (message.data.length > 2) ? message.data[2] : 0; // a velocity value might not be included with a noteOff command

  switch (command) {
    case 144:
      noteOnListener(note);
      break;
    case 128:
      noteOffListener(note);
      break;
  }
}

function noteOnListener(note) {
  if (currentStep == 0) {
    document.querySelector('#info').innerText = '';
    gameStep();
  }
  currentChord.push(note)
  currentChord.sort();
  if (currentChord.length == 3) {
    int1 = currentChord[1]-currentChord[0];
    int2 = currentChord[2]-currentChord[1];
    tonicNote = currentChord[correctType.tonicIndex];
    // console.log(rootNote % 12 == correctNote);
    console.log(JSON.stringify(Array(int1, int2)));
    // console.log(JSON.stringify(correctType.intervals));
    // document.querySelector('#info').innerText = int1+"-"+int2;
    if ( (tonicNote % 12 == correctNote) && JSON.stringify(Array(int1, int2)) == JSON.stringify(correctType.intervals) ) {
      gameStep();
    }     
  }
//  document.querySelector('#info').innerText = currentChord;
}

function noteOffListener(note) {
  currentChord.splice(currentChord.indexOf(note), 1);
  // document.querySelector('#info').innerText = '';
}

function gameStep() {
  randSymbol = Math.floor(Math.random() * chordSymbols.length);
  randType = Math.floor(Math.random() * chordTypes.length);
  correctNote = chordSymbols[randSymbol].note;
  correctType = chordTypes[randType];
  document.querySelector('#question').innerText = chordSymbols[randSymbol].name+"-"+chordTypes[randType].name;
  currentStep++;
}
