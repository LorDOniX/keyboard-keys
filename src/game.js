import Keyboard from "keyboard";
import Notes from "notes";
import { Note, NOTES_RANGE, KEYBOARD_RANGE } from "note";
import { KEYS_SIGNATURES, NOTES, KEYS_SIGNATURES_OBJ, C_DUR } from "conf";
import { domCreate } from "utils";

// game variables
const DATA = {
	notesCount: [25, 50, 75, 100],
	notesTime: [5, 10, 15, 20, 25, 30],
	notesType: ["Non sharp", "Sharp"],
	notesShow: ["Empty", "With tone"],
	sounds: ["With sound", "No sound"]
};

const GUESS_NEW_TONE_TIME = 5; // [s]
const LS_GAME_SETTINGS_KEY = "keyboardKeysGameSettings";

class Game {
	constructor() {
		this._dom = {};
		// build dom
		this._buildDom();
		// settings
		this._keyboard = new Keyboard(this._dom.keyboard, key => {
			this._onKey(key);
		});
		this._notesTreble = new Notes(this._dom.notesTreble, false, NOTES_RANGE);
		this._notesBass = new Notes(this._dom.notesBass, true, NOTES_RANGE);
		this._gameData = {
			time: 0,
			ind: 0,
			count: 0,
			correct: 0,
			wrong: 0,
			timerID: null,
			guessTimerID: null,
			notes: [],
			curNote: null
		};
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
	}

	/**
	 * Hide tab.
	 */
	hide() {
		if (this._gameData.timerID) {
			clearInterval(this._gameData.timerID);
			this._gameData.timerID = null;
		}

		if (this._gameData.guessTimerID) {
			clearInterval(this._gameData.guessTimerID);
			this._gameData.guessTimerID = null;
		}

		this._dom.infoPanel.textContent = "Info panel";
		this._dom.timeInfo.textContent = "";
	}

