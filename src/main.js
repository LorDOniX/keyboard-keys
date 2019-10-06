import Keyboard from "keyboard";
import Notes from "notes";
import Chords from "./chords";

class Main {
	constructor() {
		this._info = document.querySelector("#info h1");
		this._keyboard = new Keyboard(document.getElementById("keyboard"), key => {
			let tone = key.tone;
			let octave = key.octave;
			let isSharp = false;
			let toneTxt = `${tone}${octave}`;

			if (Array.isArray(key.tone)) {
				tone = key.tone[0].replace("#", "");
				isSharp = true;
				toneTxt = `${key.tone[0]}${octave}, ${key.tone[1]}${octave}`;
			}

			this._info.textContent = toneTxt;

			if (octave >= 4) {
				this._notesTreble.drawNote(tone, octave, isSharp);
				this._notesTreble.moveOffset();

				if (tone == "C" && octave == 4 && !Array.isArray(key.tone)) {
					this._notesBass.drawNote(tone, octave);
					this._notesBass.moveOffset();
				}
			}
			else {
				this._notesBass.drawNote(tone, octave, isSharp);
				this._notesBass.moveOffset();
			}
		});
		this._notesTreble = new Notes(document.getElementById("notesTreble"), false, data => {
			this._showTone(data.tone, data.octave, false, false/*, data.x*/);
		});
		this._notesBass = new Notes(document.getElementById("notesBass"), true, data => {
			this._showTone(data.tone, data.octave, true, false/*, data.x*/);
		});
		this._chords = new Chords(this, document.querySelector("#control .chords select.octave"), document.querySelector("#control .chords select.key"), 
								document.querySelector("#control .chords select.note"), document.querySelector("#control .chords button.show"));

		this._init();
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
		this._info.textContent = name + ": " + tones.map(i => `${i.tone}${i.octave}`).join(", ");
	}

	async _init() {
		await this._notesTreble.load();
		await this._notesBass.load();
		this._toneControl();
		this._buttons();
	}

	_showTone(tone, octave, isBass, x) {
		this._keyboard.drawKey(tone, octave);

		if (isBass) {
			this._notesBass.drawNote(tone, octave, false, x);
			this._notesBass.moveOffset();
		}
		else {
			this._notesTreble.drawNote(tone, octave, false, x);
			this._notesTreble.moveOffset();
		}

		this._info.textContent = `${tone}${octave}`;
	}

	_toneControl() {
		let btn = document.querySelector(".tone-control button");
		let input = document.querySelector(".tone-control input");
		let cb = () => {
			let value = input.value.trim().toUpperCase();
			let m = value.match(/([CDEFGAB][#b]?)([0-7])/);

			if (m) {
				let tone = m[1];
				let octave = parseFloat(m[2]);

				this._showTone(tone, octave, octave < 4);
			}
		};
		btn.addEventListener("click", cb);
		input.addEventListener("keydown", e => {
			if (e.which == 13) cb();
		});
	}

	_buttons() {
		document.querySelector(".buttons .c4").addEventListener("click", e => {
			let tone = "C";
			let octave = 4;

			this._info.textContent = `${tone}${octave}`;
			this._keyboard.drawKey(tone, octave);
			this._notesTreble.drawNote(tone, octave);
			this._notesTreble.moveOffset();
			this._notesBass.drawNote(tone, octave);
			this._notesBass.moveOffset();
		});
	}
};

new Main();
