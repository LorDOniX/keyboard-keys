import Keyboard from "keyboard";
import Notes from "notes";
import Chords from "chords";
import Guitar from "guitar";
import { Tone, NOTES_INC_RANGE, BETWEEN_NOTES_TREBLE, BETWEEN_NOTES_BASS, ON_LINE_NOTES_TREBLE, ON_LINE_NOTES_BASS } from "tone";
import { KEYS_SIGNATURES, GUITAR_TUNES } from "conf";
import { domCreate, getSignatureTones } from "utils";
import { OCTAVES } from "./conf";

class Learn {
	/**
	 * Lear section for keyboard.
	 */
	constructor() {
		this._dom = {};
		// build dom
		this._buildDom();
		// settings
		this._keyboard = new Keyboard(this._dom.keyboard, key => {
			this._onKey(key);
		});
		this._notesTreble = new Notes(this._dom.notesTreble, false, NOTES_INC_RANGE, data => {
			this._showTone(data.tone, false, false/*, data.x*/);
		});
		this._notesBass = new Notes(this._dom.notesBass, true, NOTES_INC_RANGE, data => {
			this._showTone(data.tone, true, false/*, data.x*/);
		});
		this._chords = new Chords(this, this._dom.selectOctave, this._dom.selectKey, this._dom.selectNote, this._dom.btnShowChord);
		this._guitar = new Guitar(this._dom.guitar, data => {
			this._onGuitar(data);
		});
		this._setGuitarTunes();
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
		this._dom.h1Tone.textContent = "";
		this._dom.signatureInfo.textContent = "";
	}

	/**
	 * Create elements.
	 */
	_buildDom() {
		let exportObj = {};
		let toneControlCb = () => {
			let value = this._dom.inputTones.value.trim().toUpperCase();
			let allMatches = value.match(/[CDEFGAB][#b]?[0-7]/g);

			if (allMatches) {
				let tones = [];
				allMatches.forEach(item => {
					let m = item.match(/([CDEFGAB][#b]?)([0-7])/);

					if (m) {
						tones.push(new Tone(m[1], parseFloat(m[2])));
					}
				});

				if (tones.length) {
					this.showChord("Custom", tones);
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
					text: "Tone",
					_export: "h1Tone"
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
					class: "tone-control",
					child: [{
						el: "button",
						text: "Set tones",
						onclick: toneControlCb
					}, {
						el: "input",
						type: "text",
						placeholder: "Tones seperated by space",
						_export: "inputTones",
						onkeydown: e => {
							if (e.which == 13) toneControlCb();
						}
					}]
				}, {
					el: "buttons",
					child: [{
						el: "button",
						class: "c4",
						text: "Middle C",
						onclick: () => {
							let middleC = Tone.middleC();

							this._dom.h1Tone.textContent = middleC.toString();
							this._keyboard.drawTone(middleC);
							this._notesTreble.drawTone(middleC);
							this._notesTreble.moveOffset();
							this._notesBass.drawTone(middleC);
							this._notesBass.moveOffset();
							this._guitar.drawTone(middleC);
						}
					}, {
						el: "button",
						class: "c4",
						text: "Between notes",
						onclick: () => {
							this._dom.h1Tone.textContent = `Between notes`;

							let allNotes = [].concat(BETWEEN_NOTES_TREBLE, BETWEEN_NOTES_BASS);

							this._keyboard.drawTones(allNotes);
							this._guitar.drawTones(allNotes);
							this._notesTreble.drawTones(BETWEEN_NOTES_TREBLE);
							this._notesTreble.moveOffset();
							this._notesBass.drawTones(BETWEEN_NOTES_BASS);
							this._notesBass.moveOffset();
						}
					}, {
						el: "button",
						class: "c4",
						text: "On lines",
						onclick: () => {
							this._dom.h1Tone.textContent = `On lines`;

							let allNotes = [].concat(ON_LINE_NOTES_TREBLE, ON_LINE_NOTES_BASS);

							this._keyboard.drawTones(allNotes);
							this._guitar.drawTones(allNotes);
							this._notesTreble.drawTones(ON_LINE_NOTES_TREBLE);
							this._notesTreble.moveOffset();
							this._notesBass.drawTones(ON_LINE_NOTES_BASS);
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
							let st = getSignatureTones(this._dom.selectSignature.value, parseFloat(this._dom.selectSignatureOctave.value));

							if (st) {
								this._dom.signatureInfo.textContent = st.msg;
								this._keyboard.drawTones(st.tones);
								this._guitar.drawTones(st.tones);
								this._notesTreble.drawTones(st.tones);
								this._notesBass.drawTones(st.tones);
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
		this._dom.selectSignatureOctave.value = Tone.middleC().octave;
	}

	/**
	 * Show chord.
	 *
	 * @param   {String}  name Message to show
	 * @param   {Array}  tones array of { tone, octave... }
	 */
	showChord(name, tones) {
		if (!Array.isArray(tones) || !tones.length) return;

		if (tones[0].octave < Tone.middleC().octave) {
			this._notesBass.drawTones(tones);
			this._notesBass.moveOffset();
		}
		else {
			this._notesTreble.drawTones(tones);
			this._notesTreble.moveOffset();
		}

		this._keyboard.drawTones(tones);
		this._guitar.drawTones(tones);
		this._dom.h1Tone.textContent = name + ": " + tones.map(i => i.toString()).join(", ");
	}

	/**
	 * Show tone.
	 *
	 *@param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 * @param   {Boolean}  isBass Is bass range?
	 * @param   {Number}  x Own x position
	 */
	_showTone(tone, isBass, x) {
		this._keyboard.drawTone(tone);
		this._guitar.drawTone(tone);

		if (isBass) {
			this._notesBass.drawTone(tone, {
				x
			});
			this._notesBass.moveOffset();
		}
		else {
			this._notesTreble.drawTone(tone, {
				x
			});
			this._notesTreble.moveOffset();
		}

		this._dom.h1Tone.textContent = tone.toString();
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
		let middleC = Tone.middleC();

		this._dom.h1Tone.textContent = key.tone.toString(true);
		this._guitar.drawTone(key.tone);

		if (key.tone.octave >= middleC.octave) {
			this._notesTreble.drawTone(key.tone);
			this._notesTreble.moveOffset();

			if (key.tone.tone == middleC.tone && key.tone.octave == middleC.octave) {
				this._notesBass.drawTone(key.tone);
				this._notesBass.moveOffset();
			}
		}
		else {
			this._notesBass.drawTone(key.tone);
			this._notesBass.moveOffset();
		}
	}

	/**
	 * On guitar fretboard click.
	 *
	 * @param   {Object}  data Data in object
	 */
	_onGuitar(data) {
		this._dom.h1Tone.textContent = data.tone.toString(true);
		this._keyboard.drawTone(data.tone);

		if (data.tone.octave >= Tone.middleC().octave) {
			this._notesTreble.drawTone(data.tone);
			this._notesTreble.moveOffset();
		}
		else {
			this._notesBass.drawTone(data.tone);
			this._notesBass.moveOffset();
		}
	}
};

export default Learn;
