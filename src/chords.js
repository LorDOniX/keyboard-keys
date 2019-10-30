import { Note } from "note";
import { CHORDS_KEYS, CHORDS_NOTES } from "conf";

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
		let middleC = Note.middleC();

		this._octaveSelectEl.value = middleC.octave;
		this._noteSelectEl.value = middleC.note;
	}

	/**
	 * Button click - show chord.
	 */
	_showChord() {
		let note = this._noteSelectEl.value;
		let octave = parseFloat(this._octaveSelectEl.value);
		let key = this._keySelectEl.value;
		let chordNotes = (new Note(note, octave)).generateChord(key);

		this._owner.showChord(`${key.toLowerCase()} ${note}`, chordNotes);
	}
}

export default Chords;
