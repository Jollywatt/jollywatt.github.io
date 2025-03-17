function clamp(x, min, max) {
	return x < min ? min : x > max ? max : x
}

class Color {
	constructor(arg) {
		this.components = {a: 1}
		if (arg.constructor === String) this.fromHexString(arg)
		else if (arg.h !== undefined) this.fromHSVA(arg.h, arg.s, arg.v, arg.a)
		else if (arg.r !== undefined) this.fromRGBA(arg.r, arg.g, arg.b, arg.a)
		else throw TypeError(`invalid color constructor arguments ${arguments}`)
	}

	get r() { return this.components.r }
	get g() { return this.components.g }
	get b() { return this.components.b }
	get a() { return this.components.a }

	set r(value) { this.components.r = clamp(value, 0, 1) }
	set g(value) { this.components.g = clamp(value, 0, 1) }
	set b(value) { this.components.b = clamp(value, 0, 1) }
	set a(value) { this.components.a = clamp(value, 0, 1) }

	fromRGBA(r, g, b, a=1) {
		Object.assign(this, {r, g, b, a})
		;['r', 'g', 'b', 'a'].forEach(c => {
			this[c] = clamp(this[c], 0, 1)
		})
		return this
	}

	fromHexString(hexString) {
		const hex = hexString.match(/[0-9a-z]+/i)?.[0]
		if (hex === undefined) throw TypeError(`invalid hex string ${hexString}`)

		let slots, width
		switch (hex.length) {
			case 3:
				slots = 3
				width = 1
				break
			case 4:
				slots = 4
				width = 1
				break
			case 6:
				slots = 3
				width = 2
				break
			case 8:
				slots = 4
				width = 2
				break
			default:
				throw TypeError(`invalid hex color ${hexString}`)
		}

		for (let i = 0; i < slots; i++) {
			let digit = hex.slice(i*width, (i + 1)*width)
			while (digit.length < 2) digit += digit[0]
			this['rgba'[i]] = parseInt(digit, 16)/255
		}

		return this
	}

	fromHSVA(h, s, v, a=1) {
		s = clamp(s, 0, 1)
		v = clamp(v, 0, 1)
		const mod = (x, n) => (x % n + n) % n
		const env = k => Math.max(0, Math.min(1, Math.abs(mod(k, 6) - 3) - 1))
		const k = h/360*6
		this.r = (1 - s + s*env(k - 0))*v
		this.g = (1 - s + s*env(k - 2))*v
		this.b = (1 - s + s*env(k - 4))*v
		this.a = a
		return this

	}

	toCSS() {
		return `rgba(${255*this.r}, ${255*this.g}, ${255*this.b}, ${this.a})`
	}

	interpolateWith(color, t) {
		const mixed = new Color()
		;['r', 'g', 'b', 'a'].forEach(c => {
			mixed[c] = this[c]*(1 - t) + color[c]*t
		})
		return mixed
	}

	visualBrightness() {
		return 0.299*this.r + 0.587*this.g + 0.114*this.b
	}
}

class Gradient {
	constructor(colorStops) {
		this.colorStops = colorStops
		this.stops = Object.keys(colorStops).map(Number).sort((a, b) => Number(a) - Number(b))
	}

	colorAt(position) {
		/* Return the color of a point along the gradient,
		   by linearly interpolating between the bounding color stops. */

		// Find the color stops immediately above or below the point
		let i = 0
		while (i < this.stopKeys.length && this.stops[i] < position) i++
		const upper = this.stops[i]
		const lower = this.stops[i - 1]

		// Points outside the gradient are clamped to the nearest stop
		if (upper === undefined) return this.colorStops[lower]
		if (lower === undefined) return this.colorStops[upper]

		const interp = (position - lower)/(upper - lower)
		return this.colorStops[lower].interpolateWith(this.colorStops[upper])

	}
}

const COLORS = {
	gray: new Color('#777'),
	black: new Color('#000'),
}

const DETUNE_GRADIENT = new Gradient(
	[-1, 0, 1],
	[
		new Color('#f00'),
		new Color('#000'),
		new Color('#f00'),
	],
)

function colorFromFreq(freq) {
	const log2f = Math.log2(Math.abs(freq))
	const θ = log2f % 1
	const s = Math.pow(8/log2f, 5)
	const v = Math.pow(log2f/8, 5)
	const a = (freq - 50)/50 // fade out at low end
	return new Color({h: 360*θ, s, v, a})
}