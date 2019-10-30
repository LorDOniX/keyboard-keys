const DURATION = "8n";

class KeyboardSound {
	constructor() {
		this._synth = null;
		this._enabled = true;
	}

	set enable(state) {
		this._enabled = state;
	}

	init() {
		this._synth = new window.Tone.Synth().toDestination();
	}

	playNote(note) {
		if (!this._enabled) return;
		
		this._synth.triggerAttackRelease(note.toString(), DURATION);
	}
}

export default new KeyboardSound();
