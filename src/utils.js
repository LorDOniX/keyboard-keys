import Tone from "tone";
import { TONES, ALL_TONES_SHARP, CHORDS_RULES, CHORDS_KEYS, KEYS_SIGNATURES, KEYS_SIGNATURES_OBJ, FLAT_TO_SHARP_MAPPING, KEYBOARD_RANGE, GUITAR_TONES, BLACK_KEY_MAPPING, C_DUR } from "conf";

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
 * Generate chord tones.
 *
 * @param   {Tone}  tone Chord main tone and start octave
 * @param   {String}  key  Major, minor, etc...
 * @return  {Array[Tone]}
 */
export function generateChord(tone, key = CHORDS_KEYS[0]) {
	let rules = CHORDS_RULES[key];
	let noteInd = ALL_TONES_SHARP.indexOf(tone.tone);
	let chordNotes = [];

	for (let i = 0; i < rules.length; i++) {
		let curNoteInd = noteInd + rules[i];
		let curOctave = tone.octave;

		if (curNoteInd > ALL_TONES_SHARP.length - 1) {
			curNoteInd -= ALL_TONES_SHARP.length;
			curOctave++;
		}

		chordNotes.push(new Tone(ALL_TONES_SHARP[curNoteInd], curOctave));
	}

	return chordNotes;
};

/**
 * Get random simple tone.
 *
 * @return  {Tone}
 */
export function randomTone() {
	let ind = Math.floor(Math.random() * (TONES.length - 1));
	return TONES[ind];
};

/**
 * Set tone to signature.
 *
 * @param   {Object}  signature Signature object
 * @param   {Tone}  toneArg Input tone
 * @return  {Tone}
 */
export function toneToSignature(signature, toneArg) {
	let tone = toneArg.simple;
	let octave = toneArg.octave;

	if (signature.key == "#" && signature.count > 0) {
		let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
		let ind = cDur.tones.indexOf(tone);
		let sigTone = signature.tones[ind];

		if (sigTone != toneArg.simple) {
			tone = sigTone;
		}
	}
	else if (signature.key == "b" && signature.count > 0) {
		// b, Cb => B a octave--
		let cDur = KEYS_SIGNATURES_OBJ[C_DUR];
		let ind = cDur.tones.indexOf(tone);
		let sigTone = signature.tones[ind];

		if (sigTone != tone) {
			tone = FLAT_TO_SHARP_MAPPING[sigTone].tone;
			octave += FLAT_TO_SHARP_MAPPING[sigTone].octave;
		}
	}

	return new Tone(tone, octave);
};

/**
 * Generate notes.
 * 
 * @param {Tone} startTone
 * @param {Tone} endTone
 * @param {Boolean} [fullRange] Use simple or full sharp tones?
 */
export function generateTones(startTone, endTone, fullRange) {
	// generate notes
	let octave = Math.min(startTone.octave, endTone.octave);
	let endOctave = Math.max(startTone.octave, endTone.octave);
	let source = fullRange ? ALL_TONES_SHARP : TONES;
	let toneInd = source.indexOf(startTone.tone);
	let endToneInd = source.indexOf(endTone.tone);
	let minToneInd = source.indexOf(KEYBOARD_RANGE[0].tone);
	let maxToneInd = source.indexOf(KEYBOARD_RANGE[1].tone);
	let allTones = [];

	while (true) {
		let insert = true;

		if (toneInd < minToneInd && octave == KEYBOARD_RANGE[0].octave) {
			insert = false;
		}
		if ((toneInd > endToneInd && octave == endOctave) || (toneInd > maxToneInd && octave == KEYBOARD_RANGE[1].octave)) {
			break;
		}

		if (insert) {
			allTones.push(new Tone(source[toneInd], octave));
		}

		toneInd++;

		if (toneInd == source.length) {
			toneInd = 0;
			octave++;
		}
	}

	return allTones;
};

/**
 * Generate all strings tones.
 *
 * @param   {Number}  stringsCount Strings count
 * @param   {Number}  fretsCount  Frets count
 * @param   {Array[Int]}  config Object - configuration per line, diff to standard tuning
 *
 * @return  {Array[Array[Object]]
 */
export function generateStrings(stringsCount, fretsCount, config) {
	let strings = [];

	for (let i = 0, max = Math.min(GUITAR_TONES.length, stringsCount); i < max; i++) {
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

		for (let x = 0; x < fretsCount; x++) {
			let tone = ALL_TONES_SHARP[ind];
			string.push({
				tone: new Tone(tone, octave),
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
 * Get signature tones.
 *
 * @param   {String}  signatureName
 * @param   {Number}  octave Start octave
 * @return  {Array[Tone]}
 */
export function getSignatureTones(signatureName, octave) {
	let value = KEYS_SIGNATURES.filter(i => i.name == signatureName);

	if (value.length) {
		let item = value[0];
		
		return {
			msg: item.tones.join(", "),
			tones: item.tones.map(i => {
				if (item.key == "b" && i.indexOf("b") != -1) {
					return new Tone(FLAT_TO_SHARP_MAPPING[i].tone, octave + FLAT_TO_SHARP_MAPPING[i].octave);
				}
				else return new Tone(i, octave);
			})
		};
	}

	return null;
};

/**
 * Black key position to the input tone.
 *
 * @param   {Tone}  tone Input tone
 * @return  {BLACK_KEY_MAPPING}
 */
export function blackKeyPosition(tone) {
	if (!tone.isSharp) {
		return BLACK_KEY_MAPPING[tone.simple];
	}
	else return null;
};
