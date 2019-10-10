import { getImage } from "utils";
import { IMAGES } from "conf";

class Resources {
	/**
	 * Resources.
	 */
	constructor() {
		this._images = {};
	}

	/**
	 * Async load resources.
	 */
	async load() {
		// images load
		this._images.treble = await getImage(IMAGES.treble.src);
		this._images.bass = await getImage(IMAGES.bass.src);
		this._images.layout = await getImage(IMAGES.layout.src);
	}

	/**
	 * Get treble image.
	 *
	 * @return  {Image}
	 */
	get treble() {
		return this._images.treble;
	}

	/**
	 * Get bass image.
	 *
	 * @return  {Image}
	 */
	get bass() {
		return this._images.bass;
	}

	/**
	 * Get layout image.
	 *
	 * @return  {Image}
	 */
	get layout() {
		return this._images.layout;
	}
};

export default new Resources();
