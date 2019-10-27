import Tone from "./tone";

export const OCTAVES = 7;
export const TONES = ["C", "D", "E", "F", "G", "A", "B"];
export const ALL_TONES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const TONES_SHARP = ["C#", "D#", "F#", "G#", "A#"];
export const CHORDS_KEYS = ["MAJOR", "MINOR", "MAJOR 7th", "MINOR 7th", "DOMINANT 7th"];
export const CHORDS_NOTES = ["A", "B", "C", "D", "E", "F", "G", "AbG#", "BbA#", "DbC#", "EbD#", "GbF#"];
export const CHORDS_RULES = {};

// A MAJOR = [A, C#, E], A MINOR = [A, C, E], MAJOR 7TH = [A, C#, E, G#], MINOR 7TH = [A, C, E, G], DOMINANT 7TH = [A, C# E, G]
// a ind 9, 0, second tone 4, third 7
// a ind 9, 0, second tone 3, third 7
// major
CHORDS_RULES[CHORDS_KEYS[0]] = [0, 4, 7];
// minor
CHORDS_RULES[CHORDS_KEYS[1]] = [0, 3, 7];
// major 7th
CHORDS_RULES[CHORDS_KEYS[2]] = CHORDS_RULES[CHORDS_KEYS[0]].slice();
CHORDS_RULES[CHORDS_KEYS[2]].push(11);
// minor 7th
CHORDS_RULES[CHORDS_KEYS[3]] = CHORDS_RULES[CHORDS_KEYS[1]].slice();
CHORDS_RULES[CHORDS_KEYS[3]].push(10);
// dominant 7th
CHORDS_RULES[CHORDS_KEYS[4]] = CHORDS_RULES[CHORDS_KEYS[0]].slice();
CHORDS_RULES[CHORDS_KEYS[4]].push(10);

