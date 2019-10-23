export const OCTAVES = 7;
export const TONES = ["C", "D", "E", "F", "G", "A", "B"];
export const HALF_TONES = [["C#", "Db"], ["D#", "Eb"], ["F#", "Gb"], ["G#", "Ab"], ["A#", "Bb"]];
export const ALL_TONES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const ALL_TONES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
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

export const MIDDLE_C = {
	tone: "C",
	octave: 4
};
export const C_DUR = "C dur";
export const FLAT_TO_SHARP_MAPPING = {
	"Cb": "B",
	"Db": "C#",
	"Eb": "D#",
	"Fb": "E",
	"Gb": "F#",
	"Ab": "G#",
	"Bb": "A#"
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
			tone: "C",
			octave: 8
		},
		bottom: {
			helpLine: 1,
			tone: "C",
			octave: 4
		}
	},
	bass: {
		top: {
			helpLine: 1,
			tone: "C",
			octave: 4
		},
		bottom: {
			helpLine: 6,
			tone: "B",
			octave: 0
		}
	}
};

export const NOTES_INC_RANGE = {
	treble: {
		top: {
			helpLine: 9,
			tone: "C",
			octave: 8
		},
		bottom: {
			helpLine: 2,
			tone: "A",
			octave: 3
		}
	},
	bass: {
		top: {
			helpLine: 2,
			tone: "E",
			octave: 4
		},
		bottom: {
			helpLine: 6,
			tone: "B",
			octave: 0
		}
	}
};

export const BETWEEN_NOTES_TREBLE = [{
	tone: "F",
	octave: 4
}, {
	tone: "A",
	octave: 4
}, {
	tone: "C",
	octave: 5
}, {
	tone: "E",
	octave: 5
}];

export const BETWEEN_NOTES_BASS = [{
	tone: "A",
	octave: 2
}, {
	tone: "C",
	octave: 3
}, {
	tone: "E",
	octave: 3
}, {
	tone: "G",
	octave: 3
}];

export const ON_LINE_NOTES_TREBLE = [{
	tone: "E",
	octave: 4
}, {
	tone: "G",
	octave: 4
}, {
	tone: "B",
	octave: 4
}, {
	tone: "D",
	octave: 5
}, {
	tone: "F",
	octave: 5
}];

export const ON_LINE_NOTES_BASS = [{
	tone: "G",
	octave: 2
}, {
	tone: "B",
	octave: 2
}, {
	tone: "D",
	octave: 3
}, {
	tone: "F",
	octave: 3
}, {
	tone: "A",
	octave: 3
}];

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

export const KEYBOARD_RANGE = [{
	tone: "A",
	octave: 0
}, {
	tone: "C",
	octave: 8
}];

export const GUITAR_TONES = [
	{
		string: "E",
		order: 1,
		startTone: {
			tone: "E",
			octave: 4
		}
	}, {
		string: "B",
		order: 2,
		startTone: {
			tone: "B",
			octave: 3
		}
	}, {
		string: "G",
		order: 3,
		startTone: {
			tone: "G",
			octave: 3
		}
	}, {
		string: "D",
		order: 4,
		startTone: {
			tone: "D",
			octave: 3
		}
	}, {
		string: "A",
		order: 5,
		startTone: {
			tone: "A",
			octave: 2
		}
	}, {
		string: "E",
		order: 6,
		startTone: {
			tone: "E",
			octave: 2
		}
	}
]
