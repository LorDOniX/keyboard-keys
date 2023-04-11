import KeyboardSound from "keyboard-sound";
import { GUITAR_POINTED_FRETS } from "conf";
import { generateStrings } from "utils";

const CONFIG = {
	strings: 6,
	frets: 25, // included 0 note, add +1
	lineWidth: 1,
	lineHeight: 1,
	cellHeight: 30,
	padding: 10
};

class Guitar {
	/**
	 * Guitar fretboard.
	 *
	 * @param   {Element}  parentEl Append element
	 * @param   {Function}  onClick  Callback - note area click
	 */
	constructor(parentEl, onClick) {
		this._parentEl = parentEl;
		this._onClick = onClick;
		this._canvas = document.createElement("canvas");
		this._canvas.addEventListener("click", e => {
			this._canvasClick(e);
		});
		this._ctx = this._canvas.getContext("2d");
		// dom append
		this._parentEl.appendChild(this._canvas);
		this._dim = {
			height: CONFIG.cellHeight * CONFIG.strings + (CONFIG.strings + 1) * CONFIG.lineHeight + 2 * CONFIG.padding
		};
		this._strings = [];

		this.syncPort();
		this.setTune();
	}

	/**
	 * Sync port - resize area.
	 */
	syncPort() {
		let width = this._parentEl.offsetWidth;

		this._canvas.width = width;
		this._canvas.height = this._dim.height;
		this._dim.cellWidth = Math.floor((width - 2 * CONFIG.padding - (CONFIG.frets + 1) * CONFIG.lineWidth) / CONFIG.frets);
		this._dim.lastX = CONFIG.padding + CONFIG.frets * this._dim.cellWidth + (CONFIG.frets + 1) * CONFIG.lineWidth;

		this.redraw();
	}

	/**
	 * Set guitar tuning - all strings configuration like standard tuning difference.
	 *
	 * @param   {Array}  config Array of numbers - equal strings length
	 */
	setTune(config) {
		let defConfig = [];

		for (let i = 0; i < CONFIG.strings; i++) defConfig.push(0);
		this._strings = generateStrings(CONFIG.strings, CONFIG.frets, config || defConfig);

		this.redraw();
	}

	/**
	 * Redraw to blank sheet.
	 */
	redraw() {
		this._drawBackground();
		this._drawLines();
		this._drawCircles();
		this._drawNotes();
	}

	/**
	 * Reset - show guitar fretboard.
	 */
	show() {
		this.syncPort();
		this.redraw();
	}

	/**
	 * Draw a note.
	 *
	 * @param   {String}  note  C...
	 * @param   {Number}  octave 0-8
	 * @param   {Object}  [optsArg] Config
	 * @param   {Boolean}  [isSharp] Sharp note?
	 */
	drawNote(note) {
		this._drawBackground();
		this._drawLines();

		this._strings.forEach((string, ind) => {
			string.forEach(noteItem => {
				if (noteItem.note.equal(note)) {
					this._fillCell(noteItem.fret, ind);
				}
			});
		});

		this._drawCircles();
		this._drawNotes();
	}

	/**
	 * Draw multiple notes.
	 *
	 * @param   {Array}  notes Array of notes
	 */
	drawNotes(notes) {
		this._drawBackground();
		this._drawLines();

		this._strings.forEach((string, ind) => {
			string.forEach(noteItem => {
				for (let note of notes) {
					if (noteItem.note.equal(note)) {
						this._fillCell(noteItem.fret, ind);
						break;
					}
				}
			});
		});

		this._drawCircles();
		this._drawNotes();
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
		this._ctx.strokeStyle = "#000";
		this._ctx.lineWidth = CONFIG.lineHeight;

		let y = CONFIG.padding;

		for (let i = 0, max = CONFIG.strings + 1; i <= max; i++) {
			this._ctx.beginPath();
			this._ctx.moveTo(CONFIG.padding, y);
			this._ctx.lineTo(this._dim.lastX, y);
			this._ctx.stroke();
			y += CONFIG.cellHeight + CONFIG.lineHeight;
		}

		this._ctx.lineWidth = CONFIG.lineWidth;

		let x = CONFIG.padding;
		let maxY = this._dim.height - CONFIG.padding;

		for (let i = 0, max = CONFIG.frets; i <= max; i++) {
			this._ctx.lineWidth = CONFIG.lineWidth + (i == 1 ? 2 : 0);
			this._ctx.beginPath();
			this._ctx.moveTo(x, CONFIG.padding);
			this._ctx.lineTo(x, maxY);
			this._ctx.stroke();
			x += this._dim.cellWidth + CONFIG.lineWidth;

			if (i == 0) {
				this._ctx.lineWidth = CONFIG.lineWidth + 2;
				this._ctx.beginPath();
				this._ctx.moveTo(x - 5, CONFIG.padding);
				this._ctx.lineTo(x - 5, maxY);
				this._ctx.stroke();
			}
		}
	}

