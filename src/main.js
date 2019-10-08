import Learn from "./learn";
import Game from "./game";
import GameNames from "./game-names";
import { domCreate } from "utils";

class Main {
	constructor() {
		this._learn = new Learn();
		this._game = new Game();
		this._gameNames = new GameNames();
		this._active = null;
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

		this._init();
	}

	async _init() {
		await this._learn.load();
		await this._game.load();
		this._setActive(this._tabsData[0].name);
	}

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
			}
		});
	}
};

new Main();
