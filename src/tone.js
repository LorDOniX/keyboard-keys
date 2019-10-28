import { CHORDS_KEYS, CHORDS_RULES, ALL_TONES_SHARP, KEYS_SIGNATURES_OBJ, C_DUR, FLAT_TO_SHARP_MAPPING, BLACK_KEY_MAPPING, TONES, SHARP_TO_FLAT } from "conf";

export class Tone {
	/**
	 * Create a new tone.
	 *
	 * @param   {String}  tone Tone or whole configuration like C#6
	 * @param   {Number}  [octave] Octave
	 */
	constructor(tone, octave) {
		this._tone = "";
		this._simple = "";
		this._octave = 0;
		this._isSharp = false;

		if (typeof tone === "string" && typeof octave === "undefined") {
			// parsovani
			let m = tone.match(/([C,D,E,F,G,A,B])(#?)([0-9])/);
			
			if (m) {
				this._tone = m[1] + m[2];
				this._simple = m[1];
				this._isSharp = m[2] == "#";
				this._octave = parseFloat(m[3]);
			}
		}
		else if (typeof tone === "string" && typeof octave === "number") {
			this._tone = tone;
			this._octave = octave;
			this._isSharp = tone.indexOf("#") != -1;
			this._simple = this._isSharp ? this._tone.replace("#", "") : this._tone;
		}
	}

	/**
	 * Get full tone like C#
	 *
	 * @return  {String}
	 */
	get tone() {
		return this._tone;
	}

	/**
	 * Get simple tone like C# -> C
	 *
	 * @return  {String}
	 */
	get simple() {
		return this._simple;
	}

	/**
	 * Get tone octave.
	 *
	 * @return  {Number}
	 */
	get octave() {
		return this._octave;
	}

	/**
	 * Is tone sharp? C# true, C false
	 *
	 * @return  {Boolean}
	 */
	get isSharp() {
		return this._isSharp;
	}

	/**
	 * Clone tone.
	 *
	 * @return  {Tone}
	 */
	clone() {
		return new Tone(this._tone, this._octave);
	}

	/**
	 * To string override.
	 *
	 * @return  {String}
	 */
	toString(withFlat) {
		return `${this._tone}${withFlat && this._isSharp ? "/" + SHARP_TO_FLAT[this._tone] : ""}${this._octave}`;
	}

	/**
	 * Is tone equal to another tone?
	 *
	 * @param   {Tone}  tone Tone to compare
	 * @return  {Boolean}
	 */
	equal(tone) {
		return (tone.tone == this._tone && tone.octave == this._octave);
	}

	/**
	 * Generate chord tones.
	 *
	 * @param   {Tone}  tone Chord main tone and start octave
	 * @param   {String}  key  Major, minor, etc...
	 * @return  {Array[Tone]}
	 */
	generateChord(key = CHORDS_KEYS[0]) {
		let rules = CHORDS_RULES[key];
		let noteInd = ALL_TONES_SHARP.indexOf(this._tone);
		let chordNotes = [];

		for (let i = 0; i < rules.length; i++) {
			let curNoteInd = noteInd + rules[i];
			let curOctave = this._octave;

			if (curNoteInd > ALL_TONES_SHARP.length - 1) {
				curNoteInd -= ALL_TONES_SHARP.length;
				curOctave++;
			}

			chordNotes.push(new Tone(ALL_TONES_SHARP[curNoteInd], curOctave));
		}

		return chordNotes;
	}
	
	/**
	 * Set tone to signature.
	 *
	 * @param   {Object} signature Signature object
	 * @return  {Tone}
	 */
	toSignature(signature) {
		let tone = this._simple;
		let octave = this._octave;

		if (signature.key == "#" && signature.count > 0) {
			let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
			let ind = cDur.tones.indexOf(tone);
			let sigTone = signature.tones[ind];

			if (sigTone != this._simple) {
				tone = sigTone;
			}
		}
		else if (signature.key == "b" && signature.count > 0) {
			// b, Cb => B a octave--
			let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
			let ind = cDur.tones.indexOf(tone);
			let sigTone = signature.tones[ind];

			if (sigTone != tone) {
				tone = FLAT_TO_SHARP_MAPPING[sigTone].tone;
				octave += FLAT_TO_SHARP_MAPPING[sigTone].octave;
			}
		}

		return new Tone(tone, octave);
	}
		
	/**
	 * Generate notes.
	 * 
	 * @param {Tone} endTone
	 * @param {Boolean} [fullRange] Use simple or full sharp tones?
	 */
	generateTones(endTone, fullRange) {
		// generate notes
		let octave = Math.min(this._octave, endTone.octave);
		let endOctave = Math.max(this._octave, endTone.octave);
		let source = fullRange ? ALL_TONES_SHARP : TONES;
		let toneInd = source.indexOf(this._tone);
		let endToneInd = source.indexOf(endTone.tone);
		let minToneInd = source.indexOf(KEYBOARD_RANGE[0].tone);
		let maxToneInd = source.indexOf(KEYBOARD_RANGE[1].tone);
		let allTones = [];

		while (true) {
			let insert = true;

			if (toneInd < minToneInd && octave == KEYBOARD_RANGE[0].octave) {
				insert = false;
			}
			if ((toneInd > endToneInd && octave == endOctave) || (toneInd > maxToneInd && octave == KEYBOARD_RANGE[1].octave)) {
				break;
			}

			if (insert) {
				allTones.push(new Tone(source[toneInd], octave));
			}

			toneInd++;

			if (toneInd == source.length) {
				toneInd = 0;
				octave++;
			}
		}

		return allTones;
	}
	
	/**
	 * Black key position to the input tone.
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
	 * Get middle C tone.
	 *
	 * @return  {Tone}
	 */
	static middleC() {
		return new Tone("C", 4);
	}

	/**
	 * Get random simple tone.
	 *
	 * @return  {Tone}
	 */
	static randomTone() {
		let ind = Math.floor(Math.random() * (TONES.length - 1));
		return new Tone(TONES[ind], 4);
	}
};

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
