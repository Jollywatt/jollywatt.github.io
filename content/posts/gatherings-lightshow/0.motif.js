class Poster extends Canvas {
	constructor(canvas) {
		super(canvas)
		this.solarSystem = new SolarSystem(this.ctx, {
			R: 200,
		})
		let actualR = this.size()/2
		this.scale = actualR/250
		this.tilt = 0
	}

	drawing(t, Δt) {
		this.tilt = 0.3*(1 - Math.cos(t*1e-4))

		// this.ctx.globalCompositeOperation = 'destination-over'

		this.ctx.transform(1, 0, 0, Math.cos(this.tilt), 0, 0)
		this.solarSystem.draw(t)

		this.ctx.save()
		this.ctx.lineWidth = 3
		this.ctx.strokeStyle = 'white'
		this.ctx.translate(0, -60*Math.sin(this.tilt))
		this.ctx.beginPath()
		this.ctx.arc(0, 0, 40, 0, τ)
		this.ctx.stroke()

		this.ctx.globalCompositeOperation = 'destination-over'
		this.ctx.lineCap = 'round'

		this.ctx.moveTo(0, 0)
		this.ctx.lineTo(0, 250*Math.sin(this.tilt))
		this.ctx.stroke()


		this.ctx.translate(0, 250*Math.sin(this.tilt))
		this.ctx.beginPath()
		this.ctx.moveTo(0, 0)
		this.ctx.lineTo(0, -50)
		this.ctx.arc(0, 0, 50, -τ/4, 0.95*τ*3/4)
		// this.ctx.fillStyle = 'yellow'
		// this.ctx.fill()
		this.ctx.clip()

		this.ctx.beginPath()
		this.ctx.arc(0, 0, 35, 0, τ)
		this.ctx.stroke()
		this.ctx.restore()
	}
}


class Planet extends Layer {
	constructor() {
		super(...arguments)
		this.defaults({
			R: 20,
			orbit: 150,
			color: '#ff501b',
			ω: 1e-3,
			outline: false,
			cresent: false,
			eclipse_ω: 1e-4,
		})
		this.defaults({
			x: t => this.orbit*Math.sin(this.ω*t + this.φ),
		})
		this.defaults({
			φ: this.R
		})
	}

	drawing(t) {
		let x = this.x(t)
		this.ctx.translate(x, 0)

		if (this.cresent) { // cresent clipping mask
			this.ctx.beginPath()
			this.ctx.arc(2*this.R*Math.sin(t*this.eclipse_ω), 0, this.R, 0, τ)
			this.ctx.rect(this.R, -this.R, -200, 200)
			this.ctx.clip()
		}

		this.ctx.fillStyle = this.color 
		this.ctx.strokeStyle = this.color
		this.ctx.lineWidth = 2

		this.ctx.beginPath()
		this.ctx.circle(0, 0, this.R)

		if (this.outline) this.ctx.stroke()
		else this.ctx.fill()
	}
}


class SolarSystem extends Layer {
	constructor() {
		super(...arguments)
		this.defaults({
			R: 200,
			ω: 2e-4,
			line: true,
		})

		let ctx = this.ctx
		let brown_ω = 5e-4
		this.planets = [
			new Planet(ctx, {R: 10}),
			new Planet(ctx, {R: 5, color: 'white'}),
			new Planet(ctx, {R: 40, x: () => 0}),
			new Planet(ctx, {R: 30, color: '#ad8277', ω: brown_ω, φ: 0}),
			new Planet(ctx, {R: 20, cresent: true, color: '#ad8277', ω: brown_ω, φ: τ/2}),
		]
		let moon = new Planet(ctx, {R: 25, cresent: true})
		this.planets.forEach(planet => {
			planet.orbit = this.R
		})
		let shadow = new Planet(ctx, {R: 25, outline: true, ω: moon.ω, φ: moon.φ, orbit: 0.8*moon.orbit})
		this.planets.push(moon, shadow)
	}
	drawing(t) {
		this.ctx.rotate(this.ω*t)
		this.ctx.globalCompositeOperation = 'lighter'
		this.planets.forEach(planet => planet.draw(t))

		this.ctx.globalCompositeOperation = 'destination-over'

		this.ctx.strokeStyle = 'white'

		this.ctx.lineWidth = 1.5
		this.ctx.globalAlpha = 0.5

		if (this.circumference) {
			this.ctx.beginPath()
			this.ctx.circle(0, 0, this.R)
			this.ctx.stroke()
		}

		if (this.line) {
			this.ctx.beginPath()
			this.ctx.moveTo(-this.R, 0)
			this.ctx.lineTo(+this.R, 0)
			this.ctx.stroke()
		}

	}
}
