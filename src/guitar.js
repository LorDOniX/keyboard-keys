import { ALL_TONES_SHARP, GUITAR_TONES } from "conf";

const CONFIG = {
	strings: 6,
	frets: 25, // included 0 tone, add +1
	lineWidth: 1,
	lineHeight: 1,
	cellHeight: 30,
	padding: 10
};

class Guitar {
	/**
	 * Notes.
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

	setTune(config) {
		let defConfig = [];

		for (let i = 0; i < CONFIG.strings; i++) defConfig.push(0);
		this._strings = this._generateStrings(config || defConfig);

		this.redraw();
	}

	/**
	 * Redraw to blank sheet.
	 */
	redraw() {
		this._drawBackground();
		this._drawLines();
		this._drawCircles();
		this._drawTones();
	}

	// C4 -> treble, below C4 bass

	/**
	 * Draw a note.
	 *
	 * @param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 * @param   {Object}  [optsArg] Config
	 * @param   {Boolean}  [isSharp] Sharp note?
	 */
	drawNote(tone, octave, isSharp) {
		tone = `${tone}${isSharp ? "#" : ""}`;

		this._drawBackground();
		this._drawLines();
		
		this._strings.forEach((string, ind) => {
			string.forEach(toneItem => {
				if (toneItem.tone == tone && toneItem.octave == octave) {
					this._fillCell(toneItem.fret, ind);
				}
			});
		});

		this._drawCircles();
		this._drawTones();
	}

	drawNotes(notes) {
		this._drawBackground();
		this._drawLines();
		
		this._strings.forEach((string, ind) => {
			string.forEach(toneItem => {
				for (let item of notes) {
					if (toneItem.tone == item.tone && toneItem.octave == item.octave) {
						this._fillCell(toneItem.fret, ind);
						break;
					}
				}
			});
		});

		this._drawCircles();
		this._drawTones();
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

	_drawCircles() {
		this._ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

		let circleWidth = 8;

		[3, 5, 7, 9, 12, 15, 17, 19, 21, 24].forEach(fret => {
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

	_drawTones() {
		this._ctx.fillStyle = "#000";
		this._ctx.font = "bold 16px Arial";

		let x;
		let y = CONFIG.padding + CONFIG.lineHeight;

		this._strings.forEach(string => {
			x = CONFIG.padding + CONFIG.lineWidth;

			string.forEach(tone => {
				let text = `${tone.tone}${tone.octave}`;
				let textDim = this._ctx.measureText(text);
				this._ctx.fillText(text, x + Math.floor((this._dim.cellWidth - textDim.width) / 2), y + Math.floor(CONFIG.cellHeight / 2 + 5));
				x += this._dim.cellWidth + CONFIG.lineWidth;
			});

			y += CONFIG.cellHeight + CONFIG.lineHeight;
		});
	}

	_generateStrings(config) {
		let strings = [];

		for (let i = 0, max = Math.min(GUITAR_TONES.length, CONFIG.strings); i < max; i++) {
			let stringData = GUITAR_TONES[i];
			let string = [];
			let ind = ALL_TONES_SHARP.indexOf(stringData.startTone.tone) + config[config.length - 1 - i];
			let octave = stringData.startTone.octave;
			let maxLen = ALL_TONES_SHARP.length;

			if (ind < 0) {
				ind += maxLen;
				octave--;
			}
			else if (ind >= maxLen) {
				ind -= maxLen;
				octave++;
			}

			for (let x = 0; x < CONFIG.frets; x++) {
				let tone = ALL_TONES_SHARP[ind];
				string.push({
					tone,
					octave,
					fret: x
				});
				ind++;
				if (ind == maxLen) {
					ind = 0;
					octave++;
				}
			}

			strings.push(string);
		}

		return strings;
	}

	_fillCell(x, y) {
		let drawX = CONFIG.padding + x * this._dim.cellWidth + (x + 1) * CONFIG.lineWidth;
		let drawY = CONFIG.padding + y * CONFIG.cellHeight + (y + 1) * CONFIG.lineHeight;

		this._ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
		this._ctx.fillRect(drawX, drawY, this._dim.cellWidth, CONFIG.cellHeight);
	}

	_canvasClick(e) {
		let x = e.layerX;
		let y = e.layerY;

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

		if (typeof this._onClick === "function") {
			this._onClick(item);
		}

		this._drawBackground();
		this._drawLines();
		this._fillCell(x, y);
		this._drawCircles();
		this._drawTones();
	}
}

export default Guitar;
