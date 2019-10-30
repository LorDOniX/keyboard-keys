import Keyboard from "keyboard";
import { Note } from "note";
import { domCreate } from "utils";

// timeout [ms]
const TIMEOUT = 5000;

class GameNames {
	constructor() {
		this._dom = {};
		// build dom
		this._buildDom();
		// settings
		this._currentNote = "";
		this._timeoutId = null;
		this._guessTimeoutID = null;
		this._keyboard = new Keyboard(this._dom.keyboard, key => {
			this._onKey(key);
		});
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
	}

	/**
	 * Hide tab.
	 */
	hide() {
		if (this._timeoutId) {
			clearInterval(this._timeoutId);
			this._timeoutId = null;
		}

		if (this._guessTimeoutID) {
			clearInterval(this._guessTimeoutID);
			this._guessTimeoutID = null;
		}

		this._showInfo("Info panel");
	}

	/**
	 * Create elements.
	 */
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

	/**
	 * Game start.
	 */
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

	/**
	 * One game cycle.
	 */
	_gameCycle() {
		let newNote = this._currentNote.simple;
		
		while (newNote == this._currentNote.simple) {
			newNote = Note.random();
		}

		this._currentNote = newNote;
		this._showInfo(`Find note ${this._currentNote.simple}`);
		this._timeoutId = setTimeout(() => {
			this._timeoutId = null;
			// error, note was not found
			this._showInfo(`Note ${this._currentNote.simple} was not found!`, false);
			this._guessNewNote();
		}, TIMEOUT);
	}

	/**
	 * Guess a new note.
	 */
	_guessNewNote() {
		// wait a while for the next note
		this._guessTimeoutID = setTimeout(() => {
			this._guessTimeoutID = null;
			this._keyboard.redraw();
			this._showInfo("Guess a new note");
			this._gameCycle();
		}, TIMEOUT);
	}

	/**
	 * Show info status.
	 *
	 * @param   {String}  msg  Message
	 * @param   {Boolean}  [state] State ok/error
	 */
	_showInfo(msg = "", state) {
		this._dom.infoPanel.classList.remove("correct");
		this._dom.infoPanel.classList.remove("wrong");

		if (typeof state === "boolean") {
			this._dom.infoPanel.classList.add(state ? "correct" : "wrong");
		}

		this._dom.infoPanel.textContent = msg;
	}

	/**
	 * On keyboard key.
	 *
	 * @param   {Object}  key Key data
	 */
	_onKey(key) {
		if (!this._timeoutId) return;

		if (key.note.simple == this._currentNote.simple) {
			// correct
			this._showInfo(`Success, note was ${key.note.simple}`, true);
			clearTimeout(this._timeoutId);
			this._timeoutId = null;
			this._guessNewNote();
		}
		else {
			this._showInfo("Wrong, the note is incorrect!", false);
		}
	}
};

export default GameNames;
