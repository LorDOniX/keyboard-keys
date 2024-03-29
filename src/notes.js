import { Note } from "./note";
import Resources from "./resources";
import { NOTES, IMAGES } from "conf";

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
	helpLineColor: "rgba(0, 0, 0, 0.1)"
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
		this._canvas.addEventListener("click", e => {
			this._canvasClick(e);
		});

		this._build();
		this.show();
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

	/**
	 * Reset - show notes.
	 */
	show() {
		this.syncPort();
		this.resetOffset();
		this.redraw();
	}

	/**
	 * Draw a note.
	 *
	 * @param   {Note}  note  C...
	 * @param   {Object}  [optsArg] Config
	 * @param   {Boolean}  [optsArg.withNote = true] Draw note with note sign
	 * @param   {Number}  [optsArg.x = undefined] Draw note with own x value
	 */
	drawNote(note,optsArg) {
		let opts = Object.assign({
			withNote: true,
			x: undefined
		}, optsArg);

		if (this._currentX > this._canvas.width - 2 * CONFIG.paddingLeftRight) {
			this.resetOffset();
			this.redraw();
		}

		let findData = this._findNote(note);

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
	 * @param   {Array}  notes  Array of Note
	 * @param   {Boolean}  [disableNote] Disable showing note name
	 */
	drawNotes(notes, disableNote) {
		let hasSharp = false;
		let items = [];
		notes.forEach(note => {
			let findData = this._findNote(note);

			if (findData) {
				if (!hasSharp && findData.note.isSharp) {
					hasSharp = true;
				}

				items.push(findData);
			}
		});

		items.forEach(i => {
			if (hasSharp) {
				i.x += 10;
			}

			if (!i.note.isSharp && hasSharp) {
				i.x += CONFIG.sharpOffset;
			}

			this._drawNote(i, {
				withNote: !disableNote
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
	 * Build all lines.
	 */
	_build() {
		// counting
		let y = CONFIG.paddingTopBottom;
		let mainItem = this._notesRange[this._isBass ? "bass" : "treble"];
		let linesCount = mainItem.top.helpLine + CONFIG.lines + mainItem.bottom.helpLine;
		let noteInd = NOTES.indexOf(mainItem.top.note.simple);
		let octave = mainItem.top.note.octave;
		let ind = 0;

		for (let i = 0; i < linesCount; i++) {
			let note = NOTES[noteInd];
			let line = {
				note: new Note(note, octave),
				y,
				main: false,
				ind
			};
			ind++;
			if (i >= mainItem.top.helpLine && i < mainItem.top.helpLine + CONFIG.lines) line.main = true;
			noteInd -= 2;
			if (noteInd < 0) {
				noteInd = NOTES.length + noteInd;
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
	 * Find note by note and octave.
	 *
	 * @param   {Note}  note  C...
	 * @return  {Object}
	 */
	_findNote(note) {
		let noteInd = NOTES.indexOf(note.simple);
		let find = null;
		let exact = false;
		let direction = 0;

		for (let i = this._dim.lines.length - 1; i >= 0; i--) {
			let item = this._dim.lines[i];
			let itemNoteInd = NOTES.indexOf(item.note.simple);

			if (item.note.octave == note.octave && Math.abs(itemNoteInd - noteInd) <= 1) {
				find = item;
				exact = noteInd == itemNoteInd;
				direction = exact ? 0 : (itemNoteInd > noteInd ? 1 : -1);
				break;
			}
		}

		return (find ? {
			x: this._currentX,
			find,
			direction,
			exact,
			note
		} : null);
	}

	/**
	 * Draw note with findData.
	 *
	 * @param   {Object}  findData Find note data object
	 * @param   {Object}  [optsArg]
	 * @param   {Boolean}  [optsArg.withNote = true] Draw note with note sign
	 * @param   {Boolean}  [optsArg.isSharp = false] Draw note with sharp sign
	 */
	_drawNote(findData, optsArg) {
		let opts = Object.assign({
			withNote: true
		}, optsArg);

		if (opts.withNote) {
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

		if (opts.withNote) {
			// note name
			this._ctx.fillStyle = CONFIG.noteColor;
			this._ctx.font = CONFIG.fontFamily;
			this._ctx.fillText(findData.note.simple, findData.x + offset + (findData.note.simple == "B" ? 1 : 0), noteY + CONFIG.noteSize - offset);
		}
		else {
			this._drawNoteHelpLines(findData);
		}

		// sharp?
		if (findData.note.isSharp) {
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

				if (!item || (i == max && findData.note.simple == "C" && findData.note.octave == 1)) break;

				this._ctx.beginPath();
				this._ctx.moveTo(findData.x - 5, item.y);
				this._ctx.lineTo(findData.x + 2 * CONFIG.noteSize + 5, item.y);
				this._ctx.stroke();
			}

			this._ctx.lineWidth = 1;
		}
	}

	/**
	 * Click on canvas.
	 *
	 * @param   {MouseEvent}  e Click
	 */
	_canvasClick(e) {
		const cbr = e.target.getBoundingClientRect();
		let x = e.clientX - cbr.x;
		let y = e.clientY - cbr.y;

		let distances =  this._dim.lines.map(line => {
			return {
				line,
				distance: Math.abs(line.y - y)
			};
		}).sort((a, b) => {
			return a.distance - b.distance;
		});

		// exact
		let note = distances[0].line.note.note;
		let octave = distances[0].line.note.octave;

		if (distances[0].distance > CONFIG.clickDistanceThreshold) {
			// between - move bottom
			let noteInd = NOTES.indexOf(note);
			let direction = y > distances[0].line.y ? 1 : -1;
			noteInd -= direction;
			if (noteInd < 0) {
				octave--;
				noteInd = NOTES.length - 1;
			}
			else if (noteInd > NOTES.length - 1) {
				octave++;
				noteInd = 0;
			}
			note = NOTES[noteInd];
		}

		if (typeof this._onClick === "function") this._onClick({
			note: new Note(note, octave),
			x,
			y
		});
	}
}

export default Notes;
