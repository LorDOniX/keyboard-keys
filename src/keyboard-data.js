import { TONES, HALF_TONES, OCTAVES } from "conf";

// key definitions - mapping to image
const WHITE_KEY = {
	height: 292,
	x: 18,
	y: 17,
	startPosition: [34, 33],
	repeat: [34, 33, 33, 34, 33, 34, 33]
};

const BLACK_KEY = {
	width: 26,
	height: 162,
	x: 38,
	y: 17,
	startPosition: [38, 105],
	repeat: [34, 67, 33, 34, 66]
};

class KeyboardData {
	/**
	 * Ratio - for image resize.
	 *
	 * @param   {Number}  ratio = 1
	 */
	constructor(ratio = 1) {
		this._ratio = ratio;
		this._white = [];
		this._black = [];

		this._setWhite();
		this._setBlack();
	}

	/**
	 * Get white keys.
	 *
	 * @return  {Array}
	 */
	get white() {
		return this._white;
	}

	/**
	 * Get black keys.
	 *
	 * @return  {Array}
	 */
	get black() {
		return this._black;
	}

	/**
	 * Get key on position
	 * 
	 * @param {Number} x Position on axis x
	 * @param {Number} y Position on axis y
	 * @return  {Object}
	 */
	getKey(x, y) {
		// search in black, then in white
		let find = null;

		for (let blackKey of this._black) {
			if (blackKey.bboxTest(x, y)) {
				find = blackKey;
				break;
			}
		}

		if (!find) {
			for (let whiteKey of this._white) {
				if (whiteKey.bboxTest(x, y)) {
					find = whiteKey;
					break;
				}
			}
		}

		return find;
	}

	/**
	 * Find tone by tone and octave
	 *
	 * @param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 * @return  {Object}
	 */
	findByTone(tone, octave) {
		let isBlack = false;
		let isSharp = false;

		if (tone.length > 1) {
			isSharp = tone.indexOf("#") != -1;
			isBlack = true;
		}

		let source = isBlack ? this._black : this._white;
		let tones = source.filter(i => {
			let itemTone = isBlack ? i.tone[isSharp ? 0 : 1] : i.tone;
			
			return (itemTone == tone && i.octave == octave);
		});

		return (tones.length ? tones[0] : null);
	}

	/**
	 * Set white keys.
	 */
	_setWhite() {
		let lastX = WHITE_KEY.x;
		let octave = 0;

		// start
		this._white.push(this._getItem(lastX, WHITE_KEY.y, WHITE_KEY.startPosition[0], WHITE_KEY.height, false, TONES[5], octave));
		lastX += WHITE_KEY.startPosition[0];
		this._white.push(this._getItem(lastX, WHITE_KEY.y, WHITE_KEY.startPosition[1], WHITE_KEY.height, false, TONES[6], octave));
		lastX += WHITE_KEY.startPosition[1];

		// octaves
		for (let i = 0; i < OCTAVES; i++) {
			octave++
			WHITE_KEY.repeat.forEach((key, ind) => {
				this._white.push(this._getItem(lastX, WHITE_KEY.y, key, WHITE_KEY.height, false, TONES[ind], octave));
				lastX += key;
			});
		}

		octave++
		this._white.push(this._getItem(lastX, WHITE_KEY.y, WHITE_KEY.startPosition[0], WHITE_KEY.height, false, TONES[0], octave));
	}

	/**
	 * Set black keys.
	 */
	_setBlack() {
		let octave = 0;

		// start
		this._black.push(this._getItem(BLACK_KEY.startPosition[0], BLACK_KEY.y, BLACK_KEY.width, BLACK_KEY.height, true, HALF_TONES[4], octave));
		let lastX = BLACK_KEY.startPosition[1];

		// octaves
		for (let i = 0; i < OCTAVES; i++) {
			octave++
			BLACK_KEY.repeat.forEach((key, ind) => {
				this._black.push(this._getItem(lastX, BLACK_KEY.y, BLACK_KEY.width, BLACK_KEY.height, true, HALF_TONES[ind], octave));
				lastX += key;
			});
		}
	}

	/**
	 * Get item on position.
	 *
	 * @param {Number} x Position on axis x
	 * @param {Number} y Position on axis y
	 * @param   {Number}  width  Area width
	 * @param   {Number}  height Area height
	 * @param   {Boolean}  isBlack Is key black?
	 * @param   {String}  tone  C...
	 * @param   {Number}  octave 0-8
	 * @return  {Object}
	 */
	_getItem(x, y, width, height, isBlack, tone = "", octave = 0) {
		x *= this._ratio;
		y *= this._ratio;
		width *= this._ratio;
		height *= this._ratio;

		return {
			x, y, width, height, isBlack, tone, octave,
			id: `${Array.isArray(tone) ? tone.join("") : tone}${octave}`,
			idSharp: `${Array.isArray(tone) ? tone[0] : tone}${octave}`,
			bboxTest: (testX, testY) => {
				return (testX >= x && testX <= x + width && testY >= y && testY <= y + height);
			}
		};
	}
}

export default KeyboardData;
