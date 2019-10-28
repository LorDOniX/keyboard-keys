import { Tone } from "tone";
import { CHORDS_KEYS, CHORDS_NOTES } from "conf";

class Chords {
	/**
	 * Chords - show chords on the keyboard.
	 *
	 * @param   {Main}  owner 
	 * @param   {Select}  octaveSelectEl  Element for octaves
	 * @param   {Select}  keySelectEl    Element for keys
	 * @param   {Select}  toneSelectEl  Element for notes
	 * @param   {Element}  showBtn  Show button reference
	 */
	constructor(owner, octaveSelectEl, keySelectEl, toneSelectEl, showBtn) {
		this._owner = owner;
		this._octaveSelectEl = octaveSelectEl;
		this._keySelectEl = keySelectEl;
		this._toneSelectEl = toneSelectEl;
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
			this._toneSelectEl.appendChild(option);
		});

		// def. values
		let middleC = Tone.middleC();

		this._octaveSelectEl.value = middleC.octave;
		this._toneSelectEl.value = middleC.tone;
	}

	/**
	 * Button click - show chord.
	 */
	_showChord() {
		let tone = this._toneSelectEl.value;
		let octave = parseFloat(this._octaveSelectEl.value);
		let key = this._keySelectEl.value;
		let chordNotes = (new Tone(tone, octave)).generateChord(key);

		this._owner.showChord(`${key.toLowerCase()} ${tone}`, chordNotes);
	}
}

export default Chords;