	/**
	 * Draw fretboard circles.
	 */
	_drawCircles() {
		this._ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

		let circleWidth = 8;

		GUITAR_POINTED_FRETS.forEach(fret => {
			if (fret > CONFIG.frets - 1) return;

			let x = CONFIG.padding + fret * this._dim.cellWidth + (fret + 1) * CONFIG.lineWidth + Math.floor((this._dim.cellWidth - circleWidth / 2) / 2);

			if (fret == 12) {
				let topY = CONFIG.padding + 1 * CONFIG.cellHeight + (1 + 1) * CONFIG.lineHeight;
				let bottomY = CONFIG.padding + 5 * CONFIG.cellHeight + (5 + 1) * CONFIG.lineHeight;

				this._ctx.beginPath();
				this._ctx.arc(x, topY, circleWidth, 0, 2 * Math.PI);
				this._ctx.fill();

				this._ctx.beginPath();
				this._ctx.arc(x, bottomY, circleWidth, 0, 2 * Math.PI);
				this._ctx.fill();
			}
			else {
				let y = Math.floor(this._dim.height / 2);

				this._ctx.beginPath();
				this._ctx.arc(x, y, circleWidth, 0, 2 * Math.PI);
				this._ctx.fill();
			}
		});
	}

	/**
	 * Draw all notes.
	 */
	_drawNotes() {
		this._ctx.fillStyle = "#000";

		let x;
		let y = CONFIG.padding + CONFIG.lineHeight;

		this._strings.forEach(string => {
			x = CONFIG.padding + CONFIG.lineWidth;

			string.forEach((stringItem, ind) => {
				let text = stringItem.note.toString(true);
				this._ctx.font = `bold ${text.length == 2 ? 16 : (!ind ? 12 : 14)}px Arial`;
				let textDim = this._ctx.measureText(text);
				this._ctx.fillText(text, x + Math.floor((this._dim.cellWidth - textDim.width) / 2) + (!ind ? -2 : 0), y + Math.floor(CONFIG.cellHeight / 2 + 5));
				x += this._dim.cellWidth + CONFIG.lineWidth;
			});

			y += CONFIG.cellHeight + CONFIG.lineHeight;
		});
	}

	/**
	 * Fill one fret.
	 *
	 * @param   {Number}  x Position on fretboard
	 * @param   {Number}  y Position on fretboard
	 */
	_fillCell(x, y) {
		let drawX = CONFIG.padding + x * this._dim.cellWidth + (x + 1) * CONFIG.lineWidth;
		let drawY = CONFIG.padding + y * CONFIG.cellHeight + (y + 1) * CONFIG.lineHeight;

		this._ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
		this._ctx.fillRect(drawX, drawY, this._dim.cellWidth, CONFIG.cellHeight);
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

		x -= CONFIG.padding;
		y -= CONFIG.padding;

		if (x < 0 || y < 0) {
			this.redraw();
			return;
		}

		x /= (this._dim.cellWidth + CONFIG.lineWidth);
		y /= (CONFIG.cellHeight + CONFIG.lineHeight);
		x = Math.floor(x);
		y = Math.floor(y);

		let item = this._strings[y][x];

		if (!item) return;

		if (typeof this._onClick === "function") {
			this._onClick(item);
		}

		this._drawBackground();
		this._drawLines();
		this._fillCell(x, y);
		this._drawCircles();
		this._drawNotes();
		KeyboardSound.playNote(item.note);
	}
}

export default Guitar;
