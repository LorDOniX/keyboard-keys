import Keyboard from "keyboard";
import Notes from "notes";
import { NOTES_RANGE, KEYS_SIGNATURES, TONES, ALL_TONES_SHARP, KEYS_SIGNATURES_OBJ, C_DUR, FLAT_TO_SHARP_MAPPING } from "conf";
import { domCreate } from "utils";

const DATA = {
	trebleRange: ["C6", "C7", "C8"],
	bassRange: ["C2", "C1"],
	notesRange: ["Only treble", "Only bass", "Full"],
	notesCount: [25, 50, 75, 100],
	notesTime: [5, 10, 15, 20, 25, 30],
	notesType: ["Non sharp", "Sharp"],
	notesShow: ["Empty", "With tone"],
	sounds: ["With sound", "No sound"]
};

const GUESS_NEW_NOTE_TIME = 5;

class Game {
	constructor() {
		this._dom = {};
		// build dom
		this._buildDom();
		// settings
		this._keyboard = new Keyboard(this._dom.keyboard, key => {
			if (!this._gameData.curNote || this._gameData.guessTimerID) return;

			let tone = key.tone;
			let octave = key.octave;
			let isSharp = false;
			let toneTxt = `${tone}${octave}`;

			if (Array.isArray(key.tone)) {
				tone = key.tone[0].replace("#", "");
				isSharp = true;
				toneTxt = `${key.tone[0]}${octave}, ${key.tone[1]}${octave}`;
			}

			let signatureKey = this._dom.selectSignature.value;
			let signature = KEYS_SIGNATURES_OBJ[signatureKey];

			if (signature.key == "#" && signature.count > 0) {
				let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
				let ind = cDur.tones.indexOf(tone);
				let sigTone = signature.tones[ind];

				if (sigTone != tone) {
					isSharp = true;
				}
			}
			else if (signature.key == "b" && signature.count > 0) {
				// b, Cb => B a octave--
				let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
				let ind = cDur.tones.indexOf(tone);
				let sigTone = signature.tones[ind];

				if (sigTone != tone) {
					tone = FLAT_TO_SHARP_MAPPING[sigTone];

					if (sigTone == "Cb") octave--;
					if (tone.indexOf("#") != -1) {
						tone = tone.replace("#", "");
						isSharp = true;
					}
				}
			}

			if (tone == this._gameData.curNote.tone && octave == this._gameData.curNote.octave && isSharp == this._gameData.curNote.isSharp) {
				this._gameData.correct++;
				this._showInfo(`Success, tone was ${toneTxt}`, true);
				clearInterval(this._gameData.timerID);
				this._gameData.timerID = null;
				this._guessNewNote();
			}
			else {
				this._gameData.wrong++;
				this._showInfo("Wrong, the note is incorrect!", false);
			}
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
		this._keyboard.syncPort();
		this._notesTreble.syncPort();
		this._notesBass.syncPort();
		this._keyboard.redraw();
		this._notesTreble.resetOffset();
		this._notesTreble.redraw();
		this._notesBass.resetOffset();
		this._notesBass.redraw();
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
					child: ["Treble range", {
						el: "select",
						child: DATA.trebleRange.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectTrebleRange"
					}]
				}, {
					el: "span",
					child: ["Bass range", {
						el: "select",
						child: DATA.bassRange.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectBassRange"
					}]
				}, {
					el: "span",
					child: ["Notes range", {
						el: "select",
						child: DATA.notesRange.map((item, ind) => {
							return {
								el: "option",
								value: ind,
								text: item
							};
						}),
						_export: "selectNotesRange"
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
							this._dom.selectTrebleRange.value = DATA.trebleRange[0];
							this._dom.selectBassRange.value = DATA.bassRange[0];
							this._dom.selectNotesRange.value = 0;
							this._dom.selectNotesCount.value = DATA.notesCount[1];
							this._dom.selectNotesTime.value = DATA.notesTime[1];
							this._dom.selectNotesType.value = 0;
							this._dom.selectNotesShow.value = 1;
						}
					}
				}, {
					el: "span",
					child: {
						el: "button",
						text: "Easy mode full",
						onclick: () => {
							this._dom.selectTrebleRange.value = DATA.trebleRange[0];
							this._dom.selectBassRange.value = DATA.bassRange[0];
							this._dom.selectNotesRange.value = 2;
							this._dom.selectNotesCount.value = DATA.notesCount[1];
							this._dom.selectNotesTime.value = DATA.notesTime[1];
							this._dom.selectNotesType.value = 0;
							this._dom.selectNotesShow.value = 1;
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
		this._dom.selectSignature.value = C_DUR;
		this._dom.selectTrebleRange.value = DATA.trebleRange[DATA.trebleRange.length - 1];
		this._dom.selectBassRange.value = DATA.bassRange[DATA.bassRange.length - 1];
		this._dom.selectNotesRange.value = DATA.notesRange.length - 1;
		this._dom.selectNotesCount.value = DATA.notesCount[1];
		this._dom.selectNotesTime.value = DATA.notesTime[0];
		this._dom.selectNotesType.value = DATA.notesType.length - 1;
		this._dom.selectNotesShow.value = 0;
		this._dom.selectSound.value = 1;
	}

	/**
	 * Game start.
	 */
	_startGame() {
		// reset
		this.show();

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
		let value = this._dom.selectNotesRange.value;
		let trebleTone = this._dom.selectTrebleRange.value;
		let bassTone = this._dom.selectBassRange.value;
		let isSharp = this._dom.selectNotesType.value == "1";
		let middleC = "C4";
		let range = [];

		// only treble
		if (value == "0") {
			range.push(middleC, trebleTone);
		}
		// only bass
		else if (value == "1") {
			range.push(bassTone, middleC);
		}
		// full
		else {
			range.push(bassTone, trebleTone);
		}

		let startOctave = parseFloat(range[0].match(/[0-9]/)[0]);
		let endOctave = parseFloat(range[1].match(/[0-9]/)[0]);
		let allNotes = [];

		for (let i = startOctave; i < endOctave; i++) {
			let source = isSharp ? ALL_TONES_SHARP : TONES;
			allNotes = allNotes.concat(source.map(tone => {
				return {
					tone,
					octave: i
				}
			}));
		}

		allNotes.push({
			tone: "C",
			octave: endOctave
		});

		return allNotes;
	}

	/**
	 * One game cycle.
	 */
	_gameCycle() {
		// note
		if (!this._gameData.notes.length) {
			this._showInfo("Finish");
			console.log(this._gameData);
			return;
		}

		let withTone = this._dom.selectNotesShow.value == 1;
		let note = this._gameData.notes.shift();
		let tone = note.tone;
		let isSharp = false;

		if (tone.indexOf("#") != -1) {
			tone = tone.replace("#", "");
			isSharp = true;
		}

		this._notesTreble.redraw();
		this._notesBass.redraw();
		
		if (note.octave < 4) {
			this._notesBass.drawNote(tone, note.octave, {
				isSharp,
				withTone
			});
		}
		else {
			this._notesTreble.drawNote(tone, note.octave, {
				isSharp,
				withTone
			});
		}

		// info
		//this._dom.allNotes.textContent = this._gameData.notes.map(i => `${i.tone}${i.octave}`).join(", ");

		this._gameData.curNote = {
			tone,
			origTone: note.tone,
			octave: note.octave,
			isSharp
		};
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
				this._showInfo(`Note ${this._gameData.curNote.tone}${this._gameData.curNote.octave} was not set!`, false);
				this._keyboard.drawKey(this._gameData.curNote.origTone , this._gameData.curNote.octave);
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
		let curTime = GUESS_NEW_NOTE_TIME - 1;

		this._dom.timeInfo.textContent = `${GUESS_NEW_NOTE_TIME} s`;

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
};

export default Game;
