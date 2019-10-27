import Keyboard from "keyboard";
import Notes from "notes";
import Tone from "tone";
import { NOTES_RANGE, KEYS_SIGNATURES, TONES, KEYS_SIGNATURES_OBJ, C_DUR, KEYBOARD_RANGE } from "conf";
import { domCreate, toneToSignature, generateTones } from "utils";

// game variables
const DATA = {
	tonesCount: [25, 50, 75, 100],
	tonesTime: [5, 10, 15, 20, 25, 30],
	tonesType: ["Non sharp", "Sharp"],
	tonesShow: ["Empty", "With tone"],
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
			tones: [],
			curTone: null
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
					child: ["Start tone", {
						el: "select",
						child: TONES.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectStartTone"
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
					child: ["End tone", {
						el: "select",
						child: TONES.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectEndTone"
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
					child: ["Tones count", {
						el: "select",
						child: DATA.tonesCount.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectTonesCount"
					}]
				}, {
					el: "span",
					child: ["Per tone time", {
						el: "select",
						child: DATA.tonesTime.map(item => {
							return {
								el: "option",
								value: item,
								text: item
							};
						}),
						_export: "selectTonesTime"
					}, "s"]
				}]
			}, {
				el: "div",
				class: "game-control",
				child: [{
					el: "span",
					child: ["Tones type", {
						el: "select",
						child: DATA.tonesType.map((item, ind) => {
							return {
								el: "option",
								value: ind,
								text: item
							};
						}),
						_export: "selectTonesType"
					}]
				}, {
					el: "span",
					child: ["Tones show", {
						el: "select",
						child: DATA.tonesShow.map((item, ind) => {
							return {
								el: "option",
								value: ind,
								text: item
							};
						}),
						_export: "selectTonesShow"
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
							let middleC = Tone.middleC();

							this._dom.selectSignature.value = C_DUR;
							this._dom.selectTonesCount.value = DATA.tonesCount[1];
							this._dom.selectTonesTime.value = DATA.tonesTime[1];
							this._dom.selectTonesType.value = 0;
							this._dom.selectTonesShow.value = 1;
							this._dom.selectStartTone.value = middleC.tone;
							this._dom.selectStartOctave.value = middleC.octave;
							this._dom.selectEndTone.value = middleC.tone;
							this._dom.selectEndOctave.value = middleC.octave + 2;
						}
					}
				}, {
					el: "span",
					child: {
						el: "button",
						text: "Easy mode full",
						onclick: () => {
							let middleC = Tone.middleC();

							this._dom.selectSignature.value = C_DUR;
							this._dom.selectTonesCount.value = DATA.tonesCount[1];
							this._dom.selectTonesTime.value = DATA.tonesTime[1];
							this._dom.selectTonesType.value = 0;
							this._dom.selectTonesShow.value = 1;
							this._dom.selectStartTone.value = middleC.tone;
							this._dom.selectStartOctave.value = middleC.octave - 2;
							this._dom.selectEndTone.value = middleC.tone;
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
		this._dom.selectTonesCount.value = defValues ? defValues.tonesCount : DATA.tonesCount[1];
		this._dom.selectTonesTime.value = defValues ? defValues.tonesTime : DATA.tonesTime[0];
		this._dom.selectTonesType.value = defValues ? defValues.tonesType : DATA.tonesType.length - 1;
		this._dom.selectTonesShow.value = defValues ? defValues.tonesShow : 0;
		this._dom.selectSound.value = defValues ? defValues.soundvalue : 1;
		this._dom.selectStartTone.value = defValues ? defValues.startTone : KEYBOARD_RANGE[0].tone;
		this._dom.selectStartOctave.value = defValues ? defValues.startOctave : KEYBOARD_RANGE[0].octave;
		this._dom.selectEndTone.value = defValues ? defValues.endTone : KEYBOARD_RANGE[1].tone;
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
			tonesCount: this._dom.selectTonesCount.value,
			tonesTime: this._dom.selectTonesTime.value,
			tonesType: this._dom.selectTonesType.value,
			tonesShow: this._dom.selectTonesShow.value,
			soundvalue: this._dom.selectSound.value,
			startTone: this._dom.selectStartTone.value,
			startOctave: this._dom.selectStartOctave.value,
			endTone: this._dom.selectEndTone.value,
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

		// generate tones
		let time = parseFloat(this._dom.selectTonesTime.value);
		let count = parseFloat(this._dom.selectTonesCount.value);
		let tones = this._generateTones();

		if (!tones.length) {
			this._showInfo("Tones range results in empty list!", false);
			return;
		}

		let gameTones = [];

		while (true) {
			let ind = Math.floor(Math.random() * (tones.length - 1));

			if (!gameTones.length || (gameTones.length && gameTones[gameTones.length - 1] != tones[ind])) {
				gameTones.push(tones[ind]);
			}

			if (gameTones.length == count) break;
		}

		this._gameData.ind = 0;
		this._gameData.count = count;
		this._gameData.time = time;
		this._gameData.correct = 0;
		this._gameData.wrong = 0;
		this._gameData.timerID = null;
		this._gameData.tones = gameTones;
		this._gameData.curTone = null;

		this._gameCycle();
		this._showInfo("Game has started!");
	}

	/**
	 * Generate tones.
	 */
	_generateTones() {
		// generate tones
		let tone = this._dom.selectStartTone.value;
		let endTone = this._dom.selectEndTone.value;
		let octave = parseFloat(this._dom.selectStartOctave.value);
		let endOctave = parseFloat(this._dom.selectEndOctave.value);
		let isSharp = this._dom.selectTonesType.value == "1";

		return generateTones(new Tone(tone, octave), new Tone(endTone, endOctave), isSharp);
	}

	/**
	 * One game cycle.
	 */
	_gameCycle() {
		if (!this._gameData.tones.length) {
			this._showInfo("Finish");
			return;
		}

		let withTone = this._dom.selectTonesShow.value == 1;
		let tone = this._gameData.tones.shift();
		
		if (tone.octave < Tone.middleC().octave) {
			this._notesBass.drawTone(tone, {
				withTone
			});
		}
		else {
			this._notesTreble.drawTone(tone, {
				withTone
			});
		}

		this._gameData.curTone = tone;
		this._gameData.ind++;

		let curTime = this._gameData.time - 1;

		this._dom.timeInfo.textContent = `${this._gameData.time} s`;

		this._gameData.timerID = setInterval(() => {
			this._dom.timeInfo.textContent = `${curTime} s`;

			if (curTime === 0) {
				clearInterval(this._gameData.timerID);
				this._gameData.timerID = null;
				// error, tone was not found
				this._gameData.wrong++;
				this._showInfo(`Tone ${this._gameData.curTone.toString()} was not set!`, false);
				this._keyboard.drawTone(this._gameData.curTone);
				this._guessNewTone();
				return;
			}

			curTime--;
		}, 1000);
	}

	/**
	 * Guess a new tone.
	 */
	_guessNewTone() {
		let curTime = GUESS_NEW_TONE_TIME - 1;

		this._dom.timeInfo.textContent = `${GUESS_NEW_TONE_TIME} s`;

		// wait a while for the next tone
		this._gameData.guessTimerID = setInterval(() => {
			this._dom.timeInfo.textContent = `${curTime} s`;

			if (curTime === 0) {
				clearInterval(this._gameData.guessTimerID);
				this._gameData.guessTimerID = null;
				this._notesTreble.redraw();
				this._notesBass.redraw();
				this._keyboard.redraw();
				this._showInfo("Guess a new tone");
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
		if (!this._gameData.curTone || this._gameData.guessTimerID) return;

		let signatureKey = this._dom.selectSignature.value;
		let signature = KEYS_SIGNATURES_OBJ[signatureKey];
		let tts = toneToSignature(signature, this._gameData.curTone);

		if (key.tone.equal(tts)) {
			this._gameData.correct++;
			this._showInfo(`Success, tone was ${tts.toString()}`, true);
			clearInterval(this._gameData.timerID);
			this._gameData.timerID = null;
			this._guessNewTone();
		}
		else {
			this._gameData.wrong++;
			this._showInfo("Wrong, the tone is incorrect!", false);
		}
	}
};

export default Game;
