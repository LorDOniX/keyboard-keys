import Resources from "./resources";
import KeyboardData from "keyboard-data";
import { IMAGES } from "conf";

class Keyboard {
	/**
	 * Keyboard.
	 *
	 * @param   {Element}  parentEl Append element
	 * @param   {Function}  onKey Callback - on key press
	 */
	constructor(parentEl, onKey) {
		this._parentEl = parentEl;
		this._onKey = onKey;
		this._canvas = document.createElement("canvas");
		this._ctx = this._canvas.getContext("2d");
		this._img = Resources.layout;
		this._keyboardData = null;
		this._lastRatio = -1;
		this._parentEl.appendChild(this._canvas);
		this._canvas.addEventListener("click", e => {
			let x = e.layerX;
			let y = e.layerY;

			if (this._keyboardData) {
				let find = this._keyboardData.getKey(x, y);

				if (find) {
					this.redraw();
					this._drawKey(find);
					if (typeof this._onKey === "function") this._onKey(find);
				}
			}
		});
		this.syncPort();
	}

	/**
	 * Resize viewport, clears area.
	 */
	syncPort() {
		let width = this._parentEl.offsetWidth;
		let availWidth = Math.min(width, IMAGES.layout.width);
		let ratio = availWidth / IMAGES.layout.width;

		if (this._lastRatio != ratio) {
			let height = IMAGES.layout.height * ratio;
			
			this._keyboardData = new KeyboardData(ratio);
			this._canvas.width = availWidth;
			this._canvas.height = height;
			this._lastRatio = ratio;

			this.redraw();
		}
	}

	/**
	 * Redraw.
	 */
	redraw() {
		this._ctx.drawImage(this._img, 0, 0, IMAGES.layout.width, IMAGES.layout.height, 0, 0, this._canvas.width, this._canvas.height);
	}

	/**
	 * Draw key.
	 *
	 * @param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 */
	drawKey(tone, octave) {
		if (this._keyboardData) {
			this.redraw();

			let keyData = this._keyboardData.findByTone(tone, octave);

			if (keyData) {
				this._drawKey(keyData);
			}
		}
	}

	/**
	 * Draw multiple keys.
	 *
	 * @param   {Array}  keys Array of objects { tone, octave }
	 */
	drawKeys(keys) {
		if (this._keyboardData) {
			this.redraw();

			keys.forEach(item => {
				let keyData = this._keyboardData.findByTone(item.tone, item.octave);

				if (keyData) {
					this._drawKey(keyData);
				}
			});
		}
	}

	/**
	 * Draw key from data.
	 *
	 * @param   {Object}  keyData See keyboardData.getKey output
	 */
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
					// left
					case "C":
					case "F":
						w *= 0.6;
						break;

					// middle
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

					// right
					case "E":
					case "B":
						w *= 0.6;
						startX += keyData.width * 0.4;
						break;
				}

				// top part
				this._ctx.fillRect(startX, keyData.y, w, newY - keyData.y);
				// bottom part
				this._ctx.fillRect(keyData.x, find.y + find.height, keyData.width, height);
			}
			else {
				this._ctx.fillRect(keyData.x, keyData.y, keyData.width, keyData.height);
			}
		}
	}

	/**
	 * Draw outline of all keys - for testing purpose.
	 */
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