export const C_DUR = "C dur";
export const FLAT_TO_SHARP_MAPPING = {
	"Cb": { tone: "B", octave: -1 },
	"Db": { tone: "C#", octave: 0 },
	"Eb": { tone: "D#", octave: 0 },
	"Fb": { tone: "E", octave: 0 },
	"Gb": { tone: "F#", octave: 0 },
	"Ab": { tone: "G#", octave: 0 },
	"Bb": { tone: "A#", octave: 0 }
};
export const KEYS_SIGNATURES = [{
		name: "Cb dur",
		tones: ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"],
		key: "b",
		count: 7
	}, {
		name: "Gb dur",
		tones: ["Cb", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
		key: "b",
		count: 6
	}, {
		name: "Db dur",
		tones: ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
		key: "b",
		count: 5
	}, {
		name: "Ab dur",
		tones: ["C", "Db", "Eb", "F", "G", "Ab", "Bb"],
		key: "b",
		count: 4
	}, {
		name: "Eb dur",
		tones: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
		key: "b",
		count: 3
	}, {
		name: "Bb dur",
		tones: ["C", "D", "Eb", "F", "G", "A", "Bb"],
		key: "b",
		count: 2
	}, {
		name: "F dur",
		tones: ["C", "D", "E", "F", "G", "A", "Bb"],
		key: "b",
		count: 1
	}, {
		name: C_DUR,
		tones: ["C", "D", "E", "F", "G", "A", "B"],
		key: "#",
		count: 0
	}, {
		name: "G dur",
		tones: ["C", "D", "E", "F#", "G", "A", "B"],
		key: "#",
		count: 1
	}, {
		name: "D dur",
		tones: ["C#", "D", "E", "F#", "G", "A", "B"],
		key: "#",
		count: 2
	}, {
		name: "A dur",
		tones: ["C#", "D", "E", "F#", "G#", "A", "B"],
		key: "#",
		count: 3
	}, {
		name: "E dur",
		tones: ["C#", "D#", "E", "F#", "G#", "A", "B"],
		key: "#",
		count: 4
	}, {
		name: "B dur",
		tones: ["C#", "D#", "E", "F#", "G#", "A#", "B"],
		key: "#",
		count: 5
	}, {
		name: "GbF# dur",
		tones: ["C#", "D#", "E#", "F#", "G#", "A#", "B"],
		key: "#",
		count: 6
	}, {
		name: "C# dur",
		tones: ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
		key: "#",
		count: 7
}];

export const KEYS_SIGNATURES_OBJ = {};
KEYS_SIGNATURES.forEach(i => {
	KEYS_SIGNATURES_OBJ[i.name] = i;
});

export const NOTES_RANGE = {
	treble: {
		top: {
			helpLine: 9,
			tone: new Tone("C8")
		},
		bottom: {
			helpLine: 1,
			tone: new Tone("C4")
		}
	},
	bass: {
		top: {
			helpLine: 1,
			tone: new Tone("C4")
		},
		bottom: {
			helpLine: 6,
			tone: new Tone("B0")
		}
	}
};

export const NOTES_INC_RANGE = {
	treble: {
		top: {
			helpLine: 9,
			tone: new Tone("C8")
		},
		bottom: {
			helpLine: 2,
			tone: new Tone("A3")
		}
	},
	bass: {
		top: {
			helpLine: 2,
			tone: new Tone("E4")
		},
		bottom: {
			helpLine: 6,
			tone: new Tone("B0")
		}
	}
};

export const BETWEEN_NOTES_TREBLE = [new Tone("F4"), new Tone("A4"), new Tone("C5"), new Tone("E5")];
export const BETWEEN_NOTES_BASS = [new Tone("A2"), new Tone("C3"), new Tone("E3"), new Tone("G3")];
export const ON_LINE_NOTES_TREBLE = [new Tone("E4"), new Tone("G4"), new Tone("B4"), new Tone("D5"), new Tone("F5")];
export const ON_LINE_NOTES_BASS = [new Tone("G2"), new Tone("B2"), new Tone("D3"), new Tone("F3"), new Tone("A3")];

export const IMAGES = {
	treble: {
		src: "/img/treble.png",
		width: 45,
		height: 119,
		offsetY: 28
	},
	bass: {
		src: "/img/bass.png",
		width: 46,
		height: 53
	},
	layout: {
		src: "/img/keyboard-layout.png",
		width: 1775,
		height: 330
	}
};

export const KEYBOARD_RANGE = [new Tone("A0"), new Tone("C8")];

export const GUITAR_TONES = [
	{
		string: "E",
		order: 1,
		startTone: new Tone("E4")
	}, {
		string: "B",
		order: 2,
		startTone: new Tone("B3")
	}, {
		string: "G",
		order: 3,
		startTone: new Tone("G3")
	}, {
		string: "D",
		order: 4,
		startTone: new Tone("D3")
	}, {
		string: "A",
		order: 5,
		startTone: new Tone("A2")
	}, {
		string: "E",
		order: 6,
		startTone: new Tone("E2")
	}
];

export const GUITAR_POINTED_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];

export const GUITAR_TUNES = [{
	name: "Standard",
	key: "EADGBE",
	config: [0, 0, 0, 0, 0, 0]
}, {
	name: "Drop D",
	key: "DADGBE",
	config: [-2, 0, 0, 0, 0, 0]
}, {
	name: "Half step down",
	key: "D#G#C#F#A#D#",
	config: [-1, -1, -1, -1, -1, -1]
}, {
	name: "Drop C#",
	key: "C#G#C#F#A#D#",
	config: [-3, -1, -1, -1, -1, -1]
}, {
	name: "Two steps down",
	key: "DGCFAD",
	config: [-2, -2, -2, -2, -2, -2]
}, {
	name: "Drop C",
	key: "CGCFAD",
	config: [-4, -2, -2, -2, -2, -2]
}, {
	name: "C",
	key: "CFA#D#GC",
	config: [-4, -4, -4, -4, -4, -4]
}, {
	name: "Drop B",
	key: "BF#BEG#C#",
	config: [-5, -3, -3, -3, -3, -3]
}, {
	name: "Drop A#",
	key: "A#FA#D#GC",
	config: [-6, -4, -4, -4, -4, -4]
}];

export const BLACK_KEY_POSITION = {
	left: 0,
	middle: 1,
	right: 2
};

export const BLACK_KEY_MAPPING = {
	"C": BLACK_KEY_POSITION.right,
	"D": BLACK_KEY_POSITION.middle,
	"E": BLACK_KEY_POSITION.left,
	"F": BLACK_KEY_POSITION.right,
	"G": BLACK_KEY_POSITION.middle,
	"A": BLACK_KEY_POSITION.middle,
	"B": BLACK_KEY_POSITION.left
};
