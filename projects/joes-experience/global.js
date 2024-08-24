const τ = 2*Math.PI

function something(x, fallback) {
	return x === undefined ? fallback : x
}

function rand(a, b) {
	if (a === undefined) return Math.random()
	else if (b === undefined) return a*Math.random()
	else return (b - a)*Math.random() + a
}

CanvasRenderingContext2D.prototype.circle = function(x, y, r) {
	this.arc(x, y, r, 0, τ)
}

CanvasRenderingContext2D.prototype.fillCircle = function(x, y, r) {
	this.beginPath()
	this.arc(x, y, r, 0, τ)
	this.fill()
}



class Layer {
	constructor(ctx, options={}) {
		this.ctx = ctx
		Object.assign(this, options)
	}

	draw() {
		this.ctx.save()
		this.drawing(...arguments)
		this.ctx.restore()
	}

	set(obj) {
		Object.assign(this, obj)
		return this
	}

	defaults(obj) {
		for (let key in obj) {
			if (!(key in this)) this[key] = obj[key]
		}
	}
}


class Canvas extends Layer {
	constructor(canvasEl) {
		let ctx = canvasEl.getContext('2d', {alpha: true})
		super(ctx)
		this.canvasEl = canvasEl
		this.shortestEdge = Math.min(this.canvasEl.width, this.canvasEl.height)
		this.scale = 1
		this.R = this.size()/2
		this.fader = 1
		this.fadeRate = 1e-3
		this.canvasEl.style.opacity = 0
		this.timeDelta = 0
		this.timeDeltaMomentum = 0
	}

	size() {
		return this.shortestEdge/this.scale
	}

	draw(t, Δt) {
		let α = Number(this.canvasEl.style.opacity)
		let Δα = this.fader - α
		this.canvasEl.style.opacity = α + Δα*Δt*this.fadeRate
		if (α < 1e-3) this.onFadeOut()

		this.ctx.resetTransform()
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
		this.ctx.translate(this.ctx.canvas.width/2, this.ctx.canvas.height/2)
		this.ctx.scale(this.scale, this.scale)

		this.timeDelta += this.timeDeltaMomentum
		this.timeDeltaMomentum *= 0.9
		t += this.timeDelta
		this.drawing(t, Δt)
	}

	drawing() {}

	onFadeOut() {}
}

class RadialGradient extends Layer {
	constructor(ctx, gradient) {
		super(...arguments)
		this.makeGradient()
		this.size = this.ctx.canvas.width
	}

	makeGradient() {
		this.glowGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.R)
		for (let i in this.gradient.stops) {
			this.glowGradient.addColorStop(i, this.gradient.stops[i].toHex())				
		}
	}

	drawing() {
		this.ctx.resetTransform()
		this.ctx.translate(this.size/2, this.size/2)
		this.ctx.fillStyle = this.glowGradient
		this.ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size)
	}
}

class Glow extends RadialGradient {
	constructor(ctx, color, R) {
		super(ctx, {
			R,
			gradient: new Gradient({
				0: color,
				1: '#0000',
			})
		})
	}
}


class Controller {
	constructor(ctx) {
		this.ctx = ctx
		this.t = 0
		this.speed = 1e-1

		this.canvases = {}
	}

	draw(Δt=0) {
		Object.values(this.canvases).forEach(canvas => canvas.draw(this.t, Δt))		
	}

	loop(timestamp) {
		let Δt = (timestamp - this.prev_timestamp)*this.speed
		this.t += Δt

		this.draw(Δt)
		if (this.looping) {
			window.requestAnimationFrame(timestamp => this.loop(timestamp))
		}
		this.prev_timestamp = timestamp
	}

	start() {
		this.looping = true
		this.prev_timestamp = performance.now()
		window.requestAnimationFrame(timestamp => this.loop(timestamp))
	}

	stop() {
		this.looping = false
	}

	toggle() {
		this.looping ? this.stop() : this.start()
	}
}
