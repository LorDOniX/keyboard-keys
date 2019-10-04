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
	},
	note: {
		src: "/img/note.png",
		width: 22,
		height: 19
	}
};

const CONFIG = {
	paddingTopBottom: 30, // prostor nad linkou a pod
	paddingLeftRight: 30,
	lineHeight: 3,
	lineDistance: 13,
	keyOffset: 10,
	lines: 5,
	startX: 110,
	noteHandle: {
		width: 3,
		height: 51
	}
};

const NOTES = {
	treble: {
		top: {
			helpLine: 9,
			tone: "C",
			octave: 8
		},
		bottom: {
			helpLine: 1,
			tone: "C",
			octave: 4
		}
	},
	bass: {
		top: {
			helpLine: 1,
			tone: "C",
			octave: 4
		},
		bottom: {
			helpLine: 6,
			tone: "B",
			octave: 0
		}
	}
}

class Notes {
	constructor(parentEl, isBass, onClick) {
		this._parentEl = parentEl;
		this._isBass = isBass;
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

			if (distances[0].distance > CONFIG.lineDistance / 2) {
				// mezi - spodek a posuneme
				let toneInd = distances[0].line.toneInd;
				toneInd--;
				if (toneInd < 0) {
					octave--;
					toneInd = TONES.length - 1;
				}
				tone = TONES[toneInd];
			}

			console.log(distances)

			if (typeof this._onClick === "function") this._onClick({
				tone,
				octave,
				x,
				y
			});
		});

		console.log(this)
	}

	load() {
		return new Promise(async(resolve) => {
			// obrazky
			this._images.treble = await getImage(IMAGES.treble.src);
			this._images.bass = await getImage(IMAGES.bass.src);
			this._images.note = await getImage(IMAGES.note.src);

			// spocitame
			let y = CONFIG.paddingTopBottom;
			let mainItem = NOTES[this._isBass ? "bass" : "treble"];
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
		this._currentX = CONFIG.startX;

		this._drawBackground();
		this._drawLines();
		this._drawKey();
	}

	// C4 -> treble, pod C4 bass
	drawNote(tone, octave, x) {
		if ((octave > 4 && this._isBass) || (octave < 4 && !this._isBass)) {
			console.error(`Wrong key ${tone}${octave}!`);
			return;
		}

		let toneInd = TONES.indexOf(tone);
		let find = null;
		let exact = false;
		let direction = 0;
		let noteHalfHeight = IMAGES.note.height / 2;
		let lineHalfHeight = CONFIG.lineDistance / 2;

		for (let i = this._dim.lines.length - 1; i >= 0; i--) {
			let item = this._dim.lines[i];

			if (item.octave == octave && Math.abs(item.toneInd - toneInd) <= 1) {
				find = item;
				exact = toneInd == item.toneInd;
				direction = exact ? 0 : (item.toneInd > toneInd ? 1 : -1);
				break;
			}
		}

		if (!find) return;

		if (typeof x === "number") {
			this._currentX = Math.max(x - IMAGES.note.width / 2, CONFIG.startX);
		}

		// nota
		this._ctx.drawImage(this._images.note, this._currentX, find.y - noteHalfHeight + (exact ? 0 : direction * lineHalfHeight));

		// mrizkovani
		let lastInd = this._dim.mainLines[this._dim.mainLines.length - 1].ind;

		if (find.ind < this._dim.mainLines[0].ind) {
			for (let i = find.ind; i < this._dim.mainLines[0].ind; i++) {
				let item = this._dim.lines[i];

				this._ctx.beginPath();
				this._ctx.moveTo(this._currentX - 5, item.y);
				this._ctx.lineTo(this._currentX + IMAGES.note.width + 5, item.y);
				this._ctx.stroke();
			}
		}
		else if (find.ind > lastInd) {
			this._ctx.lineWidth = 2;

			for (let i = lastInd + 1; i <= find.ind + direction; i++) {
				let item = this._dim.lines[i];

				if (!item) break;
				
				this._ctx.beginPath();
				this._ctx.moveTo(this._currentX - 5, item.y);
				this._ctx.lineTo(this._currentX + IMAGES.note.width + 5, item.y);
				this._ctx.stroke();
			}

			this._ctx.lineWidth = 1;
		}

		this._currentX += IMAGES.note.width + 25;
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
}

export default Notes;
