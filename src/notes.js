import Resources from "./resources";
import { TONES, IMAGES } from "conf";

const CONFIG = {
	paddingTopBottom: 30, // space between note lines above/bottom
	paddingLeftRight: 30,
	lineHeight: 3,
	lineDistance: 14,
	keyOffset: 10,
	clickDistanceThreshold: 4,
	lines: 5,
	startX: 110,
	noteSize: 8,
	sharpOffset: 15,
	sharpSignOffset: 10,
	fontFamily: "bold 16px Arial",
	noteColor: "#c01",
	sharpColor: "#008000",
	lineColor: "#000",
	helpLineColor: "rgba(0, 0, 0, 0.1)",
	noteHandle: {
		width: 3,
		height: 51
	}
};

class Notes {
	/**
	 * Notes.
	 *
	 * @param   {Element}  parentEl Append element
	 * @param   {Boolean}  isBass Is bass range?
	 * @param   {Object}  notesRange Notes range
	 * @param   {Function}  onClick  Callback - note area click
	 */
	constructor(parentEl, isBass, notesRange, onClick) {
		this._parentEl = parentEl;
		this._isBass = isBass;
		this._notesRange = notesRange;
		this._onClick = onClick;
		this._canvas = document.createElement("canvas");
		this._ctx = this._canvas.getContext("2d");
		this._images = {
			treble: Resources.treble,
			bass: Resources.bass
		};
		this._dim = {
			lines: [],
			mainLines: [],
			height: 0
		};
		this._currentX = CONFIG.startX;
		this._mapping = {};
		this._mappingArray = [];
		this._canvas.addEventListener("click", e => {
			let x = e.layerX;
			let y = e.layerY;

			let distances =  this._dim.lines.map(line => {
				return {
					line,
					distance: Math.abs(line.y - y)
				};
			}).sort((a, b) => {
				return a.distance - b.distance;
			});

			// exact
			let tone = distances[0].line.tone;
			let octave = distances[0].line.octave;

			if (distances[0].distance > CONFIG.clickDistanceThreshold) {
				// between - move bottom
				let toneInd = distances[0].line.toneInd;
				let direction = y > distances[0].line.y ? 1 : -1;
				toneInd -= direction;
				if (toneInd < 0) {
					octave--;
					toneInd = TONES.length - 1;
				}
				else if (toneInd > TONES.length - 1) {
					octave++;
					toneInd = 0;
				}
				tone = TONES[toneInd];
			}

			if (typeof this._onClick === "function") this._onClick({
				tone,
				octave,
				x,
				y
			});
		});

		// counting
		let y = CONFIG.paddingTopBottom;
		let mainItem = this._notesRange[this._isBass ? "bass" : "treble"];
		let linesCount = mainItem.top.helpLine + CONFIG.lines + mainItem.bottom.helpLine;
		let toneInd = TONES.indexOf(mainItem.top.tone);
		let octave = mainItem.top.octave;
		let ind = 0;

		for (let i = 0; i < linesCount; i++) {
			let tone = TONES[toneInd];
			let line = {
				tone,
				toneInd,
				octave,
				y,
				main: false,
				ind
			};
			ind++;
			if (i >= mainItem.top.helpLine && i < mainItem.top.helpLine + CONFIG.lines) line.main = true;
			toneInd -= 2;
			if (toneInd < 0) {
				toneInd = TONES.length + toneInd;
				octave--;
			}
			y += CONFIG.lineHeight + CONFIG.lineDistance;
			this._dim.lines.push(line);
			if (line.main) {
				this._dim.mainLines.push(line);
			}
		}

		this._dim.height = y + CONFIG.paddingTopBottom;

		// dom append
		this._parentEl.appendChild(this._canvas);
		this.syncPort();
		this.redraw();
	}

	/**
	 * Sync port - resize area.
	 */
	syncPort() {
		let width = this._parentEl.offsetWidth;

		this._canvas.width = width;
		this._canvas.height = this._dim.height;
		this.redraw();
	}

	/**
	 * Redraw to blank sheet.
	 */
	redraw() {
		this._drawBackground();
		this._drawLines();
		this._drawKey();
	}

