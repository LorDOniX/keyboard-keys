import { getImage } from "utils";
import { TONES } from "conf";

const IMAGES = {
	treble: {
		src: "/img/treble.png",
		width: 45,
		height: 119,
		offsetY: 28
	},
	bass: {
		src: "/img/bass.png",
		width: 46,
		height: 53
	}
};

const CONFIG = {
	paddingTopBottom: 30, // prostor nad linkou a pod
	paddingLeftRight: 30,
	lineHeight: 3,
	lineDistance: 14,
	keyOffset: 10,
	clickDistanceThreshold: 4,
	lines: 5,
	startX: 110,
	noteSize: 8,
	noteHandle: {
		width: 3,
		height: 51
	}
};

class Notes {
	constructor(parentEl, isBass, notesRange, onClick) {
		this._parentEl = parentEl;
		this._isBass = isBass;
		this._notesRange = notesRange;
		this._onClick = onClick;
		this._canvas = document.createElement("canvas");
		this._ctx = this._canvas.getContext("2d");
		this._images = {};
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
				// mezi - spodek a posuneme
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
	}

	load() {
		return new Promise(async(resolve) => {
			// obrazky
			this._images.treble = await getImage(IMAGES.treble.src);
			this._images.bass = await getImage(IMAGES.bass.src);

			// spocitame
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

			// pripojime
			this._parentEl.appendChild(this._canvas);
			this.syncPort();
			this.redraw();
			resolve();
		});
	}

	syncPort() {
		let width = this._parentEl.offsetWidth;

		this._canvas.width = width;
		this._canvas.height = this._dim.height;
	}

	redraw() {
		this._drawBackground();
		this._drawLines();
		this._drawKey();
	}

	// C4 -> treble, pod C4 bass
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

	drawNotes(notes, disableTone) {
		let sharpStartAdd = 15;
		let nonSharpOffset = 15;
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
				i.findData.x += nonSharpOffset;
			}

			this._drawNote(i.findData, {
				isSharp: i.isSharp,
				withTone: !disableTone
			});
		});

		if (hasSharp) {
			this._currentX += nonSharpOffset + sharpStartAdd;
		}
	}

	moveOffset() {
		this._currentX += CONFIG.noteSize + 21;
	}

	resetOffset() {
		this._currentX = CONFIG.startX;
	}

	_drawBackground() {
		this._ctx.fillStyle = "#fff";
		this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
	}

	_drawLines() {
		let width = this._canvas.width - 2 * CONFIG.paddingLeftRight;
		let startX = CONFIG.paddingLeftRight;
		let endX = startX + width;

		// pomocne cary
		this._ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";

		this._dim.lines.forEach(line => {
			if (line.main) return;

			this._ctx.beginPath();
			this._ctx.moveTo(startX, line.y);
			this._ctx.lineTo(endX, line.y);
			this._ctx.stroke();
		});

		// hlavni cary
		this._ctx.strokeStyle = "#000";

		this._dim.mainLines.forEach(line => {
			this._ctx.beginPath();
			this._ctx.moveTo(startX, line.y);
			this._ctx.lineTo(endX, line.y);
			this._ctx.stroke();
		});

		// zacatek/konec
		this._ctx.beginPath();
		this._ctx.moveTo(startX, this._dim.mainLines[0].y);
		this._ctx.lineTo(startX, this._dim.mainLines[this._dim.mainLines.length - 1].y);
		this._ctx.stroke();

		this._ctx.beginPath();
		this._ctx.moveTo(endX, this._dim.mainLines[0].y);
		this._ctx.lineTo(endX, this._dim.mainLines[this._dim.mainLines.length - 1].y);
		this._ctx.stroke();
	}

	_drawKey() {
		let startX = CONFIG.paddingLeftRight + CONFIG.keyOffset;

		if (this._isBass) {
			this._ctx.drawImage(this._images.bass, startX, this._dim.mainLines[0].y + 1);
		}
		else {
			this._ctx.drawImage(this._images.treble, startX, this._dim.mainLines[this._dim.mainLines.length - 1].y - IMAGES.treble.height + IMAGES.treble.offsetY);
		}
	}

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

	_drawNote(findData, optsArg) {
		let opts = Object.assign({
			withTone: true,
			isSharp: false
		}, optsArg);

		if (opts.withTone) {
			this._drawNoteHelpLines(findData);
		}

		// nota
		let lineHalfHeight = CONFIG.lineDistance / 2;
		let noteY = findData.find.y + (findData.exact ? 0 : findData.direction * lineHalfHeight);

		this._ctx.beginPath();
		this._ctx.arc(findData.x + CONFIG.noteSize, noteY, CONFIG.noteSize, 0, 2 * Math.PI);
		this._ctx.fillStyle = "#fff";
		this._ctx.fill();
		this._ctx.stroke();

		let offset = 2;

		if (opts.withTone) {
			// nazev
			this._ctx.fillStyle = "#c01";
			this._ctx.font = "16px Arial";
			this._ctx.fillText(findData.tone, findData.x + offset + (findData.tone == "B" ? 1 : 0), noteY + CONFIG.noteSize - offset);
		}
		else {
			this._drawNoteHelpLines(findData);
		}

		// krizek?
		if (opts.isSharp) {
			this._ctx.fillStyle = "#008000";
			this._ctx.font = "bold 16px Arial";
			this._ctx.fillText("#", findData.x - 10, noteY + CONFIG.noteSize - offset);
		}
	}

	_drawNoteHelpLines(findData) {
		// mrizkovani
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
