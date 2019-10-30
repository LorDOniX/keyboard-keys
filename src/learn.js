import Keyboard from "keyboard";
import KeyboardSound from "keyboard-sound";
import Notes from "notes";
import Chords from "chords";
import Guitar from "guitar";
import { Note, NOTES_INC_RANGE, BETWEEN_NOTES_TREBLE, BETWEEN_NOTES_BASS, ON_LINE_NOTES_TREBLE, ON_LINE_NOTES_BASS } from "note";
import { KEYS_SIGNATURES, GUITAR_TUNES } from "conf";
import { domCreate, getSignatureNotes } from "utils";
import { OCTAVES } from "./conf";

class Learn {
	/**
	 * Lear section for keyboard.
	 */
	constructor() {
		this._withSound = false;
		this._dom = {};
		// build dom
		this._buildDom();
		// settings
		this._keyboard = new Keyboard(this._dom.keyboard, key => {
			this._onKey(key);
		});
		this._notesTreble = new Notes(this._dom.notesTreble, false, NOTES_INC_RANGE, data => {
			this._showNote(data.note, false, false/*, data.x*/);
		});
		this._notesBass = new Notes(this._dom.notesBass, true, NOTES_INC_RANGE, data => {
			this._showNote(data.note, true, false/*, data.x*/);
		});
		this._chords = new Chords(this, this._dom.selectOctave, this._dom.selectKey, this._dom.selectNote, this._dom.btnShowChord);
		this._guitar = new Guitar(this._dom.guitar, data => {
			this._onGuitar(data);
		});
		this._setGuitarTunes();
		this._soundToggle(false);
	}

	/**
	 * Get tab container.
	 *
	 * @return  {Element}
	 */
	get container() {
		return this._dom.tab;
	}

	/**
	 * Show tab.
	 */
	show() {
		this._keyboard.show();
		this._notesTreble.show();
		this._notesBass.show();
		this._guitar.show();
	}

	/**
	 * Hide tab.
	 */
	hide() {
		this._dom.h1Note.textContent = "";
		this._dom.signatureInfo.textContent = "";
	}

