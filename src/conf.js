export const OCTAVES = 7;
export const NOTES = ["C", "D", "E", "F", "G", "A", "B"];
export const ALL_NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const NOTES_SHARP = ["C#", "D#", "F#", "G#", "A#"];
export const CHORDS_KEYS = ["MAJOR", "MINOR", "MAJOR 7th", "MINOR 7th", "DOMINANT 7th"];
export const CHORDS_NOTES = ["A", "B", "C", "D", "E", "F", "G", "AbG#", "BbA#", "DbC#", "EbD#", "GbF#"];
export const CHORDS_RULES = {};

// A MAJOR = [A, C#, E], A MINOR = [A, C, E], MAJOR 7TH = [A, C#, E, G#], MINOR 7TH = [A, C, E, G], DOMINANT 7TH = [A, C# E, G]
// a ind 9, 0, second note 4, third 7
// a ind 9, 0, second note 3, third 7
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
	"Cb": { note: "B", octave: -1 },
	"Db": { note: "C#", octave: 0 },
	"Eb": { note: "D#", octave: 0 },
	"Fb": { note: "E", octave: 0 },
	"Gb": { note: "F#", octave: 0 },
	"Ab": { note: "G#", octave: 0 },
	"Bb": { note: "A#", octave: 0 }
};
export const SHARP_TO_FLAT = {
	"C#": "Db",
	"D#": "Eb",
	"F#": "Gb",
	"G#": "Ab",
	"A#": "Bb"
};
export const KEYS_SIGNATURES = [{
		name: "Cb dur",
		notes: ["Cb", "Db", "Eb", "Fb", "Gb", "Ab", "Bb"],
		key: "b",
		count: 7
	}, {
		name: "Gb dur",
		notes: ["Cb", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
		key: "b",
		count: 6
	}, {
		name: "Db dur",
		notes: ["C", "Db", "Eb", "F", "Gb", "Ab", "Bb"],
		key: "b",
		count: 5
	}, {
		name: "Ab dur",
		notes: ["C", "Db", "Eb", "F", "G", "Ab", "Bb"],
		key: "b",
		count: 4
	}, {
		name: "Eb dur",
		notes: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
		key: "b",
		count: 3
	}, {
		name: "Bb dur",
		notes: ["C", "D", "Eb", "F", "G", "A", "Bb"],
		key: "b",
		count: 2
	}, {
		name: "F dur",
		notes: ["C", "D", "E", "F", "G", "A", "Bb"],
		key: "b",
		count: 1
	}, {
		name: C_DUR,
		notes: ["C", "D", "E", "F", "G", "A", "B"],
		key: "#",
		count: 0
	}, {
		name: "G dur",
		notes: ["C", "D", "E", "F#", "G", "A", "B"],
		key: "#",
		count: 1
	}, {
		name: "D dur",
		notes: ["C#", "D", "E", "F#", "G", "A", "B"],
		key: "#",
		count: 2
	}, {
		name: "A dur",
		notes: ["C#", "D", "E", "F#", "G#", "A", "B"],
		key: "#",
		count: 3
	}, {
		name: "E dur",
		notes: ["C#", "D#", "E", "F#", "G#", "A", "B"],
		key: "#",
		count: 4
	}, {
		name: "B dur",
		notes: ["C#", "D#", "E", "F#", "G#", "A#", "B"],
		key: "#",
		count: 5
	}, {
		name: "GbF# dur",
		notes: ["C#", "D#", "E#", "F#", "G#", "A#", "B"],
		key: "#",
		count: 6
	}, {
		name: "C# dur",
		notes: ["C#", "D#", "E#", "F#", "G#", "A#", "B#"],
		key: "#",
		count: 7
}];

export const KEYS_SIGNATURES_OBJ = {};
KEYS_SIGNATURES.forEach(i => {
	KEYS_SIGNATURES_OBJ[i.name] = i;
});

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
