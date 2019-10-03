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
