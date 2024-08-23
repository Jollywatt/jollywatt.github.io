class Color {
	constructor(obj) {
		Object.assign(this, {r: 0, g: 0, b: 0, a: 0xff})
		switch (typeof obj) {
			case 'string': return Color.parse(obj)
			case 'number': throw "numbers suck for colors"
			case 'object': {
				if (obj.constructor === Array) return Color.fromArray(obj)
				else Object.assign(this, obj)
			}
		}
	}

	static _proxyCanvas = (() => {
		let canvas = document.createElement('canvas')
		canvas.width = canvas.height = 1
		return canvas
	})()
	static _proxyCtx = Color._proxyCanvas.getContext('2d')

	static fromArray(array) {
		let color = new Color()
		color.r = array[0]
		color.g = array[1]
		color.b = array[2]
		if (array.length > 3) color.a = array[3]
		return color
	}

	// static fromHex(hex, a=1) {
	// 	return new Color({
	// 		r: (hex&0xff0000)/0x10000,
	// 		g: (hex&0x00ff00)/0x00100,
	// 		b: (hex&0x0000ff)/0x00001,
	// 		a,
	// 	})
	// }

	static parse(string) {
		if (typeof string === 'number') string = `#${string.toString(16).padStart(8, '0')}`
		const ctx = Color._proxyCtx
		ctx.clearRect(0, 0, 1, 1)
		ctx.fillStyle = 'black'
		ctx.fillStyle = string
		let computed = ctx.fillStyle
		ctx.fillStyle = 'white'
		ctx.fillStyle = string
		if (computed !== ctx.fillStyle) throw `invalid color: ${string}`
		ctx.fillRect(0, 0, 1, 1)
		return Color.fromArray(ctx.getImageData(0, 0, 1, 1).data)
	}

	toHex() {
		/* Returns color as eight-digit hex code; #rrggbbaa. */
		const c = x => ('0'+(~~x).toString(16)).slice(-2)
		return '#' + c(this.r) + c(this.g) + c(this.b) + c(this.a)
	}

	copy() {
		let color = new Color()
		Object.assign(color, this)
		return color
	}

}

class Gradient {
	/* Simple color ramp with multiple colors at different color ‘stops’. */
	constructor(stops) {
		this.stops = stops
		for (var i in this.stops) {
			if (this.stops[i].constructor !== Color)
				this.stops[i] = new Color(this.stops[i])

		}
		this.stopKeys = Object.keys(this.stops).map(Number).sort((a, b) => a - b)
	}

	colorAt(x) {
		/* Return the color of a point along the gradient,
		   by linearly interpolating between the bounding color stops. */

		// Find the color stops immediately above or below the point
		for (var i = 0; this.stopKeys[i] < x && i < this.stopKeys.length; i++) continue
		var upper = +this.stopKeys[i]
		var lower = +this.stopKeys[i - 1]

		// Points outside the gradient are clamped to the nearest stop
		if (isNaN(upper)) return this.stops[lower].copy()
		if (isNaN(lower)) return this.stops[upper].copy()

		// Calculate the blending ratio
		var ratio = (x - lower)/(upper - lower)
		var blendedColor = new Color()
		for (var component in blendedColor) blendedColor[component] = (
			this.stops[upper][component]*ratio +
			this.stops[lower][component]*(1 - ratio)
		)
		return blendedColor
	}
}

class Complex {
	constructor(re, im) {
		this.re = re
		this.im = im
	}

	add(that) {
		return new Complex(this.re + that.re, this.im + that.im)
	}

	mul(that) {
		return new Complex(this.re*that.re - this.im*that.im, this.re*that.im + this.im*that.re)
	}
}