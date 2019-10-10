import { ALL_TONES_SHARP, CHORDS_KEYS, CHORDS_NOTES, CHORDS_RULES, MIDDLE_C } from "conf";

class Chords {
	/**
	 * Chords - show chords on the keyboard.
	 *
	 * @param   {Main}  owner 
	 * @param   {Select}  octaveSelectEl  Element for octaves
	 * @param   {Select}  keySelectEl    Element for keys
	 * @param   {Select}  noteSelectEl  Element for notes
	 * @param   {Element}  showBtn  Show button reference
	 */
	constructor(owner, octaveSelectEl, keySelectEl, noteSelectEl, showBtn) {
		this._owner = owner;
		this._octaveSelectEl = octaveSelectEl;
		this._keySelectEl = keySelectEl;
		this._noteSelectEl = noteSelectEl;
		showBtn.addEventListener("click", () => {
			this._showChord();
		});

		this._fillSelects();
	}

	/**
	 * Fill all selects with values.
	 */
	_fillSelects() {
		// octaves
		for (let i = 1; i <= 7; i++) {
			let option = document.createElement("option");
			option.value = i;
			option.textContent = i;
			this._octaveSelectEl.appendChild(option);
		}

		// keys
		CHORDS_KEYS.forEach(key => {
			let option = document.createElement("option");
			option.value = key;
			option.textContent = key;
			this._keySelectEl.appendChild(option);
		});

		// notes
		CHORDS_NOTES.forEach(note => {
			let option = document.createElement("option");
			option.value = note;
			option.textContent = note;
			this._noteSelectEl.appendChild(option);
		});

		// def. values
		this._octaveSelectEl.value = MIDDLE_C.octave;
		this._noteSelectEl.value = MIDDLE_C.tone;
	}

	/**
	 * Button click - show chord.
	 */
	_showChord() {
		let octave = parseFloat(this._octaveSelectEl.value);
		let key = this._keySelectEl.value;
		let note = this._noteSelectEl.value;
		
		if (note.length > 1) {
			note = note.substr(2, 2);
		}

		let rules = CHORDS_RULES[key];
		let noteInd = ALL_TONES_SHARP.indexOf(note);
		let chordNotes = [];

		for (let i = 0; i < rules.length; i++) {
			let curNoteInd = noteInd + rules[i];
			let curOctave = octave;

			if (curNoteInd > ALL_TONES_SHARP.length - 1) {
				curNoteInd -= ALL_TONES_SHARP.length;
				curOctave++;
			}

			chordNotes.push({
				tone: ALL_TONES_SHARP[curNoteInd],
				octave: curOctave
			});
		}

		this._owner.showChord(`${key.toLowerCase()} ${note}`, chordNotes);
	}
}

export default Chords;