	// C4 -> treble, below C4 bass

	/**
	 * Draw a note.
	 *
	 * @param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 * @param   {Object}  [optsArg] Config
	 * @param   {Boolean}  [optsArg.withTone = true] Draw note with tone sign
	 * @param   {Boolean}  [optsArg.isSharp = false] Draw note with sharp sign
	 * @param   {Number}  [optsArg.x = undefined] Draw note with own x value
	 */
	drawNote(tone, octave, optsArg) {
		let opts = Object.assign({
			withTone: true,
			isSharp: false,
			x: undefined
		}, optsArg);

		if (this._currentX > this._canvas.width - 2 * CONFIG.paddingLeftRight) {
			this.resetOffset();
			this.redraw();
		}

		let findData = this._findNote(tone, octave);

		if (!findData) return;

		if (typeof opts.x === "number") {
			this._currentX = Math.max(x - CONFIG.noteSize / 2, CONFIG.startX);
			delete opts.x;
		}

		this._drawNote(findData, opts);
	}

	/**
	 * Draw notes.
	 *
	 * @param   {Array}  notes  Array of objects { tone, octave }
	 * @param   {Boolean}  [disableTone] Disable showing tone name
	 */
	drawNotes(notes, disableTone) {
		let hasSharp = false;
		let items = [];
		notes.forEach(i => {
			let isSharp = i.tone.indexOf("#") != -1;
			let findData = this._findNote(i.tone.replace("#", ""), i.octave);

			if (findData) {
				if (isSharp) {
					hasSharp = true;
				}

				items.push({
					findData,
					isSharp
				});
			}
		});

		items.forEach(i => {
			if (hasSharp) {
				i.findData.x += 10;
			}

			if (!i.isSharp && hasSharp) {
				i.findData.x += CONFIG.sharpOffset;
			}

			this._drawNote(i.findData, {
				isSharp: i.isSharp,
				withTone: !disableTone
			});
		});

		if (hasSharp) {
			this._currentX += CONFIG.sharpOffset * 2;
		}
	}

	/**
	 * Move offset to next draw position.
	 */
	moveOffset() {
		this._currentX += CONFIG.noteSize + 21;
	}

	/**
	 * Reset draw offset to the start position.
	 */
	resetOffset() {
		this._currentX = CONFIG.startX;
	}

	/**
	 * Draw empty background.
	 */
	_drawBackground() {
		this._ctx.fillStyle = "#fff";
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
	}

	/**
	 * Draw all lines.
	 */
	_drawLines() {
		let width = this._canvas.width - 2 * CONFIG.paddingLeftRight;
		let startX = CONFIG.paddingLeftRight;
		let endX = startX + width;

		// help lines
		this._ctx.strokeStyle = CONFIG.helpLineColor;

		this._dim.lines.forEach(line => {
			if (line.main) return;

			this._ctx.beginPath();
			this._ctx.moveTo(startX, line.y);
			this._ctx.lineTo(endX, line.y);
			this._ctx.stroke();
		});

		// main lines
		this._ctx.strokeStyle = CONFIG.lineColor;

		this._dim.mainLines.forEach(line => {
			this._ctx.beginPath();
			this._ctx.moveTo(startX, line.y);
			this._ctx.lineTo(endX, line.y);
			this._ctx.stroke();
		});

		// begin/end
		this._ctx.beginPath();
		this._ctx.moveTo(startX, this._dim.mainLines[0].y);
		this._ctx.lineTo(startX, this._dim.mainLines[this._dim.mainLines.length - 1].y);
		this._ctx.stroke();

		this._ctx.beginPath();
		this._ctx.moveTo(endX, this._dim.mainLines[0].y);
		this._ctx.lineTo(endX, this._dim.mainLines[this._dim.mainLines.length - 1].y);
		this._ctx.stroke();
	}

