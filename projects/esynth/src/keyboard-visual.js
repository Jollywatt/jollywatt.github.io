function createSVGEl(tag, attributes) {
	let el = document.createElementNS("http://www.w3.org/2000/svg", tag)
	for (const attr in attributes) {
		el.setAttribute(attr, attributes[attr])
	}
	return el
}

class KeyboardVisual {
	constructor(svgEl, layout) {
		this.svgEl = svgEl
		this.layout = layout
		this.keyEls = {}

		this.constructGraphic()
	}

	constructGraphic() {
		let totalWidth  = Math.max(...Object.values(this.layout).map(k => k.position[0] + k.size[0]))
		let totalHeight = Math.max(...Object.values(this.layout).map(k => k.position[1] + k.size[1]))
		this.svgEl.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`)

		for (const keyCode in this.layout) {
			const key = this.layout[keyCode]

			let keyEl = createSVGEl('rect', {
				x:	key.position[0],
				y:	key.position[1],
				width:	key.size[0],
				height:	key.size[1],
			})
			keyEl.classList.add('key-icon')
			this.svgEl.appendChild(keyEl)

			let textEl = createSVGEl('text', {
				x: key.position[0] + key.size[0]/2,
				y: key.position[1] + key.size[1]/2,
				'font-size': .5,
				'text-anchor': 'middle',
				'alignment-baseline': 'central',
			})
			textEl.textContent = key.label
			this.svgEl.appendChild(textEl)

			this.keyEls[keyCode] = {keyEl, textEl}
		}
	}

	colorKeys(map) {
		for (const keyCode in this.keyEls) {
			const color = map(keyCode)
			const {keyEl, textEl} = this.keyEls[keyCode]
			const textColor = color.visualBrightness() > 0.3 ? 'black' : 'white'
			keyEl.style.fill = color.toCSS()
			textEl.style.fill = textColor

		}
	}


}
