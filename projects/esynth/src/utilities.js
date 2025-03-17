class EventEmitter {
	/* Simple event subscription system. Assign listeners with on() and
	   trigger events with trigger(). Listeners which return false stop
	   any remaining listeners from being triggered.
	   If instances possess a method `onName`, then it will be treated
	   as a listener for `name` events.
		*/

	constructor() {
		this.listeners = {}
	}

	on(event, callback) {
		if (this.listeners[event] === undefined) this.listeners[event] = []
		this.listeners[event].push(callback)
	}

	trigger(event, ...args) {
		if (event !== '*') {
			const methodName = event.replace(/^./, s => `on${s.toUpperCase()}`)
			if (this[methodName]?.(...args) === false) return false
		}

		const callbacks = this.listeners[event] || []
		for (let i = 0; i < callbacks.length; i++) {
			if (callbacks[i](...args) === false) return false
		}

		if (event !== '*') this.trigger('*', event, ...args)
	}

	triggerOn(object, event) {
		if (event === undefined) {
			object.on('*', (event, ...args) => this.trigger(event, ...args))
		} else object.on(event, (...args) => this.trigger(event, ...args))
	}
}


function el(tag, ...children) {
	const element = document.createElement(tag)
	children.forEach(child => {
		if (child.constructor === String) child = document.createTextNode(child)
		element.appendChild(child)
	})
	return element
}

function span(...children) {
	return el('span', ...children)
}

// add useful clear method to canvas context
if (CanvasRenderingContext2D.prototype.clear === undefined) {
	CanvasRenderingContext2D.prototype.clear = function() {
		this.save()
		this.setTransform(1, 0, 0, 1, 0, 0)
		this.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.restore()
	}
}


function nearestRational(x, {rtol=1e-2, maxDenom=100}={}) {
	for (let d = 0; d < maxDenom; d++) {
		const n = Math.round(x*d)
		const ratio = n/d
		if ((ratio > x ? ratio/x : x/ratio) <= 1 + rtol) {
			return math.fraction({n, d})
		}
	}
}


function theme(property) {
	return getComputedStyle(document.documentElement).getPropertyValue(property)
}


function nearestRational(x, maxDenom=12) {
	const denoms = math.range(1, maxDenom + 1)
	const rationals = denoms.map(d => math.fraction(math.round(x*d), d))
	let best = NaN
	rationals.forEach(rational => {
		// !(a >= b) is equivalent to a < b except for the treatment of NaN
		if (!(math.abs(rational - x) >= math.abs(best - x))) best = rational
	})
	return best

}