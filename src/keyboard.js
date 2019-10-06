import KeyboardData from "keyboard-data";
import { getImage } from "utils";

const IMG = "/img/keyboard-layout.png";
const SIZE = {
	width: 1775,
	height: 330
};

class Keyboard {
	constructor(parentEl, onKey) {
		this._parentEl = parentEl;
		this._onKey = onKey;
		this._canvas = document.createElement("canvas");
		this._ctx = this._canvas.getContext("2d");
		this._img = null;
		this._keyboardData = null;
		this._lastRatio = -1;

		this._init();
	}

	syncPort() {
		let width = this._parentEl.offsetWidth;
		let availWidth = Math.min(width, SIZE.width);
		let ratio = availWidth / SIZE.width;

		if (this._lastRatio != ratio) {
			let height = SIZE.height * ratio;
			
			this._keyboardData = new KeyboardData(ratio);
			this._canvas.width = availWidth;
			this._canvas.height = height;
			this._lastRatio = ratio;

			this._drawBackground();
		}
	}

	drawKey(tone, octave) {
		if (this._keyboardData) {
			this._drawBackground();

			let keyData = this._keyboardData.findByTone(tone, octave);

			if (keyData) {
				this._drawKey(keyData);
			}
		}
	}

	drawKeys(keys) {
		if (this._keyboardData) {
			this._drawBackground();

			keys.forEach(item => {
				let keyData = this._keyboardData.findByTone(item.tone, item.octave);

				if (keyData) {
					this._drawKey(keyData);
				}
			});
		}
	}

	async _init() {
		this._img = await getImage(IMG);
		this._parentEl.appendChild(this._canvas);
		this._canvas.addEventListener("click", e => {
			let x = e.layerX;
			let y = e.layerY;

			if (this._keyboardData) {
				let find = this._keyboardData.getKey(x, y);

				if (find) {
					this._drawBackground();
					this._drawKey(find);
					if (typeof this._onKey === "function") this._onKey(find);
				}
			}
		});
		this.syncPort();
	}

	_drawBackground() {
		this._ctx.drawImage(this._img, 0, 0, SIZE.width, SIZE.height, 0, 0, this._canvas.width, this._canvas.height);
	}

	_drawKey(keyData) {
		if (!keyData) return;

		this._ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

		if (keyData.isBlack) {
			this._ctx.fillRect(keyData.x, keyData.y, keyData.width, keyData.height);
		}
		else {
			let isFlat = ["C", "D", "F", "G", "A"].indexOf(keyData.tone) != -1;
			let find = this._keyboardData.findByTone(keyData.tone + (isFlat ? "#" : "b"), keyData.octave);

			if (find) {
				let newY = find.y + find.height;
				let bottomY = keyData.y + keyData.height;
				let height = bottomY - newY;
				let w = keyData.width;
				let startX = keyData.x;

				switch (keyData.tone) {
					// vlevo
					case "C":
					case "F":
						w *= 0.6;
						break;

					// uprostred
					case "D":
					case "G":
					case "A":
						if (keyData.octave == 0) {
							w *= 0.6;
						}
						else {
							w *= 0.3;
							startX += (keyData.width * 0.7) / 2;
						}
						
						break;

					// vpravo
					case "E":
					case "B":
						w *= 0.6;
						startX += keyData.width * 0.4;
						break;
				}

				// horni cast
				this._ctx.fillRect(startX, keyData.y, w, newY - keyData.y);
				// spodni cast
				this._ctx.fillRect(keyData.x, find.y + find.height, keyData.width, height);
			}
			else {
				this._ctx.fillRect(keyData.x, keyData.y, keyData.width, keyData.height);
			}
		}
	}

	_drawOutline() {
		this._ctx.strokeStyle = "red";

		this._keyboardData.white.forEach(item => {
			this._ctx.beginPath();
			this._ctx.rect(item.x, item.y, item.width, item.height);
			this._ctx.stroke();
		});

		this._ctx.strokeStyle = "blue";
		
		this._keyboardData.black.forEach(item => {
			this._ctx.beginPath();
			this._ctx.rect(item.x, item.y, item.width, item.height);
			this._ctx.stroke();
		});
	}
}

export default Keyboard;
