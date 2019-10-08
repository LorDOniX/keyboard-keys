import Keyboard from "keyboard";
import Notes from "notes";
import Chords from "chords";
import { KEYS_SIGNATURES, NOTES_INC_RANGE } from "conf";
import { domCreate } from "utils";

class Learn {
	constructor() {
		this._dom = {};
		// build dom
		this._buildDom();
		// nastaveni
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
	}

	get container() {
		return this._dom.tab;
	}

	show() {
		this._keyboard.syncPort();
		this._notesTreble.syncPort();
		this._notesBass.syncPort();
		this._keyboard.redraw();
		this._notesTreble.resetOffset();
		this._notesTreble.redraw();
		this._notesBass.resetOffset();
		this._notesBass.redraw();
	}

	hide() {
		this._dom.h1Tone.textContent = "";
	}

	async load() {
		await this._notesTreble.load();
		await this._notesBass.load();
	}

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
					child: {
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
						}
					}
				}, {
					el: "chords",
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
						el: "button",
						class: "show",
						text: "Show signature",
						onclick: () => {
							let value = KEYS_SIGNATURES.filter(i => i.name == this._dom.selectSignature.value);

							if (value.length) {
								let item = value[0];
								this._dom.signatureInfo.textContent = item.tones.join(", ");
								this._keyboard.drawKeys(item.tones.map(i => {
									return {
										tone: i,
										octave: 4
									};
								}));
							}
						}
					}, {
						el: "span",
						class: "info",
						_export: "signatureInfo"
					}]
				}
			}]
		}, exportObj);

		Object.assign(this._dom, exportObj);
		this._dom.selectSignature.value = KEYS_SIGNATURES.filter(i => i.key == "#" && i.count == 0)[0].name;
	}

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
		this._dom.h1Tone.textContent = name + ": " + tones.map(i => `${i.tone}${i.octave}`).join(", ");
	}

	_showTone(tone, octave, isBass, x) {
		this._keyboard.drawKey(tone, octave);

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
};

export default Learn;
