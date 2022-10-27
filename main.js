var currentStep = 0;
var score = 0;
var failcount = 0;
var currentNotes = [];
var currentBass = 0;
var correctNotes = [];
var correctBass = 0;
var selectedChords = [];
var selectedTypes = [];
var selectedInversions = [];
var currentq = {};
var nextq = {};
var minCommon = false;
var chordRoots = [
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
    "name": "Fes",
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
    "name": 'Gis',
    "note": 8
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
    "name": 'dur',
    "intervals": [4, 3],
  },
  {
    "name": 'moll',
    "intervals": [3, 4],
  },
  {
    "name": 'dim',
    "intervals": [3, 3],
  },
  {
    "name": 'aug',
    "intervals": [4, 4],
  },
  {
    "name": '7',
    "intervals": [4, 3, 3],
  },
  {
    "name": 'm7',
    "intervals": [3, 4, 3],
  },
  {
    "name": 'M7',
    "intervals": [4, 3, 4],
  },
];

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  document.querySelector('#formdiv').innerText = "Ta przeglądarka nie obsługuje WebMIDI";
}

function onMIDIFailure() {
  document.querySelector('#formdiv').innerText = "Nie znaleziono urządzeń MIDI";
  throw new Error("Nie znaleziono urządzeń MIDI");
}

