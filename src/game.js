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

const TIMEOUT_BETWEEN = 5000;

class Game {
	constructor() {
		this._dom = {};
		// build dom
		this._buildDom();
		// nastaveni
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
				// spravne
				this._gameData.correct++;
				this._showInfo(`Success, tone was ${toneTxt}`, true);
				clearTimeout(this._gameData.timerID);
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
	}

	async load() {
		await this._notesTreble.load();
		await this._notesBass.load();
	}

	_buildDom() {
		let exportObj = {};

		domCreate({
			el: "div",
			class: ["tab", "game"],
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
		// defaultni hodnoty
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

	_startGame() {
		// reset
		this.show();

		if (this._gameData.guessTimerID) {
			clearTimeout(this._gameData.guessTimerID);
			this._gameData.guessTimerID = null;
		}

		if (this._gameData.timerID) {
			clearTimeout(this._gameData.timerID);
			this._gameData.timerID = null;
		}

		// nagenerujeme noty
		let time = parseFloat(this._dom.selectNotesTime.value);
		let count = parseFloat(this._dom.selectNotesCount.value);
		let notes = this._generateNotes();
		let gameNotes = [];

		for (let i = 0; i < count; i++) {
			let ind = Math.floor(Math.random() * (notes.length - 1));
			gameNotes.push(notes[ind]);
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

	_generateNotes() {
		// nagenerujeme noty
		let value = this._dom.selectNotesRange.value;
		let trebleTone = this._dom.selectTrebleRange.value;
		let bassTone = this._dom.selectBassRange.value;
		let isSharp = this._dom.selectNotesType.value == "1";
		let middleC = "C4";
		let range = [];

		// pouze treble
		if (value == "0") {
			range.push(middleC, trebleTone);
		}
		// pouze bass
		else if (value == "1") {
			range.push(bassTone, middleC);
		}
		// plny
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

	_gameCycle() {
		// nota
		if (!this._gameData.notes.length) {
			this._showInfo("Finish");
			console.log(this._gameData);
			return;
		}

		let withTone = this._dom.selectNotesShow.value == 1;
		let note = this._gameData.notes.shift();
		let isSharp = false;

		if (note.tone.indexOf("#") != -1) {
			note.tone = note.tone.replace("#", "");
			isSharp = true;
		}

		this._notesTreble.redraw();
		this._notesBass.redraw();
		
		if (note.octave < 4) {
			this._notesBass.drawNote(note.tone, note.octave, {
				isSharp,
				withTone
			});
		}
		else {
			this._notesTreble.drawNote(note.tone, note.octave, {
				isSharp,
				withTone
			});
		}

		this._gameData.curNote = {
			tone: note.tone,
			octave: note.octave,
			isSharp
		};
		this._gameData.ind++;
		this._gameData.timerID = setTimeout(() => {
			this._gameData.timerID = null;
			// chyba, nebyla poresena v casovem limitu
			this._gameData.wrong++;
			this._showInfo(`Note ${this._gameData.curNote.tone}${this._gameData.curNote.octave} was not set!`, false);
			this._guessNewNote();
		}, this._gameData.time * 1000);
	}

	_guessNewNote() {
		// chvilku pockame na dalsi notu
		this._gameData.guessTimerID = setTimeout(() => {
			this._gameData.guessTimerID = null;
			this._notesTreble.redraw();
			this._notesBass.redraw();
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
