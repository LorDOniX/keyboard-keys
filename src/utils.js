import { Note, GUITAR_NOTES } from "note";
import { ALL_NOTES_SHARP, KEYS_SIGNATURES, FLAT_TO_SHARP_MAPPING } from "conf";

/**
 * Get image from src.
 *
 * @param   {String}  src Path to image
 * @return  {Image}
 */
export function getImage(src) {
	return new Promise((resolve, reject) => {
		let img = new Image();
		img.addEventListener("load", e => {
			resolve(img);
		});
		img.addEventListener("error", e => {
			reject(e);
		});
		img.src = src;
	})
}

/**
 * Create dom element from config.
 *
 * @param   {Object}  config
 * @param   {Object}  [exported] For DOM references "_export"
 * @return  {Element}
 */
export function domCreate(config, exported) {
	let el = document.createElement(config.el || "div");

	for (let key in config) {
		let val = config[key];
		
		switch (key) {
			case "el": break;
			case "text": el.textContent = val; break;
			case "html": el.innerHTML = val; break;
			case "_export": exported[val] = el; break;
			case "class":
					if (!Array.isArray(val)) {
						val = [val];
					}
					val.forEach(className => {
						if (className) {
							el.classList.add(className);
						}
					});
				break;
			case "child": case "children":
				if (!Array.isArray(val)) {
					val = [val];
				}
				val.forEach(ch => {
					if (ch === null) return;
					
					if (typeof ch == "string") {
						el.appendChild(document.createTextNode(ch));
					}
					else if (ch instanceof HTMLElement || ch instanceof SVGElement){
						el.appendChild(ch);
					}
					else {
						el.appendChild(domCreate(ch, exported));
					}
				});
				break;
			default:
				if (key.substr(0, 2) == "on" && typeof val === "function") {
					el.addEventListener(key.substr(2), val);
				}
				else if (val != null) {
					el.setAttribute(key, val);
				}
				else if (val == null) {
					el.setAttribute(key, "");
				}
		}
	}

	return el;
};

/**
 * Generate all strings notes.
 *
 * @param   {Number}  stringsCount Strings count
 * @param   {Number}  fretsCount  Frets count
 * @param   {Array[Int]}  config Object - configuration per line, diff to standard tuning
 *
 * @return  {Array[Array[Object]]
 */
export function generateStrings(stringsCount, fretsCount, config) {
	let strings = [];

	for (let i = 0, max = Math.min(GUITAR_NOTES.length, stringsCount); i < max; i++) {
		let stringData = GUITAR_NOTES[i];
		let string = [];
		let ind = ALL_NOTES_SHARP.indexOf(stringData.startNote.note) + config[config.length - 1 - i];
		let octave = stringData.startNote.octave;
		let maxLen = ALL_NOTES_SHARP.length;

		if (ind < 0) {
			ind += maxLen;
			octave--;
		}
		else if (ind >= maxLen) {
			ind -= maxLen;
			octave++;
		}

		for (let x = 0; x < fretsCount; x++) {
			let note = ALL_NOTES_SHARP[ind];
			string.push({
				note: new Note(note, octave),
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
};

/**
 * Get signature notes.
 *
 * @param   {String}  signatureName
 * @param   {Number}  octave Start octave
 * @return  {Array[Note]}
 */
export function getSignatureNotes(signatureName, octave) {
	let value = KEYS_SIGNATURES.filter(i => i.name == signatureName);

	if (value.length) {
		let item = value[0];
		
		return {
			msg: item.notes.join(", "),
			notes: item.notes.map(i => {
				if (item.key == "b" && i.indexOf("b") != -1) {
					return new Note(FLAT_TO_SHARP_MAPPING[i].note, octave + FLAT_TO_SHARP_MAPPING[i].octave);
				}
				else return new Note(i, octave);
			})
		};
	}

	return null;
};
