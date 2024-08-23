class Genesis extends Canvas {
	constructor(canvas) {
		super(canvas)
		this.solarSystem = new SolarSystem(this.ctx, {
			R: 200,
			line: false,
		})
		let actualR = this.size()/2
		this.scale = actualR/250
		this.tilt = 0

		this.glow = new Glow(this.ctx, 'orange', this.size()/2)

		this.particles = new Starfield(this.ctx)

	}

	drawing(t, Δt) {
		this.glow.draw()
		this.solarSystem.draw(t)
		this.particles.draw(t, Δt)
	}
}