import { CHORDS_KEYS, CHORDS_RULES, ALL_NOTES_SHARP, KEYS_SIGNATURES_OBJ, C_DUR, FLAT_TO_SHARP_MAPPING, BLACK_KEY_MAPPING, NOTES, SHARP_TO_FLAT } from "conf";

export class Note {
	/**
	 * Create a new note.
	 *
	 * @param   {String}  note Note or whole configuration like C#6
	 * @param   {Number}  [octave] Octave
	 */
	constructor(note, octave) {
		this._note = "";
		this._simple = "";
		this._octave = 0;
		this._isSharp = false;

		if (typeof note === "string" && typeof octave === "undefined") {
			// parsovani
			let m = note.match(/([C,D,E,F,G,A,B])(#?)([0-9])/);
			
			if (m) {
				this._note = m[1] + m[2];
				this._simple = m[1];
				this._isSharp = m[2] == "#";
				this._octave = parseFloat(m[3]);
			}
		}
		else if (typeof note === "string" && typeof octave === "number") {
			this._note = note;
			this._octave = octave;
			this._isSharp = note.indexOf("#") != -1;
			this._simple = this._isSharp ? this._note.replace("#", "") : this._note;
		}
	}

	/**
	 * Get full note like C#
	 *
	 * @return  {String}
	 */
	get note() {
		return this._note;
	}

	/**
	 * Get simple note like C# -> C
	 *
	 * @return  {String}
	 */
	get simple() {
		return this._simple;
	}

	/**
	 * Get note octave.
	 *
	 * @return  {Number}
	 */
	get octave() {
		return this._octave;
	}

	/**
	 * Is note sharp? C# true, C false
	 *
	 * @return  {Boolean}
	 */
	get isSharp() {
		return this._isSharp;
	}

	/**
	 * Clone note.
	 *
	 * @return  {Note}
	 */
	clone() {
		return new Note(this._note, this._octave);
	}

	/**
	 * To string override.
	 *
	 * @return  {String}
	 */
	toString(withFlat) {
		return `${this._note}${withFlat && this._isSharp ? "/" + SHARP_TO_FLAT[this._note] : ""}${this._octave}`;
	}

	/**
	 * Is note equal to another note?
	 *
	 * @param   {Note}  note Note to compare
	 * @return  {Boolean}
	 */
	equal(note) {
		return (note.note == this._note && note.octave == this._octave);
	}

	/**
	 * Generate chord notes.
	 *
	 * @param   {String}  key  Major, minor, etc...
	 * @return  {Array[Note]}
	 */
	generateChord(key = CHORDS_KEYS[0]) {
		let rules = CHORDS_RULES[key];
		let noteInd = ALL_NOTES_SHARP.indexOf(this._note);
		let chordNotes = [];

		for (let i = 0; i < rules.length; i++) {
			let curNoteInd = noteInd + rules[i];
			let curOctave = this._octave;

			if (curNoteInd > ALL_NOTES_SHARP.length - 1) {
				curNoteInd -= ALL_NOTES_SHARP.length;
				curOctave++;
			}

			chordNotes.push(new Note(ALL_NOTES_SHARP[curNoteInd], curOctave));
		}

		return chordNotes;
	}
	
	/**
	 * Set note to signature.
	 *
	 * @param   {Object} signature Signature object
	 * @return  {Note}
	 */
	toSignature(signature) {
		let note = this._simple;
		let octave = this._octave;

		if (signature.key == "#" && signature.count > 0) {
			let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
			let ind = cDur.notes.indexOf(note);
			let sigNote = signature.notes[ind];

			if (sigNote != this._simple) {
				note = sigNote;
			}
		}
		else if (signature.key == "b" && signature.count > 0) {
			// b, Cb => B a octave--
			let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
			let ind = cDur.notes.indexOf(note);
			let sigNote = signature.notes[ind];

			if (sigNote != note) {
				note = FLAT_TO_SHARP_MAPPING[sigNote].note;
				octave += FLAT_TO_SHARP_MAPPING[sigNote].octave;
			}
		}

		return new Note(note, octave);
	}
		
	/**
	 * Generate notes.
	 * 
	 * @param {Note} endNote
	 * @param {Boolean} [fullRange] Use simple or full sharp notes?
	 */
	generateNotes(endNote, fullRange) {
		// generate notes
		let octave = Math.min(this._octave, endNote.octave);
		let endOctave = Math.max(this._octave, endNote.octave);
		let source = fullRange ? ALL_NOTES_SHARP : NOTES;
		let noteInd = source.indexOf(this._note);
		let endNoteInd = source.indexOf(endNote.note);
		let minNoteInd = source.indexOf(KEYBOARD_RANGE[0].note);
		let maxNoteInd = source.indexOf(KEYBOARD_RANGE[1].note);
		let allNotes = [];

		while (true) {
			let insert = true;

			if (noteInd < minNoteInd && octave == KEYBOARD_RANGE[0].octave) {
				insert = false;
			}
			if ((noteInd > endNoteInd && octave == endOctave) || (noteInd > maxNoteInd && octave == KEYBOARD_RANGE[1].octave)) {
				break;
			}

			if (insert) {
				allNotes.push(new Note(source[noteInd], octave));
			}

			noteInd++;

			if (noteInd == source.length) {
				noteInd = 0;
				octave++;
			}
		}

		return allNotes;
	}
	
	/**
	 * Black key position to the input note.
	 *
	 * @return  {BLACK_KEY_MAPPING}
	 */
	blackKeyPosition() {
		if (!this._isSharp) {
			return BLACK_KEY_MAPPING[this._simple];
		}
		else return null;
	}

	/**
	 * Get middle C note.
	 *
	 * @return  {Note}
	 */
	static middleC() {
		return new Note("C", 4);
	}

	/**
	 * Get random simple note.
	 *
	 * @return  {Note}
	 */
	static random() {
		let ind = Math.floor(Math.random() * (NOTES.length - 1));
		return new Note(NOTES[ind], 4);
	}
};

export const NOTES_RANGE = {
	treble: {
		top: {
			helpLine: 9,
			note: new Note("C8")
		},
		bottom: {
			helpLine: 1,
			note: new Note("C4")
		}
	},
	bass: {
		top: {
			helpLine: 1,
			note: new Note("C4")
		},
		bottom: {
			helpLine: 6,
			note: new Note("B0")
		}
	}
};
export const NOTES_INC_RANGE = {
	treble: {
		top: {
			helpLine: 9,
			note: new Note("C8")
		},
		bottom: {
			helpLine: 2,
			note: new Note("A3")
		}
	},
	bass: {
		top: {
			helpLine: 2,
			note: new Note("E4")
		},
		bottom: {
			helpLine: 6,
			note: new Note("B0")
		}
	}
};
export const BETWEEN_NOTES_TREBLE = [new Note("F4"), new Note("A4"), new Note("C5"), new Note("E5")];
export const BETWEEN_NOTES_BASS = [new Note("A2"), new Note("C3"), new Note("E3"), new Note("G3")];
export const ON_LINE_NOTES_TREBLE = [new Note("E4"), new Note("G4"), new Note("B4"), new Note("D5"), new Note("F5")];
export const ON_LINE_NOTES_BASS = [new Note("G2"), new Note("B2"), new Note("D3"), new Note("F3"), new Note("A3")];
export const KEYBOARD_RANGE = [new Note("A0"), new Note("C8")];
export const GUITAR_NOTES = [
	{
		string: "E",
		order: 1,
		startNote: new Note("E4")
	}, {
		string: "B",
		order: 2,
		startNote: new Note("B3")
	}, {
		string: "G",
		order: 3,
		startNote: new Note("G3")
	}, {
		string: "D",
		order: 4,
		startNote: new Note("D3")
	}, {
		string: "A",
		order: 5,
		startNote: new Note("A2")
	}, {
		string: "E",
		order: 6,
		startNote: new Note("E2")
	}
];
