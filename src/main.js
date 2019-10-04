import Keyboard from "keyboard";
import Notes from "notes";

class Main {
	constructor() {
		this._keyboard = new Keyboard(document.getElementById("keyboard"), key => {
			this._notesTreble.redraw();
			this._notesBass.redraw();

			console.log(`${key.tone}${key.octave}`)

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
			this._keyboard.drawKey(data.tone, data.octave);
			this._notesTreble.drawNote(data.tone, data.octave);
		});
		this._notesBass = new Notes(document.getElementById("notesBass"), true, data => {
			this._keyboard.drawKey(data.tone, data.octave);
			this._notesBass.drawNote(data.tone, data.octave);
		});

		this._init();
	}

	async _init() {
		await this._notesTreble.load();
		await this._notesBass.load();
	}
};

new Main();
