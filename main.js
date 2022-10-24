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
  document.querySelector('#gamediv').innerText = "This Browser doesn't support WebMIDI";
}

function initForm() {
  var rootUl = document.getElementById('rootUl');
  for (let i=0; i<chordSymbols.length; i++) {    
    var newLi = document.createElement('li');
    var newInput = document.createElement('input');
    newInput.setAttribute('type', 'checkbox');
    newInput.setAttribute('name', 'roots[]');
    newInput.setAttribute('checked', 'checked');
    newInput.setAttribute('value', chordSymbols[i].note);
    newInput.setAttribute('id', chordSymbols[i].name);
    var newLabel = document.createElement('label');
    newLabel.setAttribute('for', chordSymbols[i].name);
    newLabel.innerHTML = chordSymbols[i].name;
    newLi.appendChild(newInput);
    newLi.appendChild(newLabel);
    rootUl.appendChild(newLi);
  }
  var typeUl = document.getElementById('typeUl');
  for (let i=0; i<chordTypes.length; i++) {
    var newLi = document.createElement('li');
    var newInput = document.createElement('input');
    newInput.setAttribute('type', 'checkbox');
    newInput.setAttribute('name', 'types[]');
    newInput.setAttribute('checked', 'checked');
    newInput.setAttribute('value', chordTypes[i].note);
    newInput.setAttribute('id', 'type'+i);
    var newLabel = document.createElement('label');
    newLabel.setAttribute('for', 'type'+i);
    newLabel.innerHTML = chordTypes[i].name;
    newLi.appendChild(newInput);
    newLi.appendChild(newLabel);
    typeUl.appendChild(newLi);
  }
}

function onMIDIFailure() {
  document.querySelector('#gamediv').innerText = "Couldn't find any MIDI devices";
}

function onMIDISuccess(midiAccess) {
	for (var input of midiAccess.inputs.values()) {
		input.onmidimessage = getMIDIMessage;
	}
  initForm();
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
    document.querySelector('#question').innerText = '';
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

function startGame() {
  document.querySelector('#formdiv').style.display = 'none';
  document.querySelector('#gamediv').style.display = 'block';
  gameStep();
}

function resetGame() {
  document.querySelector('#formdiv').style.display = 'block';
  document.querySelector('#gamediv').style.display = 'none';
  currentStep=0;
}

function gameStep() {
  randSymbol = Math.floor(Math.random() * chordSymbols.length);
  randType = Math.floor(Math.random() * chordTypes.length);
  correctNote = chordSymbols[randSymbol].note;
  correctType = chordTypes[randType];
  document.querySelector('#question').innerText = chordSymbols[randSymbol].name+"-"+chordTypes[randType].name;
  currentStep++;
}
