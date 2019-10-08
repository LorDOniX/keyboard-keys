import Keyboard from "keyboard";
import { TONES } from "conf";
import { domCreate } from "utils";

const TIMEOUT = 5000;
const TIMEOUT_BETWEEN = 5000;

class GameNames {
	constructor() {
		this._dom = {};
		// build dom
		this._buildDom();
		// nastaveni
		this._currentTone = "";
		this._timeoutId = null;
		this._guessTimeoutID = null;
		this._keyboard = new Keyboard(this._dom.keyboard, key => {
			if (!this._timeoutId) return;

			let tone = key.tone;

			if (Array.isArray(key.tone)) {
				tone = key.tone[0].replace("#", "");
			}

			if (tone == this._currentTone) {
				// spravne
				this._showInfo(`Success, tone was ${tone}`, true);
				clearTimeout(this._timeoutId);
				this._timeoutId = null;
				this._guessNewNote();
			}
			else {
				this._showInfo("Wrong, the tone is incorrect!", false);
			}
		});
	}

	get container() {
		return this._dom.tab;
	}

	show() {
		this._keyboard.syncPort();
		this._keyboard.redraw();
	}

	hide() {
		if (this._timeoutId) {
			clearInterval(this._timeoutId);
			this._timeoutId = null;
		}

		if (this._guessTimeoutID) {
			clearInterval(this._guessTimeoutID);
			this._guessTimeoutID = null;
		}
	}

	async load() {
	}

	_buildDom() {
		let exportObj = {};

		domCreate({
			el: "div",
			class: ["tab", "game-names"],
			_export: "tab",
			child: [{
				el: "div",
				child: {
					el: "h1",
					text: "Info panel",
					_export: "infoPanel"
				}
			}, {
				el: "div",
				id: "keyboard",
				_export: "keyboard"
			}, {
				el: "div",
				class: "game-control",
				child: [{
					el: "span",
					child: {
						el: "button",
						text: "Start",
						onclick: () => {
							this._startGame();
						},
						_export: "btnStart"
					}
				}]
			}]
		}, exportObj);

		Object.assign(this._dom, exportObj);
	}

	_startGame() {
		// reset
		this.show();

		if (this._timeoutId) {
			clearTimeout(this._timeoutId);
			this._timeoutId = null;
		}

		if (this._guessTimeoutID) {
			clearInterval(this._guessTimeoutID);
			this._guessTimeoutID = null;
		}

		this._showInfo("Game has started!");
		this._gameCycle();
	}

	_gameCycle() {
		let newTone = this._currentTone;
		
		while (newTone == this._currentTone) {
			let ind = Math.floor(Math.random() * (TONES.length - 1));

			newTone = TONES[ind];
		}

		this._currentTone = newTone;
		this._showInfo(`Find tone ${this._currentTone}`);
		this._timeoutId = setTimeout(() => {
			this._timeoutId = null;
			// chyba, nebyla poresena v casovem limitu
			this._showInfo(`Tone ${this._currentTone} was not found!`, false);
			this._guessNewNote();
		}, TIMEOUT);
	}

	_guessNewNote() {
		// chvilku pockame na dalsi notu
		this._guessTimeoutID = setTimeout(() => {
			this._guessTimeoutID = null;
			this._keyboard.redraw();
			this._showInfo("Guess a new note");
			this._gameCycle();
		}, TIMEOUT_BETWEEN);
	}

	_showInfo(msg = "", state) {
		this._dom.infoPanel.classList.remove("correct");
		this._dom.infoPanel.classList.remove("wrong");

		if (typeof state === "boolean") {
			this._dom.infoPanel.classList.add(state ? "correct" : "wrong");
		}

		this._dom.infoPanel.textContent = msg;
	}
};

export default GameNames;
