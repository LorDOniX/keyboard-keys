export default class Tone {
	/**
	 * Create a new tone.
	 *
	 * @param   {String}  tone Tone or whole configuration like C#6
	 * @param   {Number}  [octave] Octave
	 */
	constructor(tone, octave) {
		this._tone = "";
		this._simple = "";
		this._octave = 0;
		this._isSharp = false;

		if (typeof tone === "string" && typeof octave === "undefined") {
			// parsovani
			let m = tone.match(/([C,D,E,F,G,A,B])(#?)([0-9])/);
			
			if (m) {
				this._tone = m[1] + m[2];
				this._simple = m[1];
				this._isSharp = m[2] == "#";
				this._octave = parseFloat(m[3]);
			}
		}
		else if (typeof tone === "string" && typeof octave === "number") {
			this._tone = tone;
			this._octave = octave;
			this._isSharp = tone.indexOf("#") != -1;
			this._simple = this._isSharp ? this._tone.replace("#", "") : this._tone;
		}
	}

	/**
	 * Get full tone like C#
	 *
	 * @return  {String}
	 */
	get tone() {
		return this._tone;
	}

	/**
	 * Get simple tone like C# -> C
	 *
	 * @return  {String}
	 */
	get simple() {
		return this._simple;
	}

	/**
	 * Get tone octave.
	 *
	 * @return  {Number}
	 */
	get octave() {
		return this._octave;
	}

	/**
	 * Is tone sharp? C# true, C false
	 *
	 * @return  {Boolean}
	 */
	get isSharp() {
		return this._isSharp;
	}

	/**
	 * Clone tone.
	 *
	 * @return  {Tone}
	 */
	clone() {
		return new Tone(this._tone, this._octave);
	}

	/**
	 * To string override.
	 *
	 * @return  {String}
	 */
	toString() {
		return `${this._tone}${this._octave}`;
	}

	/**
	 * Is tone equal to another tone?
	 *
	 * @param   {Tone}  tone Tone to compare
	 * @return  {Boolean}
	 */
	equal(tone) {
		return (tone.tone == this._tone && tone.octave == this._octave);
	}

	/**
	 * Get middle C tone.
	 *
	 * @return  {Tone}
	 */
	static middleC() {
		return new Tone("C", 4);
	}
}
