import Keyboard from "keyboard";
import Notes from "notes";
import Chords from "chords";
import Guitar from "guitar";
import { KEYS_SIGNATURES, NOTES_INC_RANGE, BETWEEN_NOTES_TREBLE, BETWEEN_NOTES_BASS, ON_LINE_NOTES_TREBLE, ON_LINE_NOTES_BASS, GUITAR_TUNES, FLAT_TO_SHARP_MAPPING } from "conf";
import { domCreate } from "utils";
import { OCTAVES, MIDDLE_C } from "./conf";

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
			let tone = key.tone;
			let octave = key.octave;
			let isSharp = false;
			let toneTxt = `${tone}${octave}`;

			if (Array.isArray(key.tone)) {
				tone = key.tone[0].replace("#", "");
				isSharp = true;
				toneTxt = `${key.tone[0]}${octave}, ${key.tone[1]}${octave}`;
			}

			this._dom.h1Tone.textContent = toneTxt;
			this._guitar.drawNote(tone, octave, isSharp);

			if (octave >= 4) {
				this._notesTreble.drawNote(tone, octave, {
					isSharp
				});
				this._notesTreble.moveOffset();

				if (tone == "C" && octave == 4 && !Array.isArray(key.tone)) {
					this._notesBass.drawNote(tone, octave);
					this._notesBass.moveOffset();
				}
			}
			else {
				this._notesBass.drawNote(tone, octave, {
					isSharp
				});
				this._notesBass.moveOffset();
			}
		});
		this._notesTreble = new Notes(this._dom.notesTreble, false, NOTES_INC_RANGE, data => {
			this._showTone(data.tone, data.octave, false, false/*, data.x*/);
		});
		this._notesBass = new Notes(this._dom.notesBass, true, NOTES_INC_RANGE, data => {
			this._showTone(data.tone, data.octave, true, false/*, data.x*/);
		});
		this._chords = new Chords(this, this._dom.selectOctave, this._dom.selectKey, this._dom.selectNote, this._dom.btnShowChord);
		this._guitar = new Guitar(this._dom.guitar, data => {
			let isSharp = data.tone.indexOf("#") != -1;
			let tone = isSharp ? data.tone.replace("#", "") : data.tone;

			this._keyboard.drawKey(data.tone, data.octave);

			if (data.octave >= 4) {
				this._notesTreble.drawNote(tone, data.octave, {
					isSharp
				});
				this._notesTreble.moveOffset();
			}
			else {
				this._notesBass.drawNote(tone, data.octave, {
					isSharp
				});
				this._notesBass.moveOffset();
			}
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
		this._keyboard.syncPort();
		this._notesTreble.syncPort();
		this._notesBass.syncPort();
		this._keyboard.redraw();
		this._notesTreble.resetOffset();
		this._notesTreble.redraw();
		this._notesBass.resetOffset();
		this._notesBass.redraw();
		this._guitar.syncPort();
		this._guitar.redraw();
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
				let items = [];
				allMatches.forEach(item => {
					let m = item.match(/([CDEFGAB][#b]?)([0-7])/);

					if (m) {
						let tone = m[1];
						let octave = parseFloat(m[2]);

						items.push({
							tone,
							octave
						});
					}
				});

				if (items.length) {
					this.showChord("Custom", items);
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
							let tone = "C";
							let octave = 4;

							this._dom.h1Tone.textContent = `${tone}${octave}`;
							this._keyboard.drawKey(tone, octave);
							this._notesTreble.drawNote(tone, octave);
							this._notesTreble.moveOffset();
							this._notesBass.drawNote(tone, octave);
							this._notesBass.moveOffset();
							this._guitar.drawNote(tone, octave);
						}
					}, {
						el: "button",
						class: "c4",
						text: "Between notes",
						onclick: () => {
							this._dom.h1Tone.textContent = `Between notes`;

							let allNotes = [].concat(BETWEEN_NOTES_TREBLE, BETWEEN_NOTES_BASS);

							this._keyboard.drawKeys(allNotes);
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
							this._dom.h1Tone.textContent = `On lines`;

							let allNotes = [].concat(ON_LINE_NOTES_TREBLE, ON_LINE_NOTES_BASS);

							this._keyboard.drawKeys(allNotes);
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
							let value = KEYS_SIGNATURES.filter(i => i.name == this._dom.selectSignature.value);

							if (value.length) {
								let item = value[0];
								this._dom.signatureInfo.textContent = item.tones.join(", ");
								let tones = item.tones.map(i => {
									let tone = {
										tone: i,
										octave: parseFloat(this._dom.selectSignatureOctave.value)
									};

									if (item.key == "b") {
										if (tone.tone.indexOf("b") != -1) {
											let newTone = FLAT_TO_SHARP_MAPPING[tone.tone];
											let newOctave = tone.tone == "Cb" ? tone.octave - 1 : tone.octave;

											tone.tone = newTone;
											tone.octave = newOctave;
										}
									}

									return tone;
								});

								this._keyboard.drawKeys(tones);
								this._guitar.drawNotes(tones);
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
		this._dom.selectSignatureOctave.value = MIDDLE_C.octave;
	}

	/**
	 * Show chord.
	 *
	 * @param   {String}  name Message to show
	 * @param   {Array}  tones array of { tone, octave... }
	 */
	showChord(name, tones) {
		if (!Array.isArray(tones) || !tones.length) return;

		if (tones[0].octave < 4) {
			this._notesBass.drawNotes(tones);
			this._notesBass.moveOffset();
		}
		else {
			this._notesTreble.drawNotes(tones);
			this._notesTreble.moveOffset();
		}

		this._keyboard.drawKeys(tones);
		this._guitar.drawNotes(tones);
		this._dom.h1Tone.textContent = name + ": " + tones.map(i => `${i.tone}${i.octave}`).join(", ");
	}

	/**
	 * Show tone.
	 *
	 *@param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 * @param   {Boolean}  isBass Is bass range?
	 * @param   {Number}  x Own x position
	 */
	_showTone(tone, octave, isBass, x) {
		this._keyboard.drawKey(tone, octave);
		this._guitar.drawNote(tone, octave);

		if (isBass) {
			this._notesBass.drawNote(tone, octave, {
				isSharp: false,
				x
			});
			this._notesBass.moveOffset();
		}
		else {
			this._notesTreble.drawNote(tone, octave, {
				isSharp: false,
				x
			});
			this._notesTreble.moveOffset();
		}

		this._dom.h1Tone.textContent = `${tone}${octave}`;
	}

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

	_setGuitarTune(key) {
		let item = GUITAR_TUNES.filter(i => i.key == key);

		if (item.length) {
			item = item[0];
			this._dom.guitarTuneInfo.textContent = `${item.key}: ${item.config.join("")}`;
			this._guitar.setTune(item.config);
		}
	}
};

export default Learn;