	/**
	 * Create elements.
	 */
	_buildDom() {
		let exportObj = {};

		domCreate({
			el: "div",
			class: ["tab", "game"],
			_export: "tab",
			child: [{
				el: "div",
				child: [{
					el: "h1",
					text: "Info panel",
					_export: "infoPanel"
				}, {
					el: "p",
					class: "time-info",
					_export: "timeInfo"
				}]
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
				class: "game-control",
				child: [{
					el: "span",
					class: "signatures",
					child: ["Key: ", {
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
					}]
				}, {
					el: "span",
					child: ["Start note", {
						el: "select",
						child: NOTES.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectStartNote"
					}]
				}, {
					el: "span",
					child: ["Start octave", {
						el: "select",
						child: this._generateValues(KEYBOARD_RANGE[0].octave, KEYBOARD_RANGE[1].octave - 1).map(i => {
							return {
								el: "option",
								value: i,
								text: i
							};
						}),
						_export: "selectStartOctave"
					}]
				}, {
					el: "span",
					child: ["End note", {
						el: "select",
						child: NOTES.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectEndNote"
					}]
				}, {
					el: "span",
					child: ["End octave", {
						el: "select",
						child: this._generateValues(KEYBOARD_RANGE[0].octave, KEYBOARD_RANGE[1].octave).map(i => {
							return {
								el: "option",
								value: i,
								text: i
							};
						}),
						_export: "selectEndOctave"
					}]
				}, {
					el: "span",
					child: ["Notes count", {
						el: "select",
						child: DATA.notesCount.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectNotesCount"
					}]
				}, {
					el: "span",
					child: ["Per note time", {
						el: "select",
						child: DATA.notesTime.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectNotesTime"
					}, "s"]
				}]
			}, {
				el: "div",
				class: "game-control",
				child: [{
					el: "span",
					child: ["Notes type", {
						el: "select",
						child: DATA.notesType.map((item, ind) => {
							return {
								el: "option",
								value: ind,
								text: item
							};
						}),
						_export: "selectNotesType"
					}]
				}, {
					el: "span",
					child: ["Notes show", {
						el: "select",
						child: DATA.notesShow.map((item, ind) => {
							return {
								el: "option",
								value: ind,
								text: item
							};
						}),
						_export: "selectNotesShow"
					}]
				}, {
					el: "span",
					child: ["Sound", {
						el: "select",
						child: DATA.sounds.map((item, ind) => {
							return {
								el: "option",
								value: ind,
								text: item
							};
						}),
						_export: "selectSound"
					}]
				}, {
					el: "span",
					child: {
						el: "button",
						text: "Easy mode",
						onclick: () => {
							let middleC = Note.middleC();

							this._dom.selectSignature.value = C_DUR;
							this._dom.selectNotesCount.value = DATA.notesCount[1];
							this._dom.selectNotesTime.value = DATA.notesTime[1];
							this._dom.selectNotesType.value = 0;
							this._dom.selectNotesShow.value = 1;
							this._dom.selectStartNote.value = middleC.note;
							this._dom.selectStartOctave.value = middleC.octave;
							this._dom.selectEndNote.value = middleC.note;
							this._dom.selectEndOctave.value = middleC.octave + 2;
						}
					}
				}, {
					el: "span",
					child: {
						el: "button",
						text: "Easy mode full",
						onclick: () => {
							let middleC = Note.middleC();

							this._dom.selectSignature.value = C_DUR;
							this._dom.selectNotesCount.value = DATA.notesCount[1];
							this._dom.selectNotesTime.value = DATA.notesTime[1];
							this._dom.selectNotesType.value = 0;
							this._dom.selectNotesShow.value = 1;
							this._dom.selectStartNote.value = middleC.note;
							this._dom.selectStartOctave.value = middleC.octave - 2;
							this._dom.selectEndNote.value = middleC.note;
							this._dom.selectEndOctave.value = middleC.octave + 2;
						}
					}
				}, {
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
			}, {
				el: "audio",
				_export: "audio",
				autoplay: false,
				loop: false
			}]
		}, exportObj);

		Object.assign(this._dom, exportObj);
		// default values
		let defValues = localStorage.getItem(LS_GAME_SETTINGS_KEY);

		if (defValues) {
			defValues = JSON.parse(defValues);
		}

		this._dom.selectSignature.value = defValues ? defValues.signature : C_DUR;
		this._dom.selectNotesCount.value = defValues ? defValues.notesCount : DATA.notesCount[1];
		this._dom.selectNotesTime.value = defValues ? defValues.notesTime : DATA.notesTime[0];
		this._dom.selectNotesType.value = defValues ? defValues.notesType : DATA.notesType.length - 1;
		this._dom.selectNotesShow.value = defValues ? defValues.notesShow : 0;
		this._dom.selectSound.value = defValues ? defValues.soundvalue : 1;
		this._dom.selectStartNote.value = defValues ? defValues.startNote : KEYBOARD_RANGE[0].note;
		this._dom.selectStartOctave.value = defValues ? defValues.startOctave : KEYBOARD_RANGE[0].octave;
		this._dom.selectEndNote.value = defValues ? defValues.endNote : KEYBOARD_RANGE[1].note;
		this._dom.selectEndOctave.value = defValues ? defValues.endOctave : KEYBOARD_RANGE[1].octave;
	}

	/**
	 * Game start.
	 */
	_startGame() {
		// reset
		this.show();
		// update local storage with options info
		localStorage.setItem(LS_GAME_SETTINGS_KEY, JSON.stringify({
			signature: this._dom.selectSignature.value,
			notesCount: this._dom.selectNotesCount.value,
			notesTime: this._dom.selectNotesTime.value,
			notesType: this._dom.selectNotesType.value,
			notesShow: this._dom.selectNotesShow.value,
			soundvalue: this._dom.selectSound.value,
			startNote: this._dom.selectStartNote.value,
			startOctave: this._dom.selectStartOctave.value,
			endNote: this._dom.selectEndNote.value,
			endOctave: this._dom.selectEndOctave.value
		}));

		if (this._gameData.guessTimerID) {
			clearInterval(this._gameData.guessTimerID);
			this._gameData.guessTimerID = null;
		}

		if (this._gameData.timerID) {
			clearInterval(this._gameData.timerID);
			this._gameData.timerID = null;
		}

		// generate notes
		let time = parseFloat(this._dom.selectNotesTime.value);
		let count = parseFloat(this._dom.selectNotesCount.value);
		let notes = this._generateNotes();

		if (!notes.length) {
			this._showInfo("Notes range results in empty list!", false);
			return;
		}

		let gameNotes = [];

		while (true) {
			let ind = Math.floor(Math.random() * (notes.length - 1));

			if (!gameNotes.length || (gameNotes.length && gameNotes[gameNotes.length - 1] != notes[ind])) {
				gameNotes.push(notes[ind]);
			}

			if (gameNotes.length == count) break;
		}

		this._gameData.ind = 0;
		this._gameData.count = count;
		this._gameData.time = time;
		this._gameData.correct = 0;
		this._gameData.wrong = 0;
		this._gameData.timerID = null;
		this._gameData.notes = gameNotes;
		this._gameData.curNote = null;

		this._gameCycle();
		this._showInfo("Game has started!");
	}

	/**
	 * Generate notes.
	 */
	_generateNotes() {
		// generate notes
		let note = this._dom.selectStartNote.value;
		let endNote = this._dom.selectEndNote.value;
		let octave = parseFloat(this._dom.selectStartOctave.value);
		let endOctave = parseFloat(this._dom.selectEndOctave.value);
		let isSharp = this._dom.selectNotesType.value == "1";

		return (new Note(note, octave)).generateNotes(new Note(endNote, endOctave), isSharp);
	}

	/**
	 * One game cycle.
	 */
	_gameCycle() {
		if (!this._gameData.notes.length) {
			this._showInfo("Finish");
			return;
		}

		let withNote = this._dom.selectNotesShow.value == 1;
		let note = this._gameData.notes.shift();
		
		if (note.octave < Note.middleC().octave) {
			this._notesBass.drawNote(note, {
				withNote
			});
		}
		else {
			this._notesTreble.drawNote(note, {
				withNote
			});
		}

		this._gameData.curNote = note;
		this._gameData.ind++;

		let curTime = this._gameData.time - 1;

		this._dom.timeInfo.textContent = `${this._gameData.time} s`;

		this._gameData.timerID = setInterval(() => {
			this._dom.timeInfo.textContent = `${curTime} s`;

			if (curTime === 0) {
				clearInterval(this._gameData.timerID);
				this._gameData.timerID = null;
				// error, note was not found
				this._gameData.wrong++;
				this._showInfo(`Note ${this._gameData.curNote.toString()} was not set!`, false);
				this._keyboard.drawNote(this._gameData.curNote);
				this._guessNewNote();
				return;
			}

			curTime--;
		}, 1000);
	}

	/**
	 * Guess a new note.
	 */
	_guessNewNote() {
		let curTime = GUESS_NEW_TONE_TIME - 1;

		this._dom.timeInfo.textContent = `${GUESS_NEW_TONE_TIME} s`;

		// wait a while for the next note
		this._gameData.guessTimerID = setInterval(() => {
			this._dom.timeInfo.textContent = `${curTime} s`;

			if (curTime === 0) {
				clearInterval(this._gameData.guessTimerID);
				this._gameData.guessTimerID = null;
				this._notesTreble.redraw();
				this._notesBass.redraw();
				this._keyboard.redraw();
				this._showInfo("Guess a new note");
				this._gameCycle();
				return;
			}

			curTime--;
		}, 1000);
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

			if (this._dom.selectSound.value == "0") {
				this._dom.audio.src = state ? "/sounds/success.mp3" : "/sounds/wrong.mp3";
				this._dom.audio.loop = false;
				this._dom.audio.volume = state ? 0.1 : 0.05;
				this._dom.audio.play();
			}
		}

		this._dom.infoPanel.textContent = `${msg} - order ${this._gameData.ind}/${this._gameData.count} correct ${this._gameData.correct} wrong ${this._gameData.wrong}`;
	}

	/**
	 * Generate empty array with values from start to end.
	 *
	 * @param   {Number}  start Start value
	 * @param   {Number}  end End value
	 * @return  {Array}
	 */
	_generateValues(start, end) {
		let values = [];

		for (let i = start; i <= end; i++) {
			values.push(i);
		}

		return values;
	}

	/**
	 * On keyboard key.
	 *
	 * @param   {Object}  key Key data
	 */
	_onKey(key) {
		if (!this._gameData.curNote || this._gameData.guessTimerID) return;

		let signatureKey = this._dom.selectSignature.value;
		let signature = KEYS_SIGNATURES_OBJ[signatureKey];
		let tts = this._gameData.curNote.toSignature(signature);

		if (key.note.equal(tts)) {
			this._gameData.correct++;
			this._showInfo(`Success, note was ${tts.toString()}`, true);
			clearInterval(this._gameData.timerID);
			this._gameData.timerID = null;
			this._guessNewNote();
		}
		else {
			this._gameData.wrong++;
			this._showInfo("Wrong, the note is incorrect!", false);
		}
	}
};

export default Game;
