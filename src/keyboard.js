import Resources from "./resources";
import KeyboardData from "keyboard-data";
import { IMAGES, BLACK_KEY_POSITION } from "conf";
import { blackKeyPosition } from "utils";

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
			this._canvasClick(e);
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
	 * Reset - show keyboard.
	 */
	show() {
		this.syncPort();
		this.redraw();
	}

	/**
	 * Draw tone.
	 *
	 * @param   {Tone}  tone  C...
	 */
	drawTone(tone) {
		if (this._keyboardData) {
			this.redraw();
			this._drawTone(this._keyboardData.findByTone(tone));
		}
	}

	/**
	 * Draw multiple tones.
	 *
	 * @param   {Array}  keys Array of Tone
	 */
	drawTones(tones) {
		if (this._keyboardData) {
			this.redraw();

			tones.forEach(tone => {
				this._drawTone(this._keyboardData.findByTone(tone));
			});
		}
	}

	/**
	 * Draw key from data.
	 *
	 */
	_drawTone(keyData) {
		if (!keyData) return;

		this._ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

		if (keyData.isBlack) {
			this._ctx.fillRect(keyData.x, keyData.y, keyData.width, keyData.height);
		}
		else {
			let bkp = blackKeyPosition(keyData.tone);

			if (bkp !== null) {
				let blackKey = this._keyboardData.firstBlackKey;
				let newY = blackKey.y + blackKey.height;
				let bottomY = keyData.y + keyData.height;
				let height = bottomY - newY;
				let w = keyData.width;
				let startX = keyData.x;

				switch (bkp) {
					case BLACK_KEY_POSITION.right:
						w *= 0.6;
						break;

					case BLACK_KEY_POSITION.middle:
						if (keyData.octave == 0) {
							w *= 0.6;
						}
						else {
							w *= 0.3;
							startX += (keyData.width * 0.7) / 2;
						}
						
						break;

					case BLACK_KEY_POSITION.left:
						w *= 0.6;
						startX += keyData.width * 0.4;
						break;
				}

				// top part
				this._ctx.fillRect(startX, keyData.y, w, newY - keyData.y);
				// bottom part
				this._ctx.fillRect(keyData.x, newY, keyData.width, height);
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

	/**
	 * Click on canvas.
	 *
	 * @param   {MouseEvent}  e Click
	 */
	_canvasClick(e) {
		let x = e.layerX;
		let y = e.layerY;

		if (this._keyboardData) {
			let keyData = this._keyboardData.getKey(x, y);

			if (keyData) {
				this.redraw();
				this._drawTone(keyData);
				if (typeof this._onKey === "function") this._onKey(keyData);
			}
		}
	}
}

export default Keyboard;
