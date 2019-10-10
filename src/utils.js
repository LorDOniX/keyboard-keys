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
