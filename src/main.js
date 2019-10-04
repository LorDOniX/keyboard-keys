import Keyboard from "keyboard";
import Notes from "notes";

class Main {
	constructor() {
		this._info = document.querySelector("#info h1");
		this._keyboard = new Keyboard(document.getElementById("keyboard"), key => {
			this._notesTreble.redraw();
			this._notesBass.redraw();
			this._info.textContent = `${key.tone}${key.octave}`;

			if (key.octave >= 4) {
				this._notesTreble.drawNote(key.tone, key.octave);

				if (key.tone == "C" && key.octave == 4) {
					this._notesBass.drawNote(key.tone, key.octave);
				}
			}
			else {
				this._notesBass.drawNote(key.tone, key.octave);
			}
		});
		this._notesTreble = new Notes(document.getElementById("notesTreble"), false, data => {
			this._showTone(data.tone, data.octave, false, data.x);
		});
		this._notesBass = new Notes(document.getElementById("notesBass"), true, data => {
			this._showTone(data.tone, data.octave, true, data.x);
		});

		this._init();
	}

	async _init() {
		await this._notesTreble.load();
		await this._notesBass.load();
		this._toneControl();
	}

	_showTone(tone, octave, isBass, x) {
		this._keyboard.drawKey(tone, octave);

		if (isBass) {
			this._notesBass.drawNote(tone, octave, x);
		}
		else {
			this._notesTreble.drawNote(tone, octave, x);
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

				this._notesTreble.redraw();
				this._notesBass.redraw();
				this._showTone(tone, octave, octave < 4);
			}
		};
		btn.addEventListener("click", cb);
		input.addEventListener("keydown", e => {
			if (e.which == 13) cb();
		});
	}
};

new Main();