	/**
	 * Create elements.
	 */
	_buildDom() {
		let exportObj = {};
		let noteControlCb = () => {
			let value = this._dom.inputNotes.value.trim().toUpperCase();
			let allMatches = value.match(/[CDEFGAB][#b]?[0-7]/g);

			if (allMatches) {
				let notes = [];
				allMatches.forEach(item => {
					let m = item.match(/([CDEFGAB][#b]?)([0-7])/);

					if (m) {
						notes.push(new Note(m[1], parseFloat(m[2])));
					}
				});

				if (notes.length) {
					this.showChord("Custom", notes);
				}
			}
			
		};

		domCreate({
			el: "div",
			class: ["tab", "learn"],
			_export: "tab",
			child: [{
				el: "div",
				id: "info",
				child: {
					el: "h1",
					text: "Note",
					_export: "h1Note"
				}
			}, {
				el: "div",
				id: "notesTreble",
				_export: "notesTreble"
			}, {
				el: "div",
				id: "notesBass",
				_export: "notesBass"
			}, {
				el: "div",
				id: "guitar",
				_export: "guitar"
			}, {
				el: "div",
				id: "keyboard",
				_export: "keyboard"
			}, {
				el: "div",
				id: "control",
				child: [{
					el: "span",
					class: "note-control",
					child: [{
						el: "button",
						text: "Set notes",
						onclick: noteControlCb
					}, {
						el: "input",
						type: "text",
						placeholder: "Notes seperated by space",
						_export: "inputNotes",
						onkeydown: e => {
							if (e.which == 13) noteControlCb();
						}
					}]
				}, {
					el: "buttons",
					child: [{
						el: "button",
						class: "c4",
						text: "Middle C",
						onclick: () => {
							let middleC = Note.middleC();

							this._dom.h1Note.textContent = middleC.toString();
							this._keyboard.drawNote(middleC);
							this._notesTreble.drawNote(middleC);
							this._notesTreble.moveOffset();
							this._notesBass.drawNote(middleC);
							this._notesBass.moveOffset();
							this._guitar.drawNote(middleC);
						}
					}, {
						el: "button",
						class: "c4",
						text: "Between notes",
						onclick: () => {
							this._dom.h1Note.textContent = `Between notes`;

							let allNotes = [].concat(BETWEEN_NOTES_TREBLE, BETWEEN_NOTES_BASS);

							this._keyboard.drawNotes(allNotes);
							this._guitar.drawNotes(allNotes);
							this._notesTreble.drawNotes(BETWEEN_NOTES_TREBLE);
							this._notesTreble.moveOffset();
							this._notesBass.drawNotes(BETWEEN_NOTES_BASS);
							this._notesBass.moveOffset();
						}
					}, {
						el: "button",
						class: "c4",
						text: "On lines",
						onclick: () => {
							this._dom.h1Note.textContent = `On lines`;

							let allNotes = [].concat(ON_LINE_NOTES_TREBLE, ON_LINE_NOTES_BASS);

							this._keyboard.drawNotes(allNotes);
							this._guitar.drawNotes(allNotes);
							this._notesTreble.drawNotes(ON_LINE_NOTES_TREBLE);
							this._notesTreble.moveOffset();
							this._notesBass.drawNotes(ON_LINE_NOTES_BASS);
							this._notesBass.moveOffset();
						}
					}]
				}, {
					el: "div",
					class: "chords",
					child: ["Chords: ", {
						el: "select",
						class: "octave",
						_export: "selectOctave"
					}, {
						el: "select",
						class: "key",
						_export: "selectKey"
					}, {
						el: "select",
						class: "note",
						_export: "selectNote"
					}, {
						el: "button",
						class: "show",
						text: "Show chord",
						_export: "btnShowChord"
					}, {
						el: "button",
						_export: "btnSoundToggle",
						onclick: () => {
							this._soundToggle();
						}
					}]
				}]
			}, {
				el: "div",
				id: "signaturesCont",
				child: {
					el: "span",
					class: "signatures",
					child: [{
						el: "select",
						class: "signature",
						child: KEYS_SIGNATURES.map(item => {
							return {
								el: "option",
								value: item.name,
								text: `${item.name} ${item.key}${item.count}`
							};
						}),
						_export: "selectSignature"
					}, {
						el: "select",
						class: "octave",
						_export: "selectSignatureOctave"
					}, {
						el: "button",
						class: "show",
						text: "Show signature",
						onclick: () => {
							let st = getSignatureNotes(this._dom.selectSignature.value, parseFloat(this._dom.selectSignatureOctave.value));

							if (st) {
								this._dom.signatureInfo.textContent = st.msg;
								this._keyboard.drawNotes(st.notes);
								this._guitar.drawNotes(st.notes);
								this._notesTreble.drawNotes(st.notes);
								this._notesBass.drawNotes(st.notes);
								this._notesTreble.moveOffset();
								this._notesBass.moveOffset();
							}
						}
					}, {
						el: "span",
						class: "info",
						_export: "signatureInfo"
					}]
				}
			}, {
				el: "div",
				child: [{
					el: "span",
					class: "guitar-tune",
					child: ["Guitar tune: ", {
						el: "select",
						class: "guitar",
						_export: "selectGuitarTune"
					}]
				}, {
					el: "span",
					class: "info",
					_export: "guitarTuneInfo"
				}]
			}]
		}, exportObj);

		Object.assign(this._dom, exportObj);
		this._dom.selectSignature.value = KEYS_SIGNATURES.filter(i => i.key == "#" && i.count == 0)[0].name;
		// signature octave
		for (let i = 1; i <= OCTAVES; i++) {
			let option = domCreate({
				el: "option",
				value: i,
				text: i
			});
			this._dom.selectSignatureOctave.appendChild(option);
		}
		this._dom.selectSignatureOctave.value = Note.middleC().octave;
	}

	/**
	 * Show chord.
	 *
	 * @param   {String}  name Message to show
	 * @param   {Array}  notes array of { note, octave... }
	 */
	showChord(name, notes) {
		if (!Array.isArray(notes) || !notes.length) return;

		if (notes[0].octave < Note.middleC().octave) {
			this._notesBass.drawNotes(notes);
			this._notesBass.moveOffset();
		}
		else {
			this._notesTreble.drawNotes(notes);
			this._notesTreble.moveOffset();
		}

		this._keyboard.drawNotes(notes);
		this._guitar.drawNotes(notes);
		this._dom.h1Note.textContent = name + ": " + notes.map(i => i.toString()).join(", ");
	}

	/**
	 * Show note.
	 *
	 *@param   {String}  note  C...
	 * @param   {Number}  octave 0-8
	 * @param   {Boolean}  isBass Is bass range?
	 * @param   {Number}  x Own x position
	 */
	_showNote(note, isBass, x) {
		this._keyboard.drawNote(note);
		this._guitar.drawNote(note);

		if (isBass) {
			this._notesBass.drawNote(note, {
				x
			});
			this._notesBass.moveOffset();
		}
		else {
			this._notesTreble.drawNote(note, {
				x
			});
			this._notesTreble.moveOffset();
		}

		this._dom.h1Note.textContent = note.toString();
	}

	/**
	 * Set all guitar tunes.
	 */
	_setGuitarTunes() {
		GUITAR_TUNES.forEach(i => {
			let option = domCreate({
				el: "option",
				value: i.key,
				text: i.name
			});
			this._dom.selectGuitarTune.appendChild(option);
		});
		this._dom.selectGuitarTune.addEventListener("change", e => {
			this._setGuitarTune(this._dom.selectGuitarTune.value);
		});

		this._setGuitarTune(GUITAR_TUNES[0].key);
	}

	/**
	 * Set one specific guitar tune.
	 *
	 * @param   {String}  key Tune name
	 */
	_setGuitarTune(key) {
		let item = GUITAR_TUNES.filter(i => i.key == key);

		if (item.length) {
			item = item[0];
			this._dom.guitarTuneInfo.textContent = `${item.key}: ${item.config.join("")}`;
			this._guitar.setTune(item.config);
		}
	}

	/**
	 * On keyboard key.
	 *
	 * @param   {Object}  key Key data
	 */
	_onKey(key) {
		let middleC = Note.middleC();

		this._dom.h1Note.textContent = key.note.toString(true);
		this._guitar.drawNote(key.note);

		if (key.note.octave >= middleC.octave) {
			this._notesTreble.drawNote(key.note);
			this._notesTreble.moveOffset();

			if (key.note.note == middleC.note && key.note.octave == middleC.octave) {
				this._notesBass.drawNote(key.note);
				this._notesBass.moveOffset();
			}
		}
		else {
			this._notesBass.drawNote(key.note);
			this._notesBass.moveOffset();
		}
	}

	/**
	 * On guitar fretboard click.
	 *
	 * @param   {Object}  data Data in object
	 */
	_onGuitar(data) {
		this._dom.h1Note.textContent = data.note.toString(true);
		this._keyboard.drawNote(data.note);

		if (data.note.octave >= Note.middleC().octave) {
			this._notesTreble.drawNote(data.note);
			this._notesTreble.moveOffset();
		}
		else {
			this._notesBass.drawNote(data.note);
			this._notesBass.moveOffset();
		}
	}

	/**
	 * Switch keyboard sound.
	 *
	 * @param   {Boolean}  [state] Own state or toggle?
	 */
	_soundToggle(state) {
		this._withSound = typeof state === "boolean" ? state : !this._withSound;
		this._dom.btnSoundToggle.textContent = this._withSound ? "Disable sound" : "Enable sound";
		KeyboardSound.enable = this._withSound;
	}
};

export default Learn;
