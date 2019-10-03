import Keyboard from "keyboard";

class Main {
	constructor() {
		console.log("app start");

		this._keyboard = new Keyboard(document.getElementById("keyboard"));
	}
};

new Main();
