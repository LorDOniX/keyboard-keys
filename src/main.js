import Learn from "./learn";
import Game from "./game";
import GameNames from "./game-names";
import { domCreate } from "./utils";
import Resources from "./resources";

class Main {
	/**
	 * Init point for the app.
	 */
	constructor() {
		this._learn = null;
		this._game = null;
		this._active = null;
		this._tabsData = null;

		this._init();
	}

	/**
	 * Async load resources.
	 */
	async _init() {
		await Resources.load();
		
		this._learn = new Learn();
		this._game = new Game();
		this._gameNames = new GameNames();
		this._tabsData = [{
			name: "Learn",
			inst: this._learn,
			el: this._learn.container
		}, {
			name: "Game",
			inst: this._game,
			el: this._game.container
		}, {
			name: "Game names",
			inst: this._gameNames,
			el: this._gameNames.container
		}];

		let tabs = document.getElementById("tabs");
		let tabContent = document.getElementById("tabContent");

		this._tabsData.forEach(i => {
			let tabOption = domCreate({
				el: "span",
				text: i.name,
				onclick: () => {
					this._setActive(i.name);
				}
			});
			i.tabEl = tabOption;
			tabs.appendChild(tabOption);
			tabContent.appendChild(i.el);
		});
		// def. tab
		this._setActive(localStorage.getItem("keyboardKeysTab") || this._tabsData[0].name);
	}

	/**
	 * Set active tab.
	 *
	 * @param   {String}  name Tab name
	 */
	_setActive(name) {
		this._tabsData.forEach(i => {
			i.el.classList[i.name == name ? "remove" : "add"]("hide");
			i.tabEl.classList[i.name == name ? "add" : "remove"]("active");

			if (i.name == name) {
				i.inst.show();
				
				if (this._active) {
					this._active.hide();
				}

				this._active = i.inst;
				localStorage.setItem("keyboardKeysTab", i.name);
			}
		});
	}
};

new Main();