	/**
	 * Draw signature key.
	 */
	_drawKey() {
		let startX = CONFIG.paddingLeftRight + CONFIG.keyOffset;

		if (this._isBass) {
			this._ctx.drawImage(this._images.bass, startX, this._dim.mainLines[0].y + 1);
		}
		else {
			this._ctx.drawImage(this._images.treble, startX, this._dim.mainLines[this._dim.mainLines.length - 1].y - IMAGES.treble.height + IMAGES.treble.offsetY);
		}
	}

	/**
	 * Find note by tone and octave.
	 *
	 * @param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 * @return  {Object}
	 */
	_findNote(tone, octave) {
		let toneInd = TONES.indexOf(tone);
		let find = null;
		let exact = false;
		let direction = 0;

		for (let i = this._dim.lines.length - 1; i >= 0; i--) {
			let item = this._dim.lines[i];

			if (item.octave == octave && Math.abs(item.toneInd - toneInd) <= 1) {
				find = item;
				exact = toneInd == item.toneInd;
				direction = exact ? 0 : (item.toneInd > toneInd ? 1 : -1);
				break;
			}
		}

		return (find ? {
			x: this._currentX,
			find,
			direction,
			exact,
			tone,
			octave
		} : null);
	}

	/**
	 * Draw note with findData.
	 *
	 * @param   {Object}  findData Find note data object
	 * @param   {Object}  [optsArg]
	 * @param   {Boolean}  [optsArg.withTone = true] Draw note with tone sign
	 * @param   {Boolean}  [optsArg.isSharp = false] Draw note with sharp sign
	 */
	_drawNote(findData, optsArg) {
		let opts = Object.assign({
			withTone: true,
			isSharp: false
		}, optsArg);

		if (opts.withTone) {
			this._drawNoteHelpLines(findData);
		}

		// note
		let lineHalfHeight = CONFIG.lineDistance / 2;
		let noteY = findData.find.y + (findData.exact ? 0 : findData.direction * lineHalfHeight);

		this._ctx.beginPath();
		this._ctx.arc(findData.x + CONFIG.noteSize, noteY, CONFIG.noteSize, 0, 2 * Math.PI);
		this._ctx.fillStyle = "#fff";
		this._ctx.fill();
		this._ctx.stroke();

		let offset = 2;

		if (opts.withTone) {
			// note name
			this._ctx.fillStyle = CONFIG.noteColor;
			this._ctx.font = CONFIG.fontFamily;
			this._ctx.fillText(findData.tone, findData.x + offset + (findData.tone == "B" ? 1 : 0), noteY + CONFIG.noteSize - offset);
		}
		else {
			this._drawNoteHelpLines(findData);
		}

		// sharp?
		if (opts.isSharp) {
			this._ctx.fillStyle = CONFIG.sharpColor;
			this._ctx.font = CONFIG.fontFamily;
			this._ctx.fillText("#", findData.x - CONFIG.sharpSignOffset, noteY + CONFIG.noteSize - offset);
		}
	}

	/**
	 * Draw note help lines.
	 *
	 * @param   {Object}  findData Find note data object
	 */
	_drawNoteHelpLines(findData) {
		// note help lines
		let lastInd = this._dim.mainLines[this._dim.mainLines.length - 1].ind;

		if (findData.find.ind < this._dim.mainLines[0].ind) {
			for (let i = findData.find.ind; i < this._dim.mainLines[0].ind; i++) {
				let item = this._dim.lines[i];

				this._ctx.beginPath();
				this._ctx.moveTo(findData.x - 5, item.y);
				this._ctx.lineTo(findData.x + 2 * CONFIG.noteSize + 5, item.y);
				this._ctx.stroke();
			}
		}
		else if (findData.find.ind > lastInd) {
			this._ctx.lineWidth = 2;

			for (let i = lastInd + 1, max = findData.find.ind + findData.direction; i <= max; i++) {
				let item = this._dim.lines[i];

				if (!item || (i == max && findData.tone == "C" && findData.octave == 1)) break;
				
				this._ctx.beginPath();
				this._ctx.moveTo(findData.x - 5, item.y);
				this._ctx.lineTo(findData.x + 2 * CONFIG.noteSize + 5, item.y);
				this._ctx.stroke();
			}

			this._ctx.lineWidth = 1;
		}
	}
}

export default Notes;