function onMIDISuccess(midiAccess) {
  if (midiAccess.inputs.size == 0) onMIDIFailure();
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

function inArray(needle, haystack) {
  var length = haystack.length;
  for(var i = 0; i < length; i++) {
      if(haystack[i] == needle) return true;
  }
  return false;
}

function initForm() {
  var rootUl = document.getElementById('rootUl');
  for (let i=0; i<chordRoots.length; i++) {    
    var newLi = document.createElement('li');
    newLi.setAttribute('class', 'tiles');
    var newInput = document.createElement('input');
    newInput.setAttribute('type', 'checkbox');
    newInput.setAttribute('name', 'roots[]');
    newInput.setAttribute('value', i);
    newInput.setAttribute('id', chordRoots[i].name);
    var newLabel = document.createElement('label');
    newLabel.setAttribute('for', chordRoots[i].name);
    newLabel.innerHTML = chordRoots[i].name;
    newLi.appendChild(newInput);
    newLi.appendChild(newLabel);
    rootUl.appendChild(newLi);
  }
  var typeUl = document.getElementById('typeUl');
  for (let i=0; i<chordTypes.length; i++) {
    var newLi = document.createElement('li');
    newLi.setAttribute('class', 'tiles');
    var newInput = document.createElement('input');
    newInput.setAttribute('type', 'checkbox');
    newInput.setAttribute('name', 'types[]');
    newInput.setAttribute('value', i);
    newInput.setAttribute('id', 'type'+i);
    var newLabel = document.createElement('label');
    newLabel.setAttribute('for', 'type'+i);
    newLabel.innerHTML = chordTypes[i].name;
    newLi.appendChild(newInput);
    newLi.appendChild(newLabel);
    typeUl.appendChild(newLi);
  }
}

function initCheckboxes(notes, types, inversions) {
  let formRoots = document.getElementsByName('roots[]');
  let formTypes = document.getElementsByName('types[]');
  let formInv = document.getElementsByName('inversions[]');
  formRoots.forEach((root) => {
    root.checked = notes.includes(parseInt(root.value));
  });
  formTypes.forEach((ctype) => {
    ctype.checked = types.includes(parseInt(ctype.value));
  });  
  formInv.forEach((invtype) => {
    invtype.checked = inversions.includes(parseInt(invtype.value))
  });
  document.getElementById('connected1').checked = false;
  document.getElementById('connected2').checked = false;
}

function initGreg() {
  initCheckboxes([0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15], [0, 1], [0, 1, 2, 3]);
}

function initJola() {
  initCheckboxes([0, 1, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13], [0, 1], [0]);
}

function resetForm() {
  initCheckboxes([], [], []);
}

function startGame() {
  score = 0;
  let formRoots = document.getElementsByName('roots[]');
  selectedChords = []
  formRoots.forEach((root) => {
    if (root.checked) {
      selectedChords.push(chordRoots[root.value]);
    }
  });
  let formTypes = document.getElementsByName('types[]');
  selectedTypes = [];
  formTypes.forEach((ctype) => {
    if (ctype.checked) {
      selectedTypes.push(chordTypes[ctype.value]);
    }
  });
  let formInv = document.getElementsByName('inversions[]');
  selectedInversions = [];
  formInv.forEach((inv) => {
    if (inv.checked) {
      selectedInversions.push(inv.value);
    }
  });
  if ((selectedChords.length == 0) || (selectedTypes.length == 0) || (selectedInversions.length == 0)) return false;
  document.querySelector('#formdiv').style.display = 'none';
  document.querySelector('#gamediv').style.display = 'block';
  document.getElementById('stars').innerText = "";
  document.getElementById('prev').innerText = "";
  if ( (selectedInversions.indexOf('connected1') == -1) && (selectedInversions.indexOf('connected2') == -1) ) {
    document.getElementById('prev').style.display = 'none';
    document.getElementById('next').style.display = 'none';
    minCommon = false;
  } else {
    document.getElementById('prev').style.display = 'block';
    document.getElementById('next').style.display = 'block';
    minCommon = (selectedInversions.indexOf('connected1') != -1) ? 1 : 2;
  }
  delete nextq.question;
  gameStep();
}

function resetGame() {
  document.querySelector('#formdiv').style.display = 'block';
  document.querySelector('#gamediv').style.display = 'none';
  currentStep=0;
}

function getQuestion() {
  let randSymbol = Math.floor(Math.random() * selectedChords.length);
  let randType = Math.floor(Math.random() * selectedTypes.length);
  // filter out impossible inversions
  let availableInversions = [0];
  if (!minCommon) {
    availableInversions = [...selectedInversions];
  }
  if (selectedTypes[randType].intervals.length < 3) {
    if (availableInversions.indexOf('3') != -1) {
      availableInversions.splice(availableInversions.indexOf('3'), 1);
    }
  }
  if (availableInversions.length>0) {
    randInversion = availableInversions[Math.floor(Math.random() * availableInversions.length)];
  } else {
    randInversion = 0;
  }
  let correctRoot = selectedChords[randSymbol].note;
  let correctType = selectedTypes[randType];
  let correctNotes = [correctRoot];
  let y = correctRoot;
  for (let i=0; i<correctType.intervals.length; i++) {
    correctNotes.push((y+correctType.intervals[i]) % 12);
    y += correctType.intervals[i];
  }
  let invText = randInversion>0 ? randInversion+" przewrót" : "";

  let q = {};
  q.bassNote = correctNotes[randInversion];
  correctNotes.sort(function(a, b){return a-b});
  q.notes = correctNotes;
  q.question = selectedChords[randSymbol].name+"-"+selectedTypes[randType].name+" "+invText;
  return q;
}

function gameStep() {
  if (typeof nextq.question != "undefined") {
    document.getElementById('prev').innerText = currentq.question;
    currentq = nextq;
  } else {
    currentq = getQuestion();
  }
  nextq = getQuestion();
  if (minCommon) {
    while (commonNoteCount(currentq.notes, nextq.notes) < minCommon) {
      nextq = getQuestion();
    }
  }
  correctBass = currentq.bassNote;
  correctNotes = currentq.notes;
  document.getElementById('question').innerText = currentq.question;
  document.getElementById('next').innerText = nextq.question;
  currentStep++;
}

function commonNoteCount(chord1, chord2) {
  let result = 0;
  for (let i=0; i<chord1.length; i++) {
    if (chord2.includes(chord1[i] % 12)) {
      result++;
    }
  }
  return result;
}

function noteOnListener(note) {
  if (!currentStep) return false;
  currentNotes.push(note);
  currentBass = Math.min(...currentNotes) % 12;
  correctCount = commonNoteCount(currentNotes, correctNotes);
  if ( (currentNotes.length == correctNotes.length) && (correctCount != correctNotes.length) ) {
    document.getElementById('stars').innerText += "❌";
    failcount++;
    document.getElementById('counter').innerText = currentStep+"  ("+Math.floor(100*score/(score+failcount))+"%)";
  }
  document.getElementById('result').innerText = '✅ '.repeat(correctCount);
  if ( (correctCount == correctNotes.length) && (minCommon || (currentBass == correctBass)) ) {
    document.getElementById('stars').innerText += "⭐️";
    score++;
    document.getElementById('counter').innerText = currentStep+"  ("+Math.floor(100*score/(score+failcount))+"%)";
    gameStep();
  }
}

function noteOffListener(note) {
  currentNotes.splice(currentNotes.indexOf(note), 1);
  let correctCount = 0;
  for (let i=0; i<currentNotes.length; i++) {
    if (correctNotes.includes(currentNotes[i] % 12)) {
      correctCount++;
    }
  }
  document.getElementById('result').innerText = '✅ '.repeat(correctCount);
}
